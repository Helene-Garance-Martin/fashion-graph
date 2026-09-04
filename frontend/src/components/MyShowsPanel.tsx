import type { Show } from "../types/show";

import styles from "./MyShowsPanel.module.css";

type MyShowsPanelProps = {
  shows: Show[];
  activeShowId: string;
  onEdit: (show: Show) => void;
  onDelete: (show: Show) => void;
};

function MyShowsPanel({
  shows,
  activeShowId,
  onEdit,
  onDelete,
}: MyShowsPanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>My Shows</h2>

        <span className={styles.count}>{shows.length}</span>
      </div>

      {shows.length === 0 ? (
        <p className={styles.empty}>No saved shows yet.</p>
      ) : (
        <ul className={styles.list}>
          {shows.map((show) => {
            const isActive = show.id === activeShowId;

            return (
              <li
                key={show.id}
                className={`${styles.item} ${isActive ? styles.active : ""}`}
              >
                <button
                  type="button"
                  className={styles.showButton}
                  onClick={() => onEdit(show)}
                >
                  <span className={styles.chevron}>{isActive ? "⌄" : "›"}</span>

                  <span className={styles.showInfo}>
                    <span className={styles.title}>
                      {show.title.trim() || "Untitled Show"}
                    </span>

                    <span className={styles.meta}>
                      {show.dias.length}{" "}
                      {show.dias.length === 1 ? "dia" : "dias"}
                    </span>
                  </span>
                </button>

                {isActive && (
                  <div className={styles.actions}>
                    <span className={styles.editing}>Editing</span>

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => onDelete(show)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default MyShowsPanel;
