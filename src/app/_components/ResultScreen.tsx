"use client";

import { useRef } from "react";
import styles from "./ResultScreen.module.css";

interface Props {
  summary: string;
  analysis: string;
  goodElements?: string;
  badElements?: string;
  onReset: () => void;
  moonSentinelRef: React.RefObject<HTMLDivElement | null>;
}

export default function ResultScreen({
  summary,
  analysis,
  goodElements,
  badElements,
  onReset,
  moonSentinelRef,
}: Props) {
  const captureRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!captureRef.current) return;
    const html2canvas = (await import("html2canvas")).default;
    const el = captureRef.current;
    const sentinel = moonSentinelRef.current;

    // Reveal sentinel before cloning so the clone inherits it
    if (sentinel) sentinel.style.visibility = "visible";

    // Clone off-screen: user sees no layout shift
    const clone = el.cloneNode(true) as HTMLDivElement;
    clone.style.cssText = `position:fixed;left:-9999px;top:0;width:${el.offsetWidth}px;pointer-events:none;`;
    document.body.appendChild(clone);

    const fix = (cls: string, overrides: Partial<CSSStyleDeclaration>) =>
      clone.querySelectorAll(`.${cls}`).forEach(e => Object.assign((e as HTMLElement).style, overrides));

    // html2canvas ignores CSS animation forwards fill → force final state
    fix(styles.resultField, { animation: "none", opacity: "1", transform: "none", height: "auto", overflow: "visible" });
    fix(styles.analysis,    { animation: "none", opacity: "1", overflow: "visible", flex: "none" });
    fix(styles.elementsRow, { animation: "none", opacity: "1", transform: "none" });
    fix(styles.goodField,   { height: "auto", overflow: "visible" });
    fix(styles.badField,    { height: "auto", overflow: "visible" });
    fix(styles.fieldText,   { overflow: "visible" });

    let canvas;
    try {
      canvas = await html2canvas(clone, {
        backgroundColor: "#0d1b3e",
        scale: 2,
        width: clone.offsetWidth,
        height: clone.offsetHeight,
        x: 0,
        y: 0,
      });
    } finally {
      document.body.removeChild(clone);
      if (sentinel) sentinel.style.visibility = "";
    }
    const link = document.createElement("a");
    link.download = "해몽결과.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.content}>
        <div ref={captureRef} className={styles.captureWrap}>
          {/* Sentinel: positions MoonLayer moon + provides moon replica for download */}
          <div ref={moonSentinelRef} className={styles.moonBlock}>
            <div className={styles.moon}>
              <div className={styles.moonCut} />
            </div>
          </div>
          <div className={styles.resultField}>
            <h3 className={styles.summary}>{summary}</h3>
            <div className={styles.analysis}>
              {analysis
                .split("\n\n")
                .map((para, i) => para.trim() && <p key={i}>{para.trim()}</p>)}
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
          <button
            className={styles.downloadBtn}
            type="button"
            onClick={handleDownload}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 2v8M5 7l3 3 3-3M3 13h10"
                stroke="#e8d5a3"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
