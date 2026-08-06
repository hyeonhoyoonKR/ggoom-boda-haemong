"""RAGAS quality eval for the dream-interpretation RAG pipeline.

Builds a synthetic test set from the existing `dream_symbols` table, runs
each question through the real retrieval + generation pipeline, and scores
the results with RAGAS (faithfulness, answer relevancy, context precision,
context recall).

Requires:
  - `npm run dev` running locally (this script calls the real /api/interpret-dream)
  - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GROQ_API_KEY, HF_EMBED_URL,
    HF_EMBED_API_KEY, HF_TOKEN set in .env.local at the project root

Usage:
  pip install -r eval/requirements.txt
  python eval/run_ragas_eval.py [--n 10] [--app-url http://localhost:3000] [--seed 42]

  # or evaluate your own dream sentences instead of sampling dream_symbols:
  python eval/run_ragas_eval.py --question "어젯밤 하늘을 나는 꿈을 꿨어요." --question "이빨이 빠지는 꿈을 꿨어요."
  # (no ground-truth reference exists for freeform text, so context_precision/
  # context_recall won't be meaningful for these rows — faithfulness and
  # answer_relevancy still work fine)
"""

import argparse
import random
import re
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env.local")

import os  # noqa: E402

SUPABASE_URL = os.environ["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
GROQ_API_KEY = os.environ["GROQ_API_KEY"]
HF_EMBED_URL = os.environ["HF_EMBED_URL"].rstrip("/")
HF_EMBED_API_KEY = os.environ.get("HF_EMBED_API_KEY", "")
HF_TOKEN = os.environ.get("HF_TOKEN", "")

GROQ_MODEL = "openai/gpt-oss-120b"
MATCH_COUNT = 5
EMBED_TIMEOUT_S = 60

DREAM_CLAUSE_RE = re.compile(r"^(.*?꿈)")


def supabase_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
    }


def fetch_sample_rows(n: int, seed: int) -> list[dict]:
    count_res = requests.get(
        f"{SUPABASE_URL}/rest/v1/dream_symbols?select=id",
        headers={**supabase_headers(), "Prefer": "count=exact"},
    )
    count_res.raise_for_status()
    total = int(count_res.headers["content-range"].split("/")[-1])

    rng = random.Random(seed)
    ids = rng.sample(range(1, total + 1), min(n, total))
    id_list = ",".join(str(i) for i in ids)

    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/dream_symbols?select=id,category,interpretation_ko&id=in.({id_list})",
        headers=supabase_headers(),
    )
    res.raise_for_status()
    return res.json()


def build_question(interpretation_ko: str) -> str | None:
    match = DREAM_CLAUSE_RE.match(interpretation_ko)
    if not match:
        return None
    return f"어젯밤 {match.group(1)}."


def embed_texts(texts: list[str]) -> list[list[float]]:
    res = requests.post(
        f"{HF_EMBED_URL}/embed",
        headers={
            "Content-Type": "application/json",
            "x-api-key": HF_EMBED_API_KEY,
            **({"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}),
        },
        json={"texts": texts},
        timeout=EMBED_TIMEOUT_S,
    )
    res.raise_for_status()
    return res.json()["embeddings"]


def retrieve_contexts(question: str) -> list[str]:
    embedding = embed_texts([question])[0]
    res = requests.post(
        f"{SUPABASE_URL}/rest/v1/rpc/match_dream_symbols",
        headers=supabase_headers(),
        json={"query_embedding": embedding, "match_count": MATCH_COUNT},
    )
    res.raise_for_status()
    return [row["interpretation_ko"] for row in res.json()]


def call_app(app_url: str, question: str) -> str:
    for attempt in range(3):
        res = requests.post(
            f"{app_url}/api/interpret-dream",
            json={"dream": question},
            timeout=60,
        )
        if res.status_code in (429, 503) and attempt < 2:
            wait = 10 * (attempt + 1)
            print(f"    app returned {res.status_code}, retrying in {wait}s...", file=sys.stderr)
            time.sleep(wait)
            continue
        break

    res.raise_for_status()
    data = res.json()
    parts = [data.get("summary", ""), *data.get("analysis", [])]
    if data.get("goodElements"):
        parts.append(data["goodElements"])
    if data.get("badElements"):
        parts.append(data["badElements"])
    return "\n".join(p for p in parts if p)


def question_pairs_from_table(n: int, seed: int) -> list[tuple[str, str]]:
    """Sample rows from dream_symbols and synthesize (question, reference) pairs."""
    pairs = []
    for row in fetch_sample_rows(n, seed):
        question = build_question(row["interpretation_ko"])
        if not question:
            print(f"  skip id={row['id']}: no dream clause found", file=sys.stderr)
            continue
        pairs.append((question, row["interpretation_ko"]))
    return pairs


def build_dataset(app_url: str, pairs: list[tuple[str, str]]) -> list[dict]:
    dataset = []
    for question, reference in pairs:
        print(f"  {question}")
        try:
            contexts = retrieve_contexts(question)
            answer = call_app(app_url, question)
        except requests.RequestException as e:
            print(f"    failed: {e}", file=sys.stderr)
            continue

        dataset.append(
            {
                "user_input": question,
                "retrieved_contexts": contexts,
                "response": answer,
                "reference": reference,
            }
        )
        time.sleep(1)  # be gentle with Groq's free-tier rate limits
    return dataset


class HFBgeM3Embeddings:
    """LangChain-compatible Embeddings wrapper around the project's own
    BGE-M3 HF Space, so RAGAS scores contexts with the same embedding model
    the app actually retrieves with."""

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return embed_texts(texts)

    def embed_query(self, text: str) -> list[float]:
        return embed_texts([text])[0]


def run_eval(dataset: list[dict]):
    from langchain_openai import ChatOpenAI
    from ragas import EvaluationDataset, RunConfig, evaluate
    from ragas.embeddings import LangchainEmbeddingsWrapper
    from ragas.llms import LangchainLLMWrapper
    from ragas.metrics import (
        AnswerRelevancy,
        context_precision,
        context_recall,
        faithfulness,
    )

    # Groq's API rejects n>1 ("'n' : number must be at most 1"); bypass_n makes
    # ragas issue sequential n=1 calls instead of one batched n>1 call.
    judge_llm = LangchainLLMWrapper(
        ChatOpenAI(
            model=GROQ_MODEL,
            api_key=GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
            temperature=0,
        ),
        bypass_n=True,
    )
    judge_embeddings = LangchainEmbeddingsWrapper(HFBgeM3Embeddings())

    ragas_dataset = EvaluationDataset.from_list(dataset)

    result = evaluate(
        ragas_dataset,
        metrics=[
            faithfulness,
            AnswerRelevancy(strictness=1),
            context_precision,
            context_recall,
        ],
        llm=judge_llm,
        embeddings=judge_embeddings,
        run_config=RunConfig(max_workers=2),
    )
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=10, help="number of dreams to sample")
    parser.add_argument("--app-url", default="http://localhost:3000")
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument(
        "--question",
        action="append",
        dest="questions",
        help="evaluate this exact sentence instead of sampling dream_symbols "
        "(repeatable: --question '...' --question '...')",
    )
    args = parser.parse_args()

    if args.questions:
        print(f"Using {len(args.questions)} question(s) from --question...")
        pairs = [(q, "") for q in args.questions]
    else:
        print(f"Building dataset ({args.n} dreams, seed={args.seed})...")
        pairs = question_pairs_from_table(args.n, args.seed)

    dataset = build_dataset(args.app_url, pairs)
    if not dataset:
        print("No dataset rows built, aborting.", file=sys.stderr)
        sys.exit(1)
    print(f"Built {len(dataset)} rows. Running RAGAS eval (this calls Groq a lot)...")

    result = run_eval(dataset)

    out_path = PROJECT_ROOT / "eval" / "results.csv"
    result.to_pandas().to_csv(out_path, index=False)

    from show_results import show

    show(out_path)
    print(f"\nSaved detailed per-row results to {out_path}")


if __name__ == "__main__":
    main()
