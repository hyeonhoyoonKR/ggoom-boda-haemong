"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [stage, setStage] = useState<"input" | "result">("input");
  const [dreamText, setDreamText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    analysis: string;
  } | null>(null);
  const [error, setError] = useState("");

  const trimmedDream = dreamText.trim();
  const canSubmit = trimmedDream.length > 0 && !isLoading;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/interpret-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream: trimmedDream }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "분석 요청에 실패했습니다.");
      }

      const data = await response.json();
      setAnalysisResult(data);
      setStage("result");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "예기치 않은 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.layout}>
      <div className={styles.viewport}>
        <div className={styles.screen}>
          {stage === "input" ? (
            <article className={styles.card}>
              <div className={styles.hero}>
                <h1 className={styles.title}>
                  당신의 꿈을<br />분석해드립니다
                </h1>
                <p className={styles.subtitle}>
                  현대 심리학과 데이터 기반 해석을 결합해 당신의 꿈에서
                  숨겨진 의미를 차분히 읽어냅니다.
                </p>
              </div>

              <div className={styles.inputArea}>
                <textarea
                  className={styles.textArea}
                  placeholder="당신의 꿈을 구체적으로 적어주세요."
                  value={dreamText}
                  onChange={(event) => setDreamText(event.target.value)}
                  disabled={isLoading}
                />
                <button
                  className={styles.submit}
                  type="button"
                  onClick={handleSubmit}
                  aria-label="꿈 입력 완료"
                >
                  {isLoading ? "⏳" : "→"}
                </button>
              </div>

              {error && (
                <div className={styles.errorMessage}>{error}</div>
              )}
            </article>
          ) : analysisResult ? (
            <article className={styles.card}>
              <div className={styles.hero}>
                <p className={styles.summary}>{analysisResult.summary}</p>
              </div>

              <div className={styles.analysis}>
                {analysisResult.analysis.split("\n\n").map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index}>{paragraph.trim()}</p>
                  )
                ))}
              </div>

              <button
                className={styles.back}
                type="button"
                onClick={() => {
                  setStage("input");
                  setAnalysisResult(null);
                  setDreamText("");
                }}
              >
                다시 입력하기
              </button>
            </article>
          ) : (
            <article className={styles.card}>
              <div className={styles.hero}>
                <p className={styles.summary}>분석 중입니다...</p>
              </div>
              <button
                className={styles.back}
                type="button"
                onClick={() => {
                  setStage("input");
                  setAnalysisResult(null);
                }}
              >
                취소
              </button>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
