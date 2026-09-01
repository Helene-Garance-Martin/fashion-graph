import type { GraphNode } from '../types/graph'
import { curatorialProfiles } from '../data/curatorialProfiles'

import styles from './CuratorPanel.module.css'

type CuratorPanelProps = {
  selectedNode: GraphNode | null
  onAddToExhibition: (
    node: GraphNode
  ) => void
  isInExhibition: boolean
}

function CuratorPanel({
  selectedNode,
  onAddToExhibition,
  isInExhibition,
}: CuratorPanelProps) {
  if (!selectedNode) {
    return (
      <section className={styles.panel}>
        <h2 className={styles.panelTitle}>
          Curator
        </h2>

        <p className={styles.empty}>
          Select something in the graph.
        </p>
      </section>
    )
  }

  const profile =
    curatorialProfiles.find(
      (item) =>
        item.nodeId === selectedNode.id
    )

  const isObject =
    selectedNode.kind === 'ARTWORK' ||
    selectedNode.kind === 'GARMENT'

  const canShowImage =
    selectedNode.kind === 'ARTWORK' &&
    Boolean(
      selectedNode.image ||
      selectedNode.imageSmall
    )

  const curatorImage =
    selectedNode.image ||
    selectedNode.imageSmall

  const artistName = [
    selectedNode.artistPrefix,
    selectedNode.artist,
  ]
    .filter(Boolean)
    .join(' ')

  const hasObjectDetails =
    Boolean(selectedNode.classification) ||
    Boolean(selectedNode.dimensions) ||
    Boolean(selectedNode.description)

  const addButton = (
    <button
      type="button"
      className={`${styles.exhibitionButton} ${
        isInExhibition
          ? styles.exhibitionButtonSelected
          : ''
      }`}
      onClick={() =>
        onAddToExhibition(selectedNode)
      }
      disabled={isInExhibition}
      aria-label={
        isInExhibition
          ? `${selectedNode.label} is already in the exhibition`
          : `Add ${selectedNode.label} to the exhibition`
      }
      title={
        isInExhibition
          ? 'In exhibition'
          : 'Add to exhibition'
      }
    >
      {isInExhibition ? '✓' : '+'}
    </button>
  )

  return (
    <section className={styles.panel}>
      <h2 className={styles.panelTitle}>
        Curator
      </h2>

      {profile ? (
        <div className={styles.profile}>
          <div className={styles.profileHeader}>
            <div>
              <p className={styles.kind}>
                {profile.eyebrow}
              </p>

              <h3 className={styles.title}>
                {profile.title}
              </h3>
            </div>

            <div className={styles.profileAction}>
              {addButton}
            </div>
          </div>

          {profile.dates && (
            <p className={styles.origin}>
              {profile.dates}
            </p>
          )}

          <p className={styles.summary}>
            {profile.summary}
          </p>

          {profile.themes.length > 0 && (
            <div className={styles.threads}>
              <p className={styles.threadsTitle}>
                Threads
              </p>

              <ul>
                {profile.themes.map(
                  (theme) => (
                    <li key={theme}>
                      {theme}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          <p className={styles.kind}>
            {selectedNode.kind}
          </p>

          <h3 className={styles.title}>
            {selectedNode.label}
          </h3>

          {isObject && (
            <div className={styles.mediaFrame}>
              {canShowImage &&
              curatorImage ? (
                <img
                  className={styles.mediaImage}
                  src={curatorImage}
                  alt={selectedNode.label}
                />
              ) : (
                <div
                  className={
                    styles.mediaPlaceholder
                  }
                >
                  <span
                    className={
                      styles.placeholderKind
                    }
                  >
                    {selectedNode.kind}
                  </span>

                  <strong>
                    {selectedNode.label}
                  </strong>

                  {selectedNode.date && (
                    <span>
                      {selectedNode.date}
                    </span>
                  )}
                </div>
              )}

              {addButton}
            </div>
          )}

          <div className={styles.objectInfo}>
            {artistName && (
              <p className={styles.artist}>
                {artistName}
              </p>
            )}

            {(selectedNode.date ||
              selectedNode.culture) && (
              <p className={styles.metaLine}>
                {[
                  selectedNode.date,
                  selectedNode.culture,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}

            {selectedNode.medium && (
              <p className={styles.medium}>
                {selectedNode.medium}
              </p>
            )}

            {selectedNode.url && (
              <a
                className={styles.metLink}
                href={selectedNode.url}
                target="_blank"
                rel="noreferrer"
              >
                View at The Met ↗
              </a>
            )}

            {hasObjectDetails && (
              <details
                className={styles.details}
              >
                <summary>
                  Object details
                </summary>

                <div
                  className={
                    styles.detailsBody
                  }
                >
                  {selectedNode.classification && (
                    <div
                      className={
                        styles.detailRow
                      }
                    >
                      <span>
                        Classification
                      </span>

                      <p>
                        {
                          selectedNode.classification
                        }
                      </p>
                    </div>
                  )}

                  {selectedNode.dimensions && (
                    <div
                      className={
                        styles.detailRow
                      }
                    >
                      <span>
                        Dimensions
                      </span>

                      <p>
                        {
                          selectedNode.dimensions
                        }
                      </p>
                    </div>
                  )}

                  {selectedNode.description && (
                    <div
                      className={
                        styles.detailRow
                      }
                    >
                      <span>
                        Description
                      </span>

                      <p>
                        {
                          selectedNode.description
                        }
                      </p>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </>
      )}
    </section>
  )
}

export default CuratorPanel
