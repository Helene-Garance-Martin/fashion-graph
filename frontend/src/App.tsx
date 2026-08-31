import { useState } from 'react'
import Header from './components/Header'
import GraphCanvas from './components/GraphCanvas'
import CuratorPanel from './components/CuratorPanel'
import ExhibitionPanel from './components/ExhibitionPanel'
import type { GraphNode } from './types/graph'
import styles from './App.module.css'

function App() {
  const [selectedNode, setSelectedNode] =
    useState<GraphNode | null>(null)

  const [exhibitionItems, setExhibitionItems] =
    useState<GraphNode[]>([])

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

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.graph}>
          <GraphCanvas
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
          />
        </div>

        <div className={styles.curator}>
          <CuratorPanel
            selectedNode={selectedNode}
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