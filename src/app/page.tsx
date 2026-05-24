"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [stage, setStage] = useState<
    "input" | "box-dropped" | "box-opened" | "result"
  >("input");
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
      // 즉시 부적함 떨어뜨리기
      setStage("box-dropped");

      // API 호출
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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "예기치 않은 오류가 발생했습니다."
      );
      setStage("input");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoxClick = () => {
    if (stage === "box-dropped" && analysisResult) {
      setStage("box-opened");
    }
  };

  const handleReset = () => {
    setStage("input");
    setAnalysisResult(null);
    setDreamText("");
    setError("");
  };

  return (
    <div className={styles.layout}>
      <div className={styles.viewport}>
        <div className={styles.screen}>
          {/* 입력 화면 */}
          {stage === "input" && (
            <article className={styles.card}>
              <div className={styles.hero}>
                <h1 className={styles.title}>
                  당신의 꿈을
                  <br />
                  분석해드립니다
                </h1>
                <p className={styles.subtitle}>
                  현대 심리학과 데이터 기반 해석을 결합해 당신의 꿈에서 숨겨진
                  의미를 차분히 읽어냅니다.
                </p>
              </div>

              <div className={styles.inputArea}>
                <textarea
                  className={styles.textArea}
                  placeholder="당신의 꿈을 구체적으로 적어주세요."
                  value={dreamText}
                  onChange={(event) => setDreamText(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  className={styles.submit}
                  type="button"
                  onClick={handleSubmit}
                  aria-label="꿈 입력 완료"
                  disabled={!canSubmit}
                >
                  {isLoading ? (
                    <span className={styles.loadingIcon}>⏳</span>
                  ) : (
                    "→"
                  )}
                </button>
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}
            </article>
          )}

          {/* 부적함 떨어진 화면 */}
          {/* 부적함 떨어진 화면 */}
          {stage === "box-dropped" && (
            <article className={styles.card}>
              <div
                className={`${styles.boxContainer} ${styles.dropping}`}
                onClick={handleBoxClick}
              >
                <div className={styles.boxBody}>
                  {/* 부적함 배경 (임시) */}
                  <div className={styles.boxBackground}>
                    <div className={styles.doorLeft} />
                    <div className={styles.doorRight} />
                  </div>
                </div>
              </div>

              <p className={styles.hint}>
                {isLoading ? "해몽 중..." : "부적함을 눌러주세요"}
              </p>
            </article>
          )}

          {/* 부적함 열린 화면 + 부적 */}
          {/* 부적함 열린 화면 + 부적 */}
          {stage === "box-opened" && analysisResult && (
            <article className={styles.card}>
              <div className={styles.boxContainer}>
                <div className={styles.boxBody}>
                  {/* 문 열림 */}
                  <div className={styles.boxBackground}>
                    <div className={`${styles.doorLeft} ${styles.open}`} />
                    <div className={`${styles.doorRight} ${styles.open}`} />
                  </div>

                  {/* 부적 등장 */}
                  <div className={`${styles.talisman} ${styles.show}`}>
                    <div className={styles.talismangPaper}>
                      <div className={styles.talismangContent}>
                        <h3 className={styles.summary}>
                          {analysisResult.summary}
                        </h3>
                        <div className={styles.analysis}>
                          {analysisResult.analysis
                            .split("\n\n")
                            .map(
                              (paragraph, index) =>
                                paragraph.trim() && (
                                  <p key={index}>{paragraph.trim()}</p>
                                )
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                className={styles.back}
                type="button"
                onClick={handleReset}
              >
                다시 입력하기
              </button>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
