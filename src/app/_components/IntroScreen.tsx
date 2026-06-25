"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./IntroScreen.module.css";

interface Props {
  onSubmit: (dreamText: string) => void;
}

export default function IntroScreen({ onSubmit }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moonParallaxRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputMode, setInputMode] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;
    let logicalW = 0;
    let logicalH = 0;
    let stars: {
      x: number; y: number;
      deltax: number; deltay: number;
      vx: number; vy: number;
      size: number; alpha: number; target: number;
      base: number; twinkleSpeed: number; twinkleDir: number;
      depth: number; floatPhase: number;
    }[] = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      logicalW = canvas.offsetWidth;
      logicalH = canvas.offsetHeight;
      canvas.width = logicalW * dpr;
      canvas.height = logicalH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };

    const initStars = () => {
      stars = [];
      const count = Math.floor((logicalW * logicalH) / 2800);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * logicalW,
          y: Math.random() * logicalH,
          deltax: 0, deltay: 0,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.08,
          size: Math.random() * 0.4 + 0.2,
          base: Math.random() * 0.5 + 0.2,
          alpha: Math.random() * 0.4 + 0.15,
          target: Math.random() * 0.6 + 0.25,
          twinkleSpeed: Math.random() * 0.008 + 0.003,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
          depth: Math.random() * 0.6 + 0.2,
          floatPhase: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, logicalW, logicalH);
      stars.forEach((s) => {
        // 반짝임
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= s.target) { s.alpha = s.target; s.twinkleDir = -1; }
        if (s.alpha <= s.base * 0.3) {
          s.alpha = s.base * 0.3;
          s.twinkleDir = 1;
          s.target = Math.random() * 0.6 + 0.25;
        }

        // 자율 이동 + 화면 경계 랩
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < -20) s.x = logicalW + 10;
        if (s.x > logicalW + 20) s.x = -10;
        if (s.y < -20) s.y = logicalH + 10;
        if (s.y > logicalH + 20) s.y = -10;

        // 마우스 반발
        const dx = mouse.x - (s.x + s.deltax);
        const dy = mouse.y - (s.y + s.deltay);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 130;

        if (dist < maxDist && dist > 0) {
          const proximity = 1 - dist / maxDist;
          const force = proximity * s.depth;
          s.deltax += (-(dx / dist) * force * 100 * s.size - s.deltax) * 0.1;
          s.deltay += (-(dy / dist) * force * 100 * s.size - s.deltay) * 0.1;
          s.alpha += (0.95 - s.alpha) * proximity * 0.15;
        } else {
          s.deltax += (0 - s.deltax) * 0.06;
          s.deltay += (0 - s.deltay) * 0.06;
        }

        const floatY = Math.sin(time + s.floatPhase) * 2;
        const px = s.x + s.deltax;
        const py = s.y + s.deltay + floatY;

        // radial gradient로 부드러운 빛 번짐
        const r = s.size * 3.5;
        const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
        grad.addColorStop(0,   `rgba(232,213,163,${s.alpha})`);
        // grad.addColorStop(0.3, `rgba(232,213,163,${s.alpha * 0.55})`);
        // grad.addColorStop(1,   `rgba(232,213,163,0)`);
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      if (moonParallaxRef.current) {
        const mx = ((mouse.x / logicalW) - 0.5) * -20;
        const my = ((mouse.y / logicalH) - 0.5) * -20;
        moonParallaxRef.current.style.transform = `translate(${mx}px, ${my}px)`;
      }
    };
    const onMouseLeave = () => {
      mouse.x = -9999; mouse.y = -9999;
      if (moonParallaxRef.current) {
        moonParallaxRef.current.style.transform = "translate(0px, 0px)";
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    resize();
    draw();

    canvas.parentElement?.addEventListener("mousemove", onMouseMove);
    canvas.parentElement?.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      canvas.parentElement?.removeEventListener("mousemove", onMouseMove);
      canvas.parentElement?.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;
      if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) {
        setExiting(true);
        textareaRef.current?.focus();
        setTimeout(() => { setInputMode(true); setExiting(false); }, 350);
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

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={`${styles.moonWrap} ${(exiting || inputMode) ? styles.moonMoved : ''}`}>
          <div ref={moonParallaxRef} className={styles.moonParallax}>
            <div className={styles.moonBlock}>
              <div className={styles.moon}>
                <div className={styles.moonCut} />
              </div>
            </div>
          </div>
          </div>
          <div className={styles.textGroup}>
            <div className={`${styles.staticContent} ${(exiting || inputMode) ? styles.staticGone : ''}`}>
              <h1 className={styles.title}>꿈해몽</h1>
              <div className={styles.divider} />
              <p className={styles.subtitle}>
                수천 년의 해몽 전통과 현대 심리학이<br />
                당신의 꿈이 전하는 말을 읽어드립니다.
              </p>
            </div>
            <div className={`${styles.dreamInputWrap} ${inputMode ? styles.dreamInputVisible : ''}`}>
              <textarea
                ref={textareaRef}
                className={styles.dreamInput}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (inputValue.trim()) onSubmit(inputValue.trim());
                  }
                }}
                placeholder="꿈의 내용을 입력해주세요..."
                rows={8}
              />
              <button
                type="button"
                className={styles.submitArrow}
                onClick={() => { if (inputValue.trim()) onSubmit(inputValue.trim()); }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#e8d5a3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
