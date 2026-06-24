"use client";

import styles from "./LoadingScreen.module.css";

interface Props {
  isLoading: boolean;
  onOpen: () => void;
}

export default function LoadingScreen({ isLoading, onOpen }: Props) {
  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.boxContainer} ${styles.dropping}`}
        onClick={!isLoading ? onOpen : undefined}
        role={!isLoading ? "button" : undefined}
        tabIndex={!isLoading ? 0 : undefined}
        onKeyDown={(e) => {
          if (!isLoading && (e.key === "Enter" || e.key === " ")) onOpen();
        }}
      >
        <div className={styles.boxBody}>
          <div className={styles.boxBackground}>
            <div className={styles.doorLeft} />
            <div className={styles.doorRight} />
          </div>
        </div>
      </div>

      <p className={styles.hint}>
        {isLoading ? (
          <span className={styles.loading}>해몽 중<span className={styles.dots} /></span>
        ) : (
          "부적함을 눌러주세요"
        )}
      </p>
    </div>
  );
}
