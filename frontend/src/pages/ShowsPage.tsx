import { Link, useNavigate } from "react-router-dom";

import { useShows } from "../hooks/useShows";

import styles from "./ShowsPage.module.css";

function ShowsPage() {
  const navigate = useNavigate();

  const { shows, remove } = useShows();

  const handleDelete = (showId: string, title: string, diaCount: number) => {
    const displayTitle = title.trim() || "Untitled Show";

    const confirmed = window.confirm(
      `Delete "${displayTitle}"?\n\nThis will remove the show and its ${diaCount} dias.`,
    );

    if (!confirmed) {
      return;
    }

    remove(showId);
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

      {shows.length === 0 ? (
        <section className={styles.empty}>
          <p className={styles.emptyText}>No saved shows yet.</p>

          <Link to="/" className={styles.createLink}>
            Create a show from Explore →
          </Link>
        </section>
      ) : (
        <ul className={styles.list}>
          {shows.map((show) => (
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
                    {show.dias.length} {show.dias.length === 1 ? "dia" : "dias"}
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
                    onClick={() =>
                      handleDelete(show.id, show.title, show.dias.length)
                    }
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default ShowsPage;
