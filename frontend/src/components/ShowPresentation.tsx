import { useEffect, useMemo, useState } from "react";

import type { Show } from "../types/show";

import styles from "./ShowPresentation.module.css";

type ShowPresentationProps = {
  show: Show;
  onExit: () => void;
};

function ShowPresentation({ show, onExit }: ShowPresentationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const dias = useMemo(
    () => [...show.dias].sort((a, b) => a.order - b.order),
    [show.dias],
  );

  const currentDia = dias[currentIndex];

  const goPrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const goNext = () => {
    setCurrentIndex((index) => Math.min(dias.length - 1, index + 1));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goPrevious();
      }

      if (event.key === "ArrowRight") {
        goNext();
      }

      if (event.key === "Escape") {
        onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  if (!currentDia) {
    return (
      <main className={styles.presentation}>
        <button type="button" className={styles.exitButton} onClick={onExit}>
          ← Exit
        </button>

        <p className={styles.empty}>This Show has no dias yet.</p>
      </main>
    );
  }

  const { node } = currentDia;

  const image = node.image ?? node.imageSmall;

  const artist = [node.artistPrefix, node.artist].filter(Boolean).join(" ");

  return (
    <main className={styles.presentation}>
      <header className={styles.topBar}>
        <button type="button" className={styles.exitButton} onClick={onExit}>
          ← Exit
        </button>

        <p className={styles.showTitle}>
          {show.title.trim() || "Untitled Show"}
        </p>
      </header>

      <section className={styles.stage}>
        <div className={styles.mediaArea}>
          {image ? (
            <img className={styles.image} src={image} alt={node.label} />
          ) : (
            <div className={styles.placeholder}>
              <span>{node.kind}</span>
              <strong>{node.label}</strong>
            </div>
          )}
        </div>

        <div className={styles.caption}>
          <div>
            <p className={styles.kind}>{node.kind}</p>

            <h1 className={styles.title}>{node.label}</h1>

            {artist && <p className={styles.meta}>{artist}</p>}

            {node.date && <p className={styles.meta}>{node.date}</p>}

            {currentDia.caption && (
              <p className={styles.diaCaption}>{currentDia.caption}</p>
            )}
          </div>

          <p className={styles.counter}>
            {String(currentIndex + 1).padStart(2, "0")}
            {" / "}
            {String(dias.length).padStart(2, "0")}
          </p>
        </div>
      </section>

      <button
        type="button"
        className={`${styles.navigation} ${styles.previous}`}
        onClick={goPrevious}
        disabled={currentIndex === 0}
        aria-label="Previous dia"
      >
        ‹
      </button>

      <button
        type="button"
        className={`${styles.navigation} ${styles.next}`}
        onClick={goNext}
        disabled={currentIndex === dias.length - 1}
        aria-label="Next dia"
      >
        ›
      </button>
    </main>
  );
}

export default ShowPresentation;
