import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { Show } from "../types/show";

import styles from "./ShowPresentation.module.css";

type ShowPresentationProps = {
  show: Show;
  onExit: () => void;
};

const CONTROLS_HIDE_DELAY = 3000;

function ShowPresentation({ show, onExit }: ShowPresentationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hideTimerRef = useRef<number | null>(null);
  const controlsHoveredRef = useRef(false);

  const touchStartRef = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const dias = useMemo(
    () => [...show.dias].sort((a, b) => a.order - b.order),
    [show.dias],
  );

  const currentDia = dias[currentIndex];

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleControlsHide = useCallback(() => {
    clearHideTimer();

    hideTimerRef.current = window.setTimeout(() => {
      if (controlsHoveredRef.current) {
        return;
      }

      const activeElement = document.activeElement;

      if (
        activeElement instanceof HTMLElement &&
        activeElement.dataset.presentationControl === "true"
      ) {
        return;
      }

      setControlsVisible(false);
    }, CONTROLS_HIDE_DELAY);
  }, [clearHideTimer]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const goPrevious = useCallback(() => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(dias.length - 1, index + 1));
  }, [dias.length]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    revealControls();

    if (event.pointerType !== "touch") {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.closest('[data-presentation-control="true"]')) {
      return;
    }

    touchStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "touch" || !touchStartRef.current) {
      return;
    }

    const start = touchStartRef.current;

    touchStartRef.current = null;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    const isHorizontalSwipe =
      Math.abs(deltaX) >= 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2;

    if (!isHorizontalSwipe) {
      return;
    }

    if (deltaX < 0) {
      goNext();
    } else {
      goPrevious();
    }

    revealControls();
  };

  const handleFullscreen = async () => {
    revealControls();

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  };

  useEffect(() => {
    scheduleControlsHide();

    return clearHideTimer;
  }, [clearHideTimer, scheduleControlsHide]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));

      revealControls();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [revealControls]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      revealControls();

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
        return;
      }

      if (event.key === "Escape") {
        /*
         * When fullscreen is active,
         * the browser owns the first Escape:
         *
         * fullscreen → presentation
         *
         * A second Escape returns to the editor.
         */
        if (document.fullscreenElement) {
          return;
        }

        onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [goNext, goPrevious, onExit, revealControls]);

  const controlInteractionProps = {
    "data-presentation-control": "true",

    onPointerEnter: () => {
      controlsHoveredRef.current = true;

      clearHideTimer();
      setControlsVisible(true);
    },

    onPointerLeave: () => {
      controlsHoveredRef.current = false;

      scheduleControlsHide();
    },

    onFocus: () => {
      clearHideTimer();
      setControlsVisible(true);
    },

    onBlur: () => {
      scheduleControlsHide();
    },
  };

  if (!currentDia) {
    return (
      <main
        className={styles.presentation}
        onPointerMove={revealControls}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          touchStartRef.current = null;
        }}
      >
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

  const chromeClass = controlsVisible
    ? styles.chrome
    : `${styles.chrome} ${styles.chromeHidden}`;

  const canFullscreen =
    typeof document !== "undefined" &&
    typeof document.documentElement.requestFullscreen === "function";

  return (
    <main
      className={`${styles.presentation} ${
        !controlsVisible ? styles.presentationIdle : ""
      }`}
      onPointerMove={revealControls}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        touchStartRef.current = null;
      }}
      onFocusCapture={revealControls}
    >
      <header className={styles.topBar}>
        <button
          type="button"
          className={`${styles.exitButton} ${chromeClass}`}
          onClick={onExit}
          {...controlInteractionProps}
        >
          ← Exit
        </button>

        <p className={styles.showTitle}>
          {show.title.trim() || "Untitled Show"}
        </p>

        {canFullscreen && (
          <button
            type="button"
            className={`${styles.fullscreenButton} ${chromeClass}`}
            onClick={handleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            {...controlInteractionProps}
          >
            {isFullscreen ? "Exit fullscreen ⛶" : "Fullscreen ⛶"}
          </button>
        )}
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
        className={`${styles.navigation} ${styles.previous} ${chromeClass}`}
        onClick={goPrevious}
        disabled={currentIndex === 0}
        aria-label="Previous dia"
        {...controlInteractionProps}
      >
        ‹
      </button>

      <button
        type="button"
        className={`${styles.navigation} ${styles.next} ${chromeClass}`}
        onClick={goNext}
        disabled={currentIndex === dias.length - 1}
        aria-label="Next dia"
        {...controlInteractionProps}
      >
        ›
      </button>
    </main>
  );
}

export default ShowPresentation;
