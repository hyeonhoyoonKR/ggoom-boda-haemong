import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const { dream } = await request.json();

    if (!dream || !dream.trim()) {
      return Response.json(
        { error: "꿈의 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `당신은 현대 심리학과 데이터 분석에 기반한 꿈 해몽 전문가입니다. 사용자가 설명한 꿈을 분석하고 해당 풀이들을 미신처럼 해석을해서 무당처럼 말을 하되 따뜻하게, 사용자의 근 미래에 대한 운세를 포함해서 200~300자 분량의 다음 형식으로 응답해주세요:

[첫 번째 줄: "당신의 꿈은 ~~~입니다." 형태의 한 줄 요약]

[그 다음부터: 3-4개의 단락으로 나눈 상세한 해석]

꿈: ${dream}

이 답변은 현대 심리학적 관점과 데이터 기반 분석을 바탕으로 작성해주세요. 신뢰감 있고 깊이 있는 해석을 제공하되, 꿈의 심볼과 감정을 중심으로 분석해주세요.`;

    const result = await model.generateContent(prompt);
    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!responseText) {
      return Response.json(
        { error: "응답 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    // Split response into summary and paragraphs
    const lines = responseText.split("\n").filter((line) => line.trim());
    const summary = lines[0] || "";
    const analysisText = lines.slice(1).join("\n");

    return Response.json({
      summary,
      analysis: analysisText,
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      { error: "꿈 분석 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
