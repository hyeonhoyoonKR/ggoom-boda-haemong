"use client";

import styles from "./LoadingScreen.module.css";

interface Props {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.moonBlock}>
        <div className={styles.moon}>
          <div className={`${styles.moonCut} ${styles.orbiting}`} />
        </div>
      </div>
      <p className={styles.hint}>
        {isLoading ? "해몽 중..." : "잠시만 기다려 주세요"}
      </p>
    </div>
  );
}
