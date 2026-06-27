"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./IntroScreen.module.css";

interface Props {
  onSubmit: (dreamText: string) => void;
  /** External ref to the moon element so MoonLayer can measure its position. */
  moonRef?: React.RefObject<HTMLDivElement | null>;
  /** True while MoonLayer is flying back from the result screen to this moon's
   *  spot. The intro's own moon stays hidden + entrance-less until handoff. */
  moonReturning?: boolean;
}

export default function IntroScreen({ onSubmit, moonRef: moonRefProp, moonReturning = false }: Props) {
  const moonParallaxRef = useRef<HTMLDivElement>(null);
  const internalMoonRef = useRef<HTMLDivElement>(null);
  const moonRef = moonRefProp ?? internalMoonRef;
  // Captured at mount: if this intro instance appeared because of a reset return,
  // the moon must skip its fadeUp entrance and sit at the settled position so the
  // incoming MoonLayer moon lands exactly on it (no translateY drift).
  const skipMoonEntrance = useRef(moonReturning);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSubmittingRef = useRef(false);
  const [inputMode, setInputMode] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isSubmittingRef.current || !moonParallaxRef.current) return;
      const mx = (e.clientX / window.innerWidth - 0.5) * -20;
      const my = (e.clientY / window.innerHeight - 0.5) * -20;
      moonParallaxRef.current.style.transform = `translate(${mx}px, ${my}px)`;
    };
    const onMouseLeave = () => {
      if (isSubmittingRef.current || !moonParallaxRef.current) return;
      moonParallaxRef.current.style.transform = "translate(0px, 0px)";
    };
    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        setExiting(true);
        e.preventDefault();

        textareaRef.current?.focus();
        setTimeout(() => {
          setInputMode(true);
          setExiting(false);
          const el = textareaRef.current;
          if (el && e.key.length === 1) {
            const start = el.selectionStart ?? el.value.length;
            const end = el.selectionEnd ?? el.value.length;
            el.setRangeText(e.key, start, end, "end");
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }, 350);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (inputMode) {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.setSelectionRange(ta.value.length, ta.value.length);
      }
    }
  }, [inputMode]);

  const doSubmit = (dream: string) => {
    if (!dream.trim() || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);

    const moonEl = moonRef.current;
    if (!moonEl) {
      onSubmit(dream);
      return;
    }

    const rect = moonEl.getBoundingClientRect();
    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
    const scale = 120 / 52;

    // .moon has no CSS animation, so JS transition works without conflict
    moonEl.style.transition = "none";
    moonEl.style.transform = "translate(0, 0) scale(1)";
    void moonEl.getBoundingClientRect();

    requestAnimationFrame(() => {
      moonEl.style.transition = "transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)";
      moonEl.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
    });

    moonEl.addEventListener(
      "transitionend",
      () => setTimeout(() => onSubmit(dream), 100),
      { once: true },
    );
  };

  const handleWrapClick = () => {
    if (inputMode || exiting || submitting) return;
    setExiting(true);
    textareaRef.current?.focus();
    setTimeout(() => {
      setInputMode(true);
      setExiting(false);
    }, 350);
  };

  return (
    <div className={styles.wrap} onClick={handleWrapClick}>
      <div className={styles.content}>
        <div className={styles.left}>
          <div
            className={`${styles.moonWrap} ${exiting || inputMode ? styles.moonMoved : ""}`}
          >
            <div ref={moonParallaxRef} className={styles.moonParallax}>
              <div
                className={`${styles.moonBlock} ${
                  skipMoonEntrance.current ? styles.moonSettled : ""
                } ${moonReturning ? styles.moonHidden : ""}`}
              >
                <div ref={moonRef} className={styles.moon}>
                  <div className={styles.moonCut} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.textGroup}>
            <div
              className={`${styles.staticContent} ${exiting || inputMode ? styles.staticGone : ""}`}
            >
              <h1 className={styles.title}>꿈해몽</h1>
              <div className={styles.divider} />
              <p className={styles.subtitle}>
                {/* 수천 년의 해몽 전통과 현대 심리학이<br />
                당신의 꿈이 전하는 말을 읽어드립니다. */}
                화면을 클릭해주세요
              </p>
            </div>
            <div
              className={`${styles.dreamInputWrap} ${inputMode ? styles.dreamInputVisible : ""}`}
              style={
                submitting
                  ? {
                      opacity: 0,
                      pointerEvents: "none",
                      transition: "opacity 0.25s ease",
                    }
                  : {}
              }
            >
              <textarea
                ref={textareaRef}
                className={styles.dreamInput}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    doSubmit(inputValue.trim());
                  }
                }}
                placeholder="꿈의 내용을 입력해주세요..."
                rows={8}
              />
              <button
                type="button"
                className={styles.submitArrow}
                onClick={(e) => {
                  e.stopPropagation();
                  doSubmit(inputValue.trim());
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
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
      </div>
    </div>
  );
}
