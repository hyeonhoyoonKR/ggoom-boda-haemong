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
  analysis: string[];
  goodElements?: string;
  badElements?: string;
};

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  // Passed to ResultScreen so the chat API knows the original dream text for follow-up questions
  const [pendingDream, setPendingDream] = useState("");
  // true while the moon is flying from the result screen back to the intro moon
  const [moonReturning, setMoonReturning] = useState(false);
  const introMoonRef = useRef<HTMLDivElement>(null);
  // Captured just before IntroScreen unmounts so MoonLayer can start its fly-in
  // from the exact intro moon position (including any parallax offset).
  const introMoonStartPos = useRef<{ x: number; y: number } | null>(null);

  const handleSubmit = async (dream: string) => {
    if (!dream.trim() || isLoading) return;

    const moonEl = introMoonRef.current;
    if (moonEl) {
      const rect = moonEl.getBoundingClientRect();
      introMoonStartPos.current = { x: rect.left, y: rect.top };
    }

    // Save dream text so ResultScreen can pass it to /api/dream-chat for follow-up questions
    setPendingDream(dream);
    setIsLoading(true);
    setError("");
    setMoonReturning(false); // cancel any in-flight reset return
    setStage("loading");

    try {
      const res = await fetch("/api/interpret-dream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "오류가 발생했습니다.");
      setResult({
        summary: data.summary,
        analysis: data.analysis,
        goodElements: data.goodElements,
        badElements: data.badElements,
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
    <div suppressHydrationWarning style={{ position: "fixed", inset: 0, background: "linear-gradient(135deg, #0a1628 0%, #122050 40%, #0d1f4a 65%, #091220 100%)" }}>
      <StarBackground />
      <MoonLayer
        stage={stage}
        isLoading={isLoading}
        onExitDone={handleLoadingExit}
        introSentinelRef={introMoonRef}
        introMoonStartPos={introMoonStartPos}
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
          dream={pendingDream}
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
      <a
        href="https://github.com/hyeonhoyoonKR/ggoom-boda-haemong"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub 저장소로 이동"
        style={{
          position: "fixed",
          left: 16,
          bottom: 70,
          zIndex: 100,
          display: "flex",
          color: "#e8d5a3",
          opacity: 0.4,
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </a>
    </div>
  );
}
