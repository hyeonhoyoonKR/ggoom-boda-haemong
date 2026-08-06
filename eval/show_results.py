"""Pretty-print eval/results.csv so scores are readable without opening the CSV.

Usage:
  eval/.venv/bin/python eval/show_results.py [path/to/results.csv]
"""

import csv
import sys
from pathlib import Path

DEFAULT_RESULTS_PATH = Path(__file__).resolve().parent / "results.csv"

BAR_WIDTH = 10

METRICS = [
    ("faithfulness", "충실도 (Faithfulness)", "답변의 주장이 검색된 문맥으로 실제 뒷받침되는 비율"),
    ("answer_relevancy", "답변 관련성 (Answer Relevancy)", "답변이 실제로 던진 질문을 향하고 있는 정도"),
    ("context_precision", "문맥 정밀도 (Context Precision)", "검색된 문맥 중 실제로 쓸모 있었던 비율"),
    ("context_recall", "문맥 재현율 (Context Recall)", "정답의 근거가 된 문서를 검색이 실제로 찾아냈는지"),
]


def _color(score: float, text: str) -> str:
    if not sys.stdout.isatty():
        return text
    if score >= 0.7:
        code = "32"  # green
    elif score >= 0.4:
        code = "33"  # yellow
    else:
        code = "31"  # red
    return f"\033[{code}m{text}\033[0m"


def _bar(score: float) -> str:
    filled = max(0, min(BAR_WIDTH, round(score * BAR_WIDTH)))
    return "█" * filled + "░" * (BAR_WIDTH - filled)


def _parse_score(raw) -> float | None:
    try:
        return float(raw)
    except (TypeError, ValueError):
        return None


def print_row(idx: int, row: dict) -> None:
    print(f"\n[{idx}] {row.get('user_input', '')}")
    for key, label, desc in METRICS:
        score = _parse_score(row.get(key))
        if score is None:
            print(f"  {label:<32} {'N/A':>6}  {'-' * BAR_WIDTH}  {desc}")
            continue
        line = f"  {label:<32} {score:>6.2f}  {_bar(score)}  {desc}"
        print(_color(score, line))


def print_summary(rows: list[dict]) -> None:
    print("\n" + "=" * 70)
    print(f"평균 ({len(rows)}개 질문)")
    for key, label, desc in METRICS:
        values = [v for v in (_parse_score(r.get(key)) for r in rows) if v is not None]
        if not values:
            print(f"  {label:<32} {'N/A':>6}")
            continue
        avg = sum(values) / len(values)
        missing = len(rows) - len(values)
        suffix = f"  ({missing}개 N/A 제외)" if missing else ""
        line = f"  {label:<32} {avg:>6.2f}  {_bar(avg)}{suffix}"
        print(_color(avg, line))


def load_rows(path: Path) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def show(path: Path) -> None:
    rows = load_rows(path)
    if not rows:
        print("결과가 비어 있습니다.", file=sys.stderr)
        return
    for idx, row in enumerate(rows, start=1):
        print_row(idx, row)
    print_summary(rows)


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_RESULTS_PATH
    if not path.exists():
        print(f"{path} 가 없습니다. 먼저 run_ragas_eval.py를 실행하세요.", file=sys.stderr)
        sys.exit(1)
    show(path)


if __name__ == "__main__":
    main()
