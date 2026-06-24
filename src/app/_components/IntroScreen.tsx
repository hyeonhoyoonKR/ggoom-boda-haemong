"use client";

import { useEffect, useRef } from "react";
import styles from "./IntroScreen.module.css";

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: {
      x: number; y: number;
      ox: number; oy: number;
      size: number; alpha: number; target: number;
      base: number; twinkleSpeed: number; twinkleDir: number;
      depth: number;
    }[] = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 2200);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          ox: 0, oy: 0,
          size: Math.random() * 1.4 + 0.3,
          base: Math.random() * 0.5 + 0.15,
          alpha: Math.random() * 0.3 + 0.1,
          target: Math.random() * 0.5 + 0.2,
          twinkleSpeed: Math.random() * 0.008 + 0.003,
          twinkleDir: Math.random() > 0.5 ? 1 : -1,
          depth: Math.random() * 0.6 + 0.2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.alpha += s.twinkleSpeed * s.twinkleDir;
        if (s.alpha >= s.target) { s.alpha = s.target; s.twinkleDir = -1; }
        if (s.alpha <= s.base * 0.3) {
          s.alpha = s.base * 0.3;
          s.twinkleDir = 1;
          s.target = Math.random() * 0.5 + 0.2;
        }

        const dx = mouse.x - (s.x + s.ox);
        const dy = mouse.y - (s.y + s.oy);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 130;
        let glow = s.alpha;

        if (dist < maxDist) {
          const force = (1 - dist / maxDist) * s.depth;
          s.ox += (-dx * force * 0.04 - s.ox) * 0.12;
          s.oy += (-dy * force * 0.04 - s.oy) * 0.12;
          glow = Math.min(1, s.alpha + force * 0.8);
        } else {
          s.ox += (0 - s.ox) * 0.06;
          s.oy += (0 - s.oy) * 0.06;
        }

        const px = s.x + s.ox;
        const py = s.y + s.oy;

        if (glow > s.alpha + 0.1) {
          ctx.beginPath();
          ctx.arc(px, py, s.size + 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232,213,163,${glow * 0.18})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232,213,163,${glow})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

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

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} />

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.moonBlock}>
            <div className={styles.moon}>
              <div className={styles.moonCut} />
            </div>
          </div>
          <h1 className={styles.title}>꿈해몽</h1>
          <div className={styles.divider} />
          <p className={styles.subtitle}>
            <span className={styles.muted}>간밤에 꾼 꿈, 그냥 흘려보내지 마세요.<br /></span>
            수천 년의 해몽 전통과 현대 심리학이<br />
            당신의 꿈이 전하는 말을 읽어드립니다.<br />
            <span className={styles.muted}>꿈을 기억하는 한, 의미는 사라지지 않아요.</span>
          </p>
        </div>

        <div className={styles.right}>
          <button className={styles.btn} onClick={onStart}>
            꿈을 들려주세요
            <span className={styles.arrow}>→</span>
          </button>
          <p className={styles.hint}>버튼을 눌러 시작하세요</p>
        </div>
      </div>
    </div>
  );
}
