"use client";

import { useEffect, useState } from "react";
import styles from "./LoadingScreen.module.css";

interface Props {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: Props) {
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    if (!isLoading) setStopping(true);
  }, [isLoading]);

  return (
    <div className={styles.wrap}>
      <p className={`${styles.hint} ${stopping ? styles.hintFade : ""}`}>
        해몽 중...
      </p>
    </div>
  );
}
