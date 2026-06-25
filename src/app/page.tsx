"use client";

import { useState } from "react";
import IntroScreen from "./_components/IntroScreen";
import LoadingScreen from "./_components/LoadingScreen";
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
  const [moonPos, setMoonPos] = useState<{ x: number; y: number } | undefined>(undefined);

  const handleSubmit = async (dream: string, pos: { x: number; y: number }) => {
    if (!dream.trim() || isLoading) return;

    setMoonPos(pos);
    setIsLoading(true);
    setError("");
    setStage("loading");

    try {
      return; // TODO: remove
      const res = await fetch("/api/interpret-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream: dream.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "분석 요청에 실패했습니다.");
      }

      const data = await res.json();
      setResult(data);
      setStage("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "예기치 않은 오류가 발생했습니다.");
      setStage("intro");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStage("intro");
    setResult(null);
    setError("");
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "#0d1b3e", zIndex: 0 }} />
      <StarBackground />
      {stage === "intro" && <IntroScreen onSubmit={handleSubmit} />}
      {stage === "loading" && (
        <LoadingScreen isLoading={isLoading} moonPos={moonPos} />
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
