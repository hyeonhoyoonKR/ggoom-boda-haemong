import { createClient } from "@supabase/supabase-js";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const MODEL = "openai/gpt-oss-120b";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({ model: MODEL, messages, temperature: 0.8 }),
      });

      if (res.status === 429) {
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        const err = new Error("Too Many Requests");
        (err as { status?: number }).status = 429;
        throw err;
      }

      if (res.status === 503) {
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        const err = new Error("Service Unavailable");
        (err as { status?: number }).status = 503;
        throw err;
      }

      if (!res.ok) {
        throw new Error(`Groq API error: ${res.status}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      lastError = error;
      const msg = getErrorMessage(error);
      if (msg.includes("429") || msg.includes("503")) {
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
      }
      throw error;
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    if (!GROQ_API_KEY) {
      return Response.json({ error: "API 키가 설정되지 않았습니다." }, { status: 500 });
    }

    const { dream } = await request.json();

    if (!dream || !dream.trim()) {
      return Response.json({ error: "꿈의 내용을 입력해주세요." }, { status: 400 });
    }

    const systemPrompt = `You are a Korean dream interpretation expert.

CRITICAL: Your entire response must be written in pure Korean Hangul (한글) only.
Do NOT use Chinese characters, Japanese characters, or English in the response content.

Interpret the user's dream in a warm, mystical style like a Korean shaman (무당), incorporating modern psychological perspective and near-future fortune.
If the input does not appear to be a dream, refuse interpretation.

All sentences must end with "~입니다" or "~합니다" style (formal Korean ending).

Respond ONLY in the following JSON format. Do not include any text outside the JSON.

{
  "summary": "One-line interpretation summary in Korean (~30 characters). Do NOT repeat or paraphrase the user's input. Write the core meaning or message of the dream instead. End with ~입니다.",
  "analysis": "Detailed interpretation in 3-4 paragraphs separated by \\n\\n, total 200-300 Korean characters. All sentences end with ~입니다/~합니다.",
  "goodElements": "One sentence about fortunate elements from the dream. End with ~입니다.",
  "badElements": "One sentence about unfortunate elements from the dream. End with ~입니다."
}

If not a dream: { "summary": "해몽할 수 없는 내용입니다.", "analysis": "꿈의 내용이 아닌 것 같아 해몽을 드리기 어렵습니다.", "goodElements": "", "badElements": "" }`;

    const responseText = await callGroq([
      { role: "system", content: systemPrompt },
      { role: "user", content: `꿈: ${dream}` },
    ]);

    let parsed: { summary: string; analysis: string; goodElements: string; badElements: string };
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch?.[0] || responseText);
    } catch {
      const lines = responseText.split("\n").filter((l) => l.trim());
      parsed = {
        summary: lines[0] || "",
        analysis: lines.slice(1).join("\n"),
        goodElements: "",
        badElements: "",
      };
      console.log(parsed);
    }

    if (supabase) {
      const { error: insertError } = await supabase.from("data").insert([
        { description: "꿈 해석 결과", score: 0 },
      ]);
      if (insertError) console.error("Supabase insert error:", insertError);
    }

    return Response.json({
      summary: parsed.summary,
      analysis: parsed.analysis,
      goodElements: parsed.goodElements || undefined,
      badElements: parsed.badElements || undefined,
    });
  } catch (error) {
    console.error("Error:", error);
    const msg = getErrorMessage(error);

    if (msg.includes("429") || msg.includes("Too Many Requests")) {
      return Response.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }
    if (msg.includes("503") || msg.includes("Service Unavailable")) {
      return Response.json(
        { error: "현재 해몽 서비스 이용자가 많아 잠시 후 다시 시도해 주세요." },
        { status: 503 }
      );
    }

    return Response.json({ error: "꿈 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
