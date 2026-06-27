"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./MoonLayer.module.css";

type Stage = "intro" | "loading" | "result";

interface Props {
  stage: Stage;
  isLoading: boolean;
  onExitDone: () => void;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  /** Marks the intro moon's resting spot (the 52px .moon element). */
  introSentinelRef: React.RefObject<HTMLDivElement | null>;
  /** True while flying back from the result screen to the intro moon. */
  moonReturning: boolean;
  /** Called once the moon has reached the intro spot (handoff to IntroScreen). */
  onReturnDone: () => void;
}

// Intro moon is 52px; this layer's base moon is 120px.
const INTRO_SCALE = 52 / 120;

export default function MoonLayer({
  stage,
  isLoading,
  onExitDone,
  sentinelRef,
  introSentinelRef,
  moonReturning,
  onReturnDone,
}: Props) {
  const [orbiting, setOrbiting] = useState(true);
  const [parallaxActive, setParallaxActive] = useState(false);
  const moonWrapRef = useRef<HTMLDivElement>(null);
  const moonCutRef = useRef<HTMLDivElement>(null);
  const onExitDoneRef = useRef(onExitDone);
  onExitDoneRef.current = onExitDone;
  const onReturnDoneRef = useRef(onReturnDone);
  onReturnDoneRef.current = onReturnDone;
  const moonBasePos = useRef({ x: 0, y: 0 });
  const mouseOffset = useRef({ x: 0, y: 0 });

  // Position moon at center when loading stage starts
  // Runs whenever stage changes — useLayoutEffect with [] fires on mount (intro stage),
  // at which point moonWrapRef is null because we return null for intro.
  useLayoutEffect(() => {
    if (stage !== "loading") return;
    // Reset transient state so a reset → resubmit cycle behaves like a fresh run
    setOrbiting(true);
    setParallaxActive(false);
    const el = moonWrapRef.current;
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = `translate(${window.innerWidth / 2 - 60}px, ${
      window.innerHeight / 2 - 60
    }px) scale(1)`;
    el.style.opacity = "1";
  }, [stage]);

  // Handle loading completion: complete orbit → 500ms pause → call onExitDone.
  // Guard on stage so this never fires at mount (intro, isLoading already false).
  useEffect(() => {
    if (stage !== "loading") return;
    if (isLoading) return;

    const period = 3000;
    let remainingMs = 0;
    const cutEl = moonCutRef.current;
    if (cutEl) {
      const anims = cutEl.getAnimations();
      if (anims.length > 0 && anims[0].currentTime !== null) {
        const elapsed = (anims[0].currentTime as number) % period;
        remainingMs = elapsed > 0 ? Math.round(period - elapsed) : 0;
      }
    }

    const t0 = setTimeout(() => setOrbiting(false), remainingMs);
    const t1 = setTimeout(() => onExitDoneRef.current(), remainingMs + 500);

    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, [isLoading, stage]);

  // Transition to result position when stage becomes "result".
  // Passive effect (not layout): runs after the whole tree's refs are attached,
  // so the sibling ResultScreen's sentinelRef is guaranteed to be set. A layout
  // effect here would read sentinelRef before ResultScreen attaches it (MoonLayer
  // commits first), leaving the moon stuck at the loading-center position.
  useEffect(() => {
    if (stage !== "result") return;

    const wrap = moonWrapRef.current;
    const sentinel = sentinelRef.current;
    if (!wrap || !sentinel) return;

    const syncBase = () => {
      const rect = sentinel.getBoundingClientRect();
      moonBasePos.current = { x: rect.left, y: rect.top };
    };

    // Initial: animate from loading-center to the sentinel position.
    syncBase();
    requestAnimationFrame(() => {
      const w = moonWrapRef.current;
      if (!w) return;
      w.style.transition = "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)";
      w.style.transform = `translate(${moonBasePos.current.x}px, ${moonBasePos.current.y}px) scale(0.5)`;
    });

    const t = setTimeout(() => setParallaxActive(true), 550);

    // Keep the moon glued above the text field when the layout shifts
    // (window resize, or scrolling the result content). The moon is a fixed
    // overlay, so it must re-read the sentinel's live position on these events.
    const reposition = () => {
      syncBase();
      const w = moonWrapRef.current;
      if (!w) return;
      w.style.transition = "none";
      w.style.transform = `translate(${moonBasePos.current.x + mouseOffset.current.x}px, ${
        moonBasePos.current.y + mouseOffset.current.y
      }px) scale(0.5)`;
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true); // capture: catch inner scroll too

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [stage, sentinelRef]);

  // Reset return: fly the moon from its result spot back to the intro moon,
  // then hand off to IntroScreen's own moon. Runs while stage is "intro" but the
  // moon is still mounted because moonReturning keeps it rendered.
  useEffect(() => {
    if (stage !== "intro" || !moonReturning) return;

    setParallaxActive(false);
    mouseOffset.current = { x: 0, y: 0 };

    const wrap = moonWrapRef.current;
    const target = introSentinelRef.current;
    if (!wrap || !target) {
      onReturnDoneRef.current();
      return;
    }

    const rect = target.getBoundingClientRect();
    requestAnimationFrame(() => {
      const w = moonWrapRef.current;
      if (!w) return;
      w.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      w.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(${INTRO_SCALE})`;
    });

    const t = setTimeout(() => onReturnDoneRef.current(), 650);
    return () => clearTimeout(t);
  }, [stage, moonReturning, introSentinelRef]);

  // Parallax (activates after transition completes)
  useEffect(() => {
    if (!parallaxActive) return;

    const wrap = moonWrapRef.current;
    if (!wrap) return;

    // Read moonBasePos.current live (not destructured once) so the parallax
    // offset always applies on top of the latest resize/scroll-synced base.
    const onMouseMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * -20;
      const my = (e.clientY / window.innerHeight - 0.5) * -20;
      mouseOffset.current = { x: mx, y: my };
      const { x: bx, y: by } = moonBasePos.current;
      wrap.style.transition = "none";
      wrap.style.transform = `translate(${bx + mx}px, ${by + my}px) scale(0.5)`;
    };
    const onMouseLeave = () => {
      mouseOffset.current = { x: 0, y: 0 };
      const { x: bx, y: by } = moonBasePos.current;
      wrap.style.transition = "transform 0.4s ease-out";
      wrap.style.transform = `translate(${bx}px, ${by}px) scale(0.5)`;
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [parallaxActive]);

  // Hidden in intro, except while the moon is flying back from the result screen.
  if (stage === "intro" && !moonReturning) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div ref={moonWrapRef} className={styles.moonWrap}>
        <div className={styles.moon}>
          <div
            ref={moonCutRef}
            className={`${styles.moonCut} ${orbiting ? styles.orbiting : ""}`}
          />
        </div>
      </div>
    </div>
  );
}
