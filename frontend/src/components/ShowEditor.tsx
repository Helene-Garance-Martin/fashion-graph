import { useState } from "react";

import MyShowsPanel from "./MyShowsPanel";

import type { Show } from "../types/show";

import styles from "./ShowEditor.module.css";

type ShowEditorProps = {
  show: Show;
  savedShows: Show[];
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onEditShow: (show: Show) => void;
  onDeleteShow: (show: Show) => void;
};

function ShowEditor({
  show,
  savedShows,
  onBack,
  onTitleChange,
  onSave,
  onEditShow,
  onDeleteShow,
}: ShowEditorProps) {
  const [isShowsOpen, setIsShowsOpen] = useState(true);

  return (
    <div className={styles.workspace}>
      <main className={styles.editor}>
        <header className={styles.header}>
          <button type="button" className={styles.backButton} onClick={onBack}>
            ← Explore
          </button>

          <div>
            <p className={styles.eyebrow}>Show Editor</p>

            <input
              className={styles.titleInput}
              value={show.title}
              placeholder="Untitled Show"
              onChange={(event) => {
                onTitleChange(event.target.value);
              }}
              aria-label="Show title"
            />
          </div>

          <div className={styles.headerActions}>
            <p className={styles.count}>
              {show.dias.length} {show.dias.length === 1 ? "dia" : "dias"}
            </p>

            <button
              type="button"
              className={styles.saveButton}
              onClick={onSave}
            >
              Save Show
            </button>
          </div>
        </header>

        <section className={styles.diaList}>
          {show.dias.map((dia, index) => {
            const image = dia.node.imageSmall ?? dia.node.image;

            return (
              <article key={dia.id} className={styles.dia}>
                <div className={styles.diaNumber}>
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className={styles.media}>
                  {image ? (
                    <img src={image} alt="" className={styles.image} />
                  ) : (
                    <div className={styles.placeholder}>
                      <span>{dia.node.kind}</span>
                    </div>
                  )}
                </div>

                <div className={styles.info}>
                  <p className={styles.kind}>{dia.node.kind}</p>

                  <h2 className={styles.diaTitle}>{dia.node.label}</h2>

                  {dia.node.artist && (
                    <p className={styles.meta}>{dia.node.artist}</p>
                  )}

                  {dia.node.date && (
                    <p className={styles.meta}>{dia.node.date}</p>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <aside
        className={`${styles.showsRail} ${
          !isShowsOpen ? styles.showsRailCollapsed : ""
        }`}
      >
        <button
          type="button"
          className={styles.showsToggle}
          onClick={() => setIsShowsOpen((current) => !current)}
          aria-label={isShowsOpen ? "Close My Shows" : "Open My Shows"}
          aria-expanded={isShowsOpen}
        >
          {isShowsOpen ? "›" : "‹"}
        </button>

        <div
          className={`${styles.showsContent} ${
            !isShowsOpen ? styles.showsContentHidden : ""
          }`}
        >
          <MyShowsPanel
            shows={savedShows}
            activeShowId={show.id}
            onEdit={onEditShow}
            onDelete={onDeleteShow}
          />
        </div>
      </aside>
    </div>
  );
}

export default ShowEditor;
