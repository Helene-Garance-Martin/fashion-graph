import Header from './components/Header'
import GraphCanvas from './components/GraphCanvas'
import CuratorPanel from './components/CuratorPanel'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className={styles.graph}>
          <GraphCanvas />
        </div>

        <div className={styles.curator}>
          <CuratorPanel />
        </div>
      </main>
    </div>
  )
}

export default App