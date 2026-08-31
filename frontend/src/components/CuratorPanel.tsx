import { curatorialProfiles } from '../data/curatorialProfiles'
import type { GraphNode } from '../types/graph'

type CuratorPanelProps = {
  selectedNode: GraphNode | null
  onAddToExhibition: (node: GraphNode) => void
}

function CuratorPanel({
  selectedNode,
  onAddToExhibition,
}: CuratorPanelProps) {
  if (!selectedNode) {
    return (
      <aside>
        <h2>Curator</h2>
        <p>Select a node to explore it.</p>
      </aside>
    )
  }

  const profile = curatorialProfiles.find(
    (profile) => profile.nodeId === selectedNode.id
  )

  if (!profile) {
    return (
      <aside>
        <h2>Curator</h2>
        <p>{selectedNode.kind}</p>
        <h3>{selectedNode.label}</h3>

        <button
          type="button"
          onClick={() => onAddToExhibition(selectedNode)}
        >
          Add to exhibition
        </button>
      </aside>
    )
  }

  return (
    <aside>
      <h2>Curator</h2>

      <p>{profile.eyebrow}</p>
      <h3>{profile.title}</h3>

      {profile.dates && <p>{profile.dates}</p>}

      <p>{profile.summary}</p>

      <h4>Threads</h4>

      <ul>
        {profile.themes.map((theme) => (
          <li key={theme}>{theme}</li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onAddToExhibition(selectedNode)}
      >
        Add to exhibition
      </button>
    </aside>
  )
}

export default CuratorPanel