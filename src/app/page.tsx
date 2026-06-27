"use client";

import { useRef, useState } from "react";
import IntroScreen from "./_components/IntroScreen";
import LoadingScreen from "./_components/LoadingScreen";
import MoonLayer from "./_components/MoonLayer";
import ResultScreen from "./_components/ResultScreen";
import StarBackground from "./_components/StarBackground";

type Stage = "intro" | "loading" | "result";

type Result = {
  summary: string;
  analysis: string;
  goodElements?: string;
  badElements?: string;
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  // true while the moon is flying from the result screen back to the intro moon
  const [moonReturning, setMoonReturning] = useState(false);
  const moonSentinelRef = useRef<HTMLDivElement>(null);
  const introMoonRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (dream: string) => {
    if (!dream.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setMoonReturning(false); // cancel any in-flight reset return
    setStage("loading");

    try {
      // TODO: remove mock, restore API call
      await new Promise(r => setTimeout(r, 1000));
      setResult({
        summary: "물속을 헤엄치는 꿈은 무의식 속 감정의 흐름을 나타냅니다.",
        analysis: "깊고 맑은 물은 내면의 평온함과 정서적 안정을 상징합니다. 자유롭게 헤엄치는 행위는 현재 처한 상황에서 유연하게 대처하고 있음을 의미하며, 억압된 감정보다는 자연스러운 흐름을 따르고 있다는 신호입니다. 물의 온도와 투명도, 주변 환경에 따라 해석이 달라질 수 있으며, 전반적으로 긍정적인 변화의 전조로 읽힙니다.",
        goodElements: "맑은 물, 자유로운 움직임, 부드러운 물결",
        badElements: "더러운 물, 열대 과일, 거친 수건",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "예기치 않은 오류가 발생했습니다.");
      setStage("intro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadingExit = () => {
    setStage("result");
  };

  const handleReset = () => {
    // Keep MoonLayer alive and fly its moon back to the intro moon's spot,
    // then MoonLayer hands off to IntroScreen's own moon and unmounts.
    setMoonReturning(true);
    setStage("intro");
    setResult(null);
    setError("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0d1b3e" }}>
      <StarBackground />
      <MoonLayer
        stage={stage}
        isLoading={isLoading}
        onExitDone={handleLoadingExit}
        sentinelRef={moonSentinelRef}
        introSentinelRef={introMoonRef}
        moonReturning={moonReturning}
        onReturnDone={() => setMoonReturning(false)}
      />
      {stage === "intro" && (
        <IntroScreen
          onSubmit={handleSubmit}
          moonRef={introMoonRef}
          moonReturning={moonReturning}
        />
      )}
      {stage === "loading" && <LoadingScreen isLoading={isLoading} />}
      {stage === "result" && result && (
        <ResultScreen
          summary={result.summary}
          analysis={result.analysis}
          goodElements={result.goodElements}
          badElements={result.badElements}
          onReset={handleReset}
          moonSentinelRef={moonSentinelRef}
        />
      )}
      {error && (
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,100,100,0.15)",
            color: "#ff9999",
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 14,
            zIndex: 99,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
