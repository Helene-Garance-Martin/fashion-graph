import type { Show } from "../types/show";

import styles from "./ShowEditor.module.css";

type ShowEditorProps = {
  show: Show;
  onBack: () => void;
  onTitleChange: (title: string) => void;
};

function ShowEditor({ show, onBack, onTitleChange }: ShowEditorProps) {
  return (
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
            onChange={(event) => {
              onTitleChange(event.target.value);
            }}
            aria-label="Show title"
          />
        </div>

        <p className={styles.count}>
          {show.dias.length} {show.dias.length === 1 ? "dia" : "dias"}
        </p>
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
  );
}

export default ShowEditor;
