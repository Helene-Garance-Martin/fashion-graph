import { Link } from "react-router-dom";

import type { Show } from "../types/show";

import styles from "./ShowsPage.module.css";

type ShowsPageProps = {
  shows: Show[];
};

function ShowsPage({ shows }: ShowsPageProps) {
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
              <Link to={`/shows/${show.id}/edit`} className={styles.showLink}>
                <span className={styles.title}>
                  {show.title.trim() || "Untitled Show"}
                </span>

                <span className={styles.meta}>
                  {show.dias.length} {show.dias.length === 1 ? "dia" : "dias"}
                </span>

                <span className={styles.edit}>Edit →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default ShowsPage;
