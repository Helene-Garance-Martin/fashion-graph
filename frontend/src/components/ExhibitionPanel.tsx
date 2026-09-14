import type { GraphNode } from "../types/graph";

import styles from "./ExhibitionPanel.module.css";

type ExhibitionPanelProps = {
  items: GraphNode[];
  onRemove: (nodeId: string) => void;
  onCreateShow: () => void;
};

function ExhibitionPanel({
  items,
  onRemove,
  onCreateShow,
}: ExhibitionPanelProps) {
  const hasItems = items.length > 0;

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>The Exhibition</h2>

        {hasItems && <span className={styles.count}>{items.length}</span>}
      </div>

      {!hasItems ? (
        <p className={styles.empty}>No objects selected.</p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li key={item.id} className={styles.item}>
              <span className={styles.label}>{item.label}</span>

              <button
                type="button"
                className={styles.remove}
                onClick={() => onRemove(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        className={styles.createShow}
        onClick={onCreateShow}
        disabled={!hasItems}
      >
        <span>Create Show</span>

        <span aria-hidden="true" className={styles.arrow}>
          →
        </span>
      </button>
    </section>
  );
}

export default ExhibitionPanel;
