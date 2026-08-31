import { useEffect, useState } from 'react'
import Header from './components/Header'
import GraphCanvas from './components/GraphCanvas'
import CuratorPanel from './components/CuratorPanel'
import ExhibitionPanel from './components/ExhibitionPanel'
import {
  getHouse,
  getHouses,
  getSource,
} from './api/graphApi'
import { toInfluenceGraph } from './adapters/graphAdapter'
import type {
  ApiHouse,
  SearchOption,
} from './types/api'
import type {
  GraphData,
  GraphNode,
} from './types/graph'
import styles from './App.module.css'

const SOURCE_OPTIONS: SearchOption[] = [
  {
    id: 'sourceworld:Ancient Greek sculpture',
    label: 'Ancient Greek sculpture',
    kind: 'SOURCE',
    apiName: 'Ancient Greek sculpture',
  },
  {
    id: 'sourceworld:Japanese kimono',
    label: 'Japanese kimono',
    kind: 'SOURCE',
    apiName: 'Japanese kimono',
  },
  {
    id: 'sourceworld:Spanish painting',
    label: 'Spanish paintings',
    kind: 'SOURCE',
    apiName: 'Spanish painting',
  },
]

const INITIAL_SELECTION: SearchOption = {
  id: 'designer:Vionnet',
  label: 'Vionnet',
  kind: 'HOUSE',
  apiName: 'Vionnet',
}

function App() {
  const [houses, setHouses] =
    useState<ApiHouse[]>([])

  const [currentSelection, setCurrentSelection] =
    useState<SearchOption>(INITIAL_SELECTION)

  const [searchValue, setSearchValue] =
    useState(INITIAL_SELECTION.label)

  const [graphData, setGraphData] =
    useState<GraphData | null>(null)

  const [selectedNode, setSelectedNode] =
    useState<GraphNode | null>(null)

  const [exhibitionItems, setExhibitionItems] =
    useState<GraphNode[]>([])

  const [graphError, setGraphError] =
    useState(false)

  const houseOptions: SearchOption[] =
    houses.map((house) => ({
      id: house.id,
      label: house.label,
      kind: 'HOUSE',
      apiName: house.label,
    }))

  const searchOptions = [
    ...houseOptions,
    ...SOURCE_OPTIONS,
  ]

  useEffect(() => {
    getHouses()
      .then((data) => {
        setHouses(data)
      })
      .catch(() => {
        setGraphError(true)
      })
  }, [])

  useEffect(() => {
    setGraphData(null)
    setSelectedNode(null)
    setGraphError(false)

    const request =
      currentSelection.kind === 'HOUSE'
        ? getHouse(currentSelection.apiName)
        : getSource(currentSelection.apiName)

    request
      .then((response) => {
        const graph = toInfluenceGraph(response)
        setGraphData(graph)
      })
      .catch(() => {
        setGraphError(true)
      })
  }, [currentSelection])

  const handleSearchSubmit = () => {
    const normalisedSearch =
      searchValue.trim().toLowerCase()

    const match = searchOptions.find(
      (option) =>
        option.label.toLowerCase() ===
        normalisedSearch
    )

    if (!match) {
      return
    }

    setSearchValue(match.label)
    setCurrentSelection(match)
  }

  const handleAddToExhibition = (
    node: GraphNode
  ) => {
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

  const handleRemoveFromExhibition = (
    nodeId: string
  ) => {
    setExhibitionItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== nodeId
      )
    )
  }

  const isSelectedNodeInExhibition =
    selectedNode !== null &&
    exhibitionItems.some(
      (item) => item.id === selectedNode.id
    )

  return (
    <div className={styles.page}>
      <Header
        searchValue={searchValue}
        searchOptions={searchOptions}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
      />

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
            <p>
              Loading {currentSelection.label}…
            </p>
          )}
        </div>

        <div className={styles.curator}>
          <CuratorPanel
            selectedNode={selectedNode}
            isInExhibition={
              isSelectedNodeInExhibition
            }
            onAddToExhibition={
              handleAddToExhibition
            }
          />

          <ExhibitionPanel
            items={exhibitionItems}
            onRemove={
              handleRemoveFromExhibition
            }
          />
        </div>
      </main>
    </div>
  )
}

export default App