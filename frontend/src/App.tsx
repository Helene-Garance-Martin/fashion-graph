import Header from './components/Header'
import GraphCanvas from './components/GraphCanvas'
import CuratorPanel from './components/CuratorPanel'

function App() {
  return (
    <>
      <Header />

      <main>
        <GraphCanvas />
        <CuratorPanel />
      </main>
    </>
  )
}

export default App