"use client";

import { useRef } from "react";
import styles from "./ResultScreen.module.css";
import StarBackground from "./StarBackground";

interface Props {
  summary: string;
  analysis: string;
  goodElements?: string;
  badElements?: string;
  onReset: () => void;
}

export default function ResultScreen({ summary, analysis, goodElements, badElements, onReset }: Props) {
  const captureRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const el = captureRef.current;
    const canvas = await html2canvas(el, {
      backgroundColor: "#0d1b3e",
      scale: 2,
      width: el.offsetWidth,
      height: el.offsetHeight,
      x: 0,
      y: 0,
    });
    const link = document.createElement("a");
    link.download = "해몽결과.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={styles.wrap}>
      {/* <StarBackground /> */}
      <div className={styles.content}>
        <div ref={captureRef} className={styles.captureWrap}>
          <div className={styles.resultField}>
            <h3 className={styles.summary}>{summary}</h3>
            <div className={styles.analysis}>
              {analysis.split("\n\n").map(
                (para, i) => para.trim() && <p key={i}>{para.trim()}</p>
              )}
            </div>
          </div>
          <div className={styles.elementsRow}>
            <div className={styles.goodField}>
              <span className={styles.fieldLabel}>좋은요소</span>
              <p className={styles.fieldText}>{goodElements || "—"}</p>
            </div>
            <div className={styles.badField}>
              <span className={styles.fieldLabel}>나쁜요소</span>
              <p className={styles.fieldText}>{badElements || "—"}</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.resetBtn} onClick={onReset}>
            다시 입력하기
          </button>
          <button className={styles.downloadBtn} type="button" onClick={handleDownload}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="#e8d5a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}