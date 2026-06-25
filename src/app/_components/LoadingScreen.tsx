"use client";

import styles from "./LoadingScreen.module.css";
import StarBackground from "./StarBackground";

interface Props {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: Props) {
  return (
    <div className={styles.wrap}>
      <StarBackground />
      <div className={styles.content}>
        <div className={styles.moonBlock}>
          <div className={styles.moon}>
            <div className={styles.moonCut} />
          </div>
        </div>
        <p className={styles.hint}>
          {isLoading ? "해몽 중..." : "잠시만 기다려 주세요"}
        </p>
      </div>
    </div>
  );
}