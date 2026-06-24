import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const MODEL = "gemini-2.5-flash";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatus(error: unknown) {
  return (error as { status?: number })?.status;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isServiceUnavailable(error: unknown) {
  const status = getErrorStatus(error);
  if (status === 503) return true;

  const message = getErrorMessage(error);
  return (
    message.includes("503") ||
    message.includes("high demand") ||
    message.includes("Service Unavailable")
  );
}

function isQuotaExceeded(error: unknown) {
  const status = getErrorStatus(error);
  if (status === 429) return true;

  const message = getErrorMessage(error);
  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("Quota exceeded") ||
    message.includes("Too Many Requests")
  );
}

async function generateDreamInterpretation(prompt: string) {
  const model = genAI.getGenerativeModel({ model: MODEL });
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      lastError = error;

      if (isQuotaExceeded(error)) {
        throw error;
      }

      if (isServiceUnavailable(error) && attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (attempt + 1));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    const { dream } = await request.json();

    if (!dream || !dream.trim()) {
      return Response.json(
        { error: "꿈의 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const prompt = `당신은 현대 심리학과 데이터 분석에 기반한 꿈 해몽 전문가입니다. 
    사용자가 설명한 꿈을 분석하고 해당 풀이들을 미신처럼 해석을해서 무당처럼 말을 하되 따뜻하게, 사용자의 근 미래에 대한 운세를 포함해서 200~300자 분량의 다음 형식으로 응답해주세요, 허나 글의 맥락이 꿈의 내용이 아닌것 같을때는 풀이하지 말고 해몽을 못할것 같다고 말해줘:

[첫 번째 줄: "당신의 꿈은 ~~~입니다." 형태의 한 줄 요약]

[그 다음부터: 3-4개의 단락으로 나눈 상세한 해석]

꿈: ${dream}

이 답변은 현대 심리학적 관점과 데이터 기반 분석을 바탕으로 작성해주세요. 신뢰감 있고 깊이 있는 해석을 제공하되, 꿈의 심볼과 감정을 중심으로 분석해주세요.`;

    const result = await generateDreamInterpretation(prompt);
    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!responseText) {
      return Response.json(
        { error: "응답 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    const lines = responseText.split("\n").filter((line) => line.trim());
    const summary = lines[0] || "";
    const analysisText = lines.slice(1).join("\n");

    if (supabase) {
      const { error: insertError } = await supabase.from("data").insert([
        {
          description: "임시 꿈 해석 결과",
          score: 72.5,
        },
      ]);

      if (insertError) {
        console.error("Supabase insert error:", insertError);
      }
    } else {
      console.warn("Supabase env not configured, skipping insert.");
    }

    return Response.json({
      summary,
      analysis: analysisText,
    });
  } catch (error) {
    console.error("Error:", error);

    if (isQuotaExceeded(error)) {
      return Response.json(
        {
          error:
            "Gemini API 무료 사용 한도에 도달했습니다. 약 1분 후 다시 시도하거나, Google AI Studio에서 사용량·결제 설정을 확인해 주세요.",
        },
        { status: 429 }
      );
    }

    if (isServiceUnavailable(error)) {
      return Response.json(
        {
          error:
            "현재 해몽 서비스 이용자가 많아 잠시 후 다시 시도해 주세요.",
        },
        { status: 503 }
      );
    }

    return Response.json(
      { error: "꿈 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
