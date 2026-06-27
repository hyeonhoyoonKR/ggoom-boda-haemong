"use client";

import { useRef, useState } from "react";
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
  const [copied, setCopied] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const handleCopy = async () => {
    const text = `${summary}\n\n${analysis}\n\n좋은요소: ${goodElements ?? ""}\n\n나쁜요소: ${badElements ?? ""}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts (e.g. http://192.168.x.x on mobile)
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!rating || feedbackLoading) return;
    setFeedbackLoading(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      setFeedbackSent(true);
    } finally {
      setFeedbackLoading(false);
    }
  };

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
            className={styles.feedbackBtn}
            type="button"
            onClick={() => setShowFeedback(true)}
          >
            의견 보내기
          </button>
          <button
            className={styles.copyBtn}
            type="button"
            onClick={handleCopy}
            aria-label="복사하기"
          >
            {copied ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8.5l3.2 3.2L13 4.8"
                  stroke="#e8d5a3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect
                  x="5.5"
                  y="5.5"
                  width="8"
                  height="8"
                  rx="1.5"
                  stroke="#e8d5a3"
                  strokeWidth="1.5"
                />
                <path
                  d="M3.3 10.5H3A1.5 1.5 0 0 1 1.5 9V3A1.5 1.5 0 0 1 3 1.5h6A1.5 1.5 0 0 1 10.5 3v.3"
                  stroke="#e8d5a3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
          <button
            className={styles.downloadBtn}
            type="button"
            onClick={handleDownload}
            aria-label="이미지 저장"
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
      {showFeedback && (
        <div className={styles.modalOverlay} onClick={() => setShowFeedback(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {feedbackSent ? (
              <p className={styles.modalThanks}>의견을 보내주셔서 감사합니다 🙏</p>
            ) : (
              <>
                <h4 className={styles.modalTitle}>해몽이 마음에 드셨나요?</h4>
                <div className={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className={styles.star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={`${star}점`}
                    >
                      {star <= (hoverRating || rating) ? "★" : "☆"}
                    </button>
                  ))}
                </div>
                <textarea
                  className={styles.modalTextarea}
                  placeholder="한줄 의견 (선택사항)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={200}
                />
                <button
                  className={styles.modalSubmit}
                  type="button"
                  onClick={handleFeedbackSubmit}
                  disabled={!rating || feedbackLoading}
                >
                  {feedbackLoading ? "보내는 중..." : "보내기"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
