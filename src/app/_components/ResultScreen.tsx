"use client";

import styles from "./ResultScreen.module.css";

interface Props {
  summary: string;
  analysis: string;
  onReset: () => void;
}

export default function ResultScreen({ summary, analysis, onReset }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.boxContainer}>
        <div className={styles.boxBody}>
          <div className={styles.boxBackground}>
            <div className={`${styles.doorLeft} ${styles.open}`} />
            <div className={`${styles.doorRight} ${styles.open}`} />
          </div>

          <div className={`${styles.talisman} ${styles.show}`}>
            <div className={styles.paper}>
              <div className={styles.paperContent}>
                <h3 className={styles.summary}>{summary}</h3>
                <div className={styles.analysis}>
                  {analysis.split("\n\n").map(
                    (para, i) =>
                      para.trim() && <p key={i}>{para.trim()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className={styles.resetBtn} onClick={onReset}>
        다시 입력하기
      </button>
    </div>
  );
}
