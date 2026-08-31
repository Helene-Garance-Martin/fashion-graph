import { useState } from 'react'
import Header from './components/Header'
import GraphCanvas from './components/GraphCanvas'
import CuratorPanel from './components/CuratorPanel'
import type { GraphNode } from './types/graph'
import styles from './App.module.css'

function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

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
          <CuratorPanel selectedNode={selectedNode} />
        </div>
      </main>
    </div>
  )
}

export default App