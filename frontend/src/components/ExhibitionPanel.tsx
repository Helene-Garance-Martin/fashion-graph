import type { GraphNode } from '../types/graph'
import styles from './ExhibitionPanel.module.css'

type ExhibitionPanelProps = {
  items: GraphNode[]
  onRemove: (nodeId: string) => void
}

function ExhibitionPanel({
  items,
  onRemove,
}: ExhibitionPanelProps) {
  return (
    <section className={styles.panel}>
      <h3 className={styles.heading}>
        The Exhibition
      </h3>

      {items.length === 0 ? (
        <p className={styles.empty}>
          No objects selected yet.
        </p>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li
              key={item.id}
              className={styles.item}
            >
              <span className={styles.label}>
                {item.label}
              </span>

              <button
                className={styles.remove}
                type="button"
                onClick={() => onRemove(item.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default ExhibitionPanel