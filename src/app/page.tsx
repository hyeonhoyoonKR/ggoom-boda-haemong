"use client";

import { useRef, useState } from "react";
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
  const [isLucky, setIsLucky] = useState(true); // ✅ 추가!
  const submitInFlightRef = useRef(false);

  const trimmedDream = dreamText.trim();
  const canSubmit = trimmedDream.length > 0 && !isLoading;

  const handleSubmit = async () => {
    if (!trimmedDream || isLoading || submitInFlightRef.current) return;

    submitInFlightRef.current = true;
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

      // ✅ 길몽/흉몽 판단 로직 추가
      const luckyKeywords = [
        "길",
        "좋",
        "행운",
        "성공",
        "기쁨",
        "발전",
        "희망",
        "긍정",
      ];
      const unluckyKeywords = [
        "흉",
        "나쁨",
        "위험",
        "주의",
        "경고",
        "문제",
        "불안",
        "부정",
      ];

      const analysisText = `${data.summary} ${data.analysis}`.toLowerCase();

      const luckScore = luckyKeywords.filter((keyword) =>
        analysisText.includes(keyword)
      ).length;
      const unluckScore = unluckyKeywords.filter((keyword) =>
        analysisText.includes(keyword)
      ).length;

      setIsLucky(luckScore >= unluckScore);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "예기치 않은 오류가 발생했습니다."
      );
      setStage("input");
    } finally {
      submitInFlightRef.current = false;
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
    setIsLucky(true); // ✅ 리셋
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
                  placeholder="내가 꿈에서..."
                  value={dreamText}
                  onChange={(event) => setDreamText(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      canSubmit
                    ) {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  disabled={isLoading}
                  aria-busy={isLoading}
                />
                <button
                  className={styles.submit}
                  type="button"
                  onClick={handleSubmit}
                  aria-label={isLoading ? "해몽 중" : "꿈 입력 완료"}
                  aria-busy={isLoading}
                  disabled={!canSubmit}
                >
                  {isLoading ? (
                    <span className={styles.loadingSpinner} aria-hidden="true" />
                  ) : (
                    "→"
                  )}
                </button>
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}
            </article>
          )}

          {/* 부적함 떨어진 화면 */}
          {stage === "box-dropped" && (
            <article className={styles.card}>
              <div
                className={`${styles.boxContainer} ${styles.dropping} ${
                  isLoading ? styles.interpreting : ""
                }`}
                onClick={handleBoxClick}
                aria-busy={isLoading}
                aria-label={isLoading ? "해몽 중" : "부적함 열기"}
              >
                <div className={styles.boxBody}>
                  <div className={styles.boxBackground}>
                    <div className={styles.doorLeft} />
                    <div className={styles.doorRight} />
                  </div>
                </div>
              </div>

              {!isLoading && (
                <p className={styles.hint}>부적함을 눌러주세요</p>
              )}
            </article>
          )}

          {/* 부적함 열린 화면 + 부적 */}
          {stage === "box-opened" && analysisResult && (
            <article className={styles.card}>
              <div className={styles.boxContainer}>
                <div className={styles.boxBody}>
                  <div className={styles.boxBackground}>
                    <div className={`${styles.doorLeft} ${styles.open}`} />
                    <div className={`${styles.doorRight} ${styles.open}`} />
                  </div>

                  <div className={`${styles.talisman} ${styles.show}`}>
                    <div
                      className={styles.talismangPaper}
                      style={{
                        backgroundImage: `url('/${
                          isLucky ? "talisman-lucky" : "talisman-unlucky"
                        }.png')`,
                      }}
                    >
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
