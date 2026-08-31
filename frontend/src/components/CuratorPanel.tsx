import {
  curatorialProfiles,
} from '../data/curatorialProfiles'

import type {
  GraphNode,
} from '../types/graph'

type CuratorPanelProps = {
  selectedNode:
    | GraphNode
    | null

  isInExhibition: boolean

  onAddToExhibition: (
    node: GraphNode
  ) => void
}

function CuratorPanel({
  selectedNode,
  isInExhibition,
  onAddToExhibition,
}: CuratorPanelProps) {
  if (!selectedNode) {
    return (
      <aside>
        <h2>Curator</h2>

        <p>
          Select a node to explore it.
        </p>
      </aside>
    )
  }

  const profile =
    curatorialProfiles.find(
      (profile) =>
        profile.nodeId ===
        selectedNode.id
    )

  if (profile) {
    return (
      <aside>
        <h2>Curator</h2>

        <p>
          {profile.eyebrow}
        </p>

        <h3>
          {profile.title}
        </h3>

        {profile.dates && (
          <p>
            {profile.dates}
          </p>
        )}

        <p>
          {profile.summary}
        </p>

        <h4>Threads</h4>

        <ul>
          {profile.themes.map(
            (theme) => (
              <li key={theme}>
                {theme}
              </li>
            )
          )}
        </ul>

        <button
          type="button"
          disabled={
            isInExhibition
          }
          onClick={() =>
            onAddToExhibition(
              selectedNode
            )
          }
        >
          {isInExhibition
            ? 'In exhibition'
            : 'Add to exhibition'}
        </button>
      </aside>
    )
  }

  const canShowImage =
    selectedNode.kind === 'ARTWORK' &&
    Boolean(selectedNode.image)

  return (
    <aside>
      <h2>Curator</h2>

      <p>
        {selectedNode.kind}
      </p>

      <h3>
        {selectedNode.label}
      </h3>

      {canShowImage && (
        <img
          src={selectedNode.image}
          alt={selectedNode.label}
          style={{
            display: 'block',
            width: '100%',
            maxWidth: '320px',
            height: 'auto',
            marginBottom: '1rem',
          }}
        />
      )}

      {selectedNode.date && (
        <p>
          {selectedNode.date}
        </p>
      )}

      {selectedNode.culture && (
        <p>
          {selectedNode.culture}
        </p>
      )}

      {selectedNode.description && (
        <p>
          {selectedNode.description}
        </p>
      )}

      {selectedNode.url && (
        <p>
          <a
            href={selectedNode.url}
            target="_blank"
            rel="noreferrer"
          >
            View at The Met ↗
          </a>
        </p>
      )}

      <button
        type="button"
        disabled={
          isInExhibition
        }
        onClick={() =>
          onAddToExhibition(
            selectedNode
          )
        }
      >
        {isInExhibition
          ? 'In exhibition'
          : 'Add to exhibition'}
      </button>
    </aside>
  )
}

export default CuratorPanel