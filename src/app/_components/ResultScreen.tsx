"use client";

import styles from "./ResultScreen.module.css";

interface Props {
  summary: string;
  analysis: string;
  goodElements?: string;
  badElements?: string;
  onReset: () => void;
}

export default function ResultScreen({ summary, analysis, goodElements, badElements, onReset }: Props) {
  return (
    <div className={styles.wrap}>
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

      <button className={styles.resetBtn} onClick={onReset}>
        다시 입력하기
      </button>
    </div>
  );
}