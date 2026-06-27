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
          <svg width="120" height="120" viewBox="0 0 120 120" style={{display:"block"}}>
            <defs>
              <mask id="loadingMoonMask">
                <rect width="120" height="120" fill="white"/>
                <circle cx="69" cy="37" r="48" fill="black">
                  <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="3s" repeatCount="indefinite"/>
                </circle>
              </mask>
            </defs>
            <circle cx="60" cy="60" r="60" fill="#e8d5a3" mask="url(#loadingMoonMask)"/>
          </svg>
        </div>
      </div>
      <p className={styles.hint}>
        {isLoading ? "해몽 중..." : "잠시만 기다려 주세요"}
      </p>
    </div>
  );
}
