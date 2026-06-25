"use client";

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./LoadingScreen.module.css";

interface Props {
  isLoading: boolean;
  moonPos?: { x: number; y: number };
}

export default function LoadingScreen({ isLoading, moonPos }: Props) {
  const moonBlockRef = useRef<HTMLDivElement>(null);
  const [orbiting, setOrbiting] = useState(false);

  useLayoutEffect(() => {
    const el = moonBlockRef.current;
    if (!el || !moonPos) {
      setOrbiting(true);
      return;
    }

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = moonPos.x - cx;
    const dy = moonPos.y - cy;
    const scale = 52 / 120;

    el.style.transition = "none";
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    void el.getBoundingClientRect(); // force reflow — commits initial position before transition

    requestAnimationFrame(() => {
      el.style.transition = "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
      el.style.transform = "translate(0, 0) scale(1)";
    });

    const onEnd = () => {
      el.style.transform = "";
      el.style.transition = "";
      setOrbiting(true);
    };
    el.addEventListener("transitionend", onEnd, { once: true });
    return () => el.removeEventListener("transitionend", onEnd);
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <div ref={moonBlockRef} className={styles.moonBlock}>
          <div className={styles.moon}>
            <div className={`${styles.moonCut} ${orbiting ? styles.orbiting : ""}`} />
          </div>
        </div>
        <p className={styles.hint}>
          {isLoading ? "해몽 중..." : "잠시만 기다려 주세요"}
        </p>
      </div>
    </div>
  );
}
