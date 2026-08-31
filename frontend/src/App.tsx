import { useEffect, useState } from 'react'
import Header from './components/Header'
import GraphCanvas from './components/GraphCanvas'
import CuratorPanel from './components/CuratorPanel'
import ExhibitionPanel from './components/ExhibitionPanel'
import { getHouse } from './api/graphApi'
import { toInfluenceGraph } from './adapters/graphAdapter'
import type { GraphData, GraphNode } from './types/graph'
import styles from './App.module.css'

function App() {
  const [graphData, setGraphData] =
    useState<GraphData | null>(null)

  const [selectedNode, setSelectedNode] =
    useState<GraphNode | null>(null)

  const [exhibitionItems, setExhibitionItems] =
    useState<GraphNode[]>([])

  const [graphError, setGraphError] =
    useState(false)

  useEffect(() => {
    getHouse('Vionnet')
      .then((response) => {
        const graph = toInfluenceGraph(response)
        setGraphData(graph)
      })
      .catch(() => {
        setGraphError(true)
      })
  }, [])

  const handleAddToExhibition = (node: GraphNode) => {
    setExhibitionItems((currentItems) => {
      const alreadyExists = currentItems.some(
        (item) => item.id === node.id
      )

      if (alreadyExists) {
        return currentItems
      }

      return [...currentItems, node]
    })
  }

  const handleRemoveFromExhibition = (nodeId: string) => {
    setExhibitionItems((currentItems) =>
      currentItems.filter((item) => item.id !== nodeId)
    )
  }

  const isSelectedNodeInExhibition =
    selectedNode !== null &&
    exhibitionItems.some(
      (item) => item.id === selectedNode.id
    )

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.graph}>
          {graphError ? (
            <p>Unable to load graph.</p>
          ) : graphData ? (
            <GraphCanvas
              graph={graphData}
              selectedNode={selectedNode}
              onNodeSelect={setSelectedNode}
            />
          ) : (
            <p>Loading collection…</p>
          )}
        </div>

        <div className={styles.curator}>
          <CuratorPanel
            selectedNode={selectedNode}
            isInExhibition={isSelectedNodeInExhibition}
            onAddToExhibition={handleAddToExhibition}
          />

          <ExhibitionPanel
            items={exhibitionItems}
            onRemove={handleRemoveFromExhibition}
          />
        </div>
      </main>
    </div>
  )
}

export default App