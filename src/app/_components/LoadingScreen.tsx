"use client";

import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";

const LOADING_TEXTS = [
  "꿈 백과사전 읊는중...",
  "달님께 여쭤보는중...",
  "꿈속 단서 수집하는중...",
  "별빛으로 암호 해독하는중...",
  "잠든 기억 들여다보는중...",
  "꿈의 실마리 풀어내는중...",
];

interface Props {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: Props) {
  const [stopping, setStopping] = useState(false);
  const [textIndex, setTextIndex] = useState(() => Math.floor(Math.random() * LOADING_TEXTS.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setStopping(true);
      return;
    }

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setTextIndex(i => {
          let next = Math.floor(Math.random() * LOADING_TEXTS.length);
          while (next === i) next = Math.floor(Math.random() * LOADING_TEXTS.length);
          return next;
        });
        setVisible(true);
      }, 200);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading]);

  return (
    <div className={styles.wrap}>
      <p
        className={`${styles.hint} ${stopping ? styles.hintFade : ""}`}
        style={{ opacity: visible ? undefined : 0, transition: "opacity 0.2s ease" }}
      >
        {LOADING_TEXTS[textIndex]}
      </p>
    </div>
  );
}
