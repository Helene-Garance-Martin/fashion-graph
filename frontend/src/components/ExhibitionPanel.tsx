import type { GraphNode } from '../types/graph'

type ExhibitionPanelProps = {
  items: GraphNode[]
  onRemove: (nodeId: string) => void
}

function ExhibitionPanel({
  items,
  onRemove,
}: ExhibitionPanelProps) {
  return (
    <section>
      <h3>The Exhibition</h3>

      {items.length === 0 ? (
        <p>No objects selected yet.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.label}{' '}

              <button
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