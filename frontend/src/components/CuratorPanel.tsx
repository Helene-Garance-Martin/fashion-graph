import type { GraphNode } from '../types/graph'

type CuratorPanelProps = {
  selectedNode: GraphNode | null
}

function CuratorPanel({ selectedNode }: CuratorPanelProps) {
  return (
    <aside>
      <h2>Curator</h2>

      {selectedNode ? (
        <>
          <p>{selectedNode.kind}</p>
          <h3>{selectedNode.label}</h3>
        </>
      ) : (
        <p>Select a node to explore it.</p>
      )}
    </aside>
  )
}

export default CuratorPanel