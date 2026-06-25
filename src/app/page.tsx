"use client";

import { useState } from "react";
import IntroScreen from "./_components/IntroScreen";
import LoadingScreen from "./_components/LoadingScreen";
import ResultScreen from "./_components/ResultScreen";

type Stage = "intro" | "loading" | "result";

type Result = {
  summary: string;
  analysis: string;
  goodElements?: string;
  badElements?: string;
};

const MOCK_RESULT: Result = {
  summary: "당신의 꿈은 변화와 새로운 시작을 암시합니다.",
  analysis:
    "꿈 속에서 나타난 상징들은 당신의 무의식이 현재 삶의 전환점에 서 있음을 나타냅니다.\n\n수천 년의 해몽 전통에 따르면 이러한 꿈은 길몽으로 해석됩니다. 앞으로의 여정에 밝은 기운이 가득할 것입니다.\n\n가까운 미래에 기쁜 소식이 찾아올 징조가 보이니, 마음을 열고 새로운 인연과 기회를 받아들이세요.",
  goodElements: "새로운 기회, 대인운 상승, 금전운 호조",
  badElements: "성급한 결정 주의, 건강 관리 필요",
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");

  // TODO: 테스트용 — 추후 실제 입력 화면으로 교체 예정
  const handleStart = () => {
    setStage("loading");
    setIsLoading(true);
    setTimeout(() => {
      setResult(MOCK_RESULT);
      setIsLoading(false);
      setStage("result");
    }, 3000);
  };

  const handleReset = () => {
    setStage("intro");
    setResult(null);
    setError("");
  };

  return (
    <>
      {stage === "intro" && <IntroScreen onStart={handleStart} />}
      {stage === "loading" && (
        <LoadingScreen isLoading={isLoading} onOpen={() => {}} />
      )}
      {stage === "result" && result && (
        <ResultScreen
          summary={result.summary}
          analysis={result.analysis}
          goodElements={result.goodElements}
          badElements={result.badElements}
          onReset={handleReset}
        />
      )}
      {error && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255,100,100,0.15)",
            color: "#ff9999",
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 14,
          }}
        >
          {error}
        </div>
      )}
    </>
  );
}
