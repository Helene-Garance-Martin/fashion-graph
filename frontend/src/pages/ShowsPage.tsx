import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useShows } from "../hooks/useShows";

import styles from "./ShowsPage.module.css";

function ShowsPage() {
  const navigate = useNavigate();

  const { shows, loading, error, remove, refreshShows } = useShows();

  const [deletingShowId, setDeletingShowId] = useState<string | null>(null);

  const handleDelete = async (
    showId: string,
    title: string,
    diaCount: number,
  ) => {
    const displayTitle = title.trim() || "Untitled Show";

    const confirmed = window.confirm(
      `Delete "${displayTitle}"?\n\nThis will remove the show and its ${diaCount} dias.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingShowId(showId);

    try {
      await remove(showId);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unknown API error.";

      window.alert(`Couldn't delete this Show.\n\n${message}`);
    } finally {
      setDeletingShowId(null);
    }
  };

  const handleRetry = async () => {
    await refreshShows();
  };

  return (
    <main className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          ← Explore
        </Link>

        <p className={styles.count}>
          {shows.length} {shows.length === 1 ? "show" : "shows"}
        </p>
      </div>

      <header className={styles.headingBlock}>
        <p className={styles.eyebrow}>Exhibition archive</p>

        <h1 className={styles.heading}>My Shows</h1>
      </header>

      {error && (
        <section className={styles.empty}>
          <p className={styles.emptyText}>
            Couldn&apos;t refresh your Shows. Your locally saved Shows are still
            available.
          </p>

          <button
            type="button"
            className={styles.createLink}
            onClick={handleRetry}
          >
            Try again →
          </button>
        </section>
      )}

      {loading && shows.length === 0 ? (
        <section className={styles.empty}>
          <p className={styles.emptyText}>Loading Shows…</p>
        </section>
      ) : shows.length === 0 ? (
        <section className={styles.empty}>
          <p className={styles.emptyText}>No saved shows yet.</p>

          <Link to="/" className={styles.createLink}>
            Create a show from Explore →
          </Link>
        </section>
      ) : (
        <ul className={styles.list}>
          {shows.map((show) => {
            const isDeleting = deletingShowId === show.id;

            return (
              <li key={show.id} className={styles.item}>
                <div className={styles.showRow}>
                  <button
                    type="button"
                    className={styles.showMain}
                    onClick={() => navigate(`/shows/${show.id}/edit`)}
                  >
                    <span className={styles.title}>
                      {show.title.trim() || "Untitled Show"}
                    </span>

                    <span className={styles.meta}>
                      {show.dias.length}{" "}
                      {show.dias.length === 1 ? "dia" : "dias"}
                    </span>
                  </button>

                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.editButton}
                      onClick={() => navigate(`/shows/${show.id}/edit`)}
                    >
                      Edit →
                    </button>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      disabled={isDeleting}
                      onClick={() =>
                        void handleDelete(show.id, show.title, show.dias.length)
                      }
                    >
                      {isDeleting ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default ShowsPage;
