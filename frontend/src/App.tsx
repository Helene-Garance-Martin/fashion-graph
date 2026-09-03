import { useEffect, useMemo, useState } from "react";

import Header from "./components/Header";
import GraphCanvas from "./components/GraphCanvas";
import CuratorPanel from "./components/CuratorPanel";
import ExhibitionPanel from "./components/ExhibitionPanel";
import ShowEditor from "./components/ShowEditor";

import { getHouse, getHouses, getSource } from "./api/graphApi";

import { toGraphData } from "./adapters/graphAdapter";

import type { ApiHouse, SearchOption } from "./types/api";

import type { GraphData, GraphNode } from "./types/graph";

import type { Show } from "./types/show";

import { saveShow } from "./store/showStore";

import styles from "./App.module.css";

const SOURCE_OPTIONS: SearchOption[] = [
  {
    id: "sourceworld:Ancient Greek sculpture",
    label: "Ancient Greek sculpture",
    kind: "SOURCE",
    apiName: "Ancient Greek sculpture",
  },
  {
    id: "sourceworld:Japanese kimono",
    label: "Japanese kimono",
    kind: "SOURCE",
    apiName: "Japanese kimono",
  },
  {
    id: "sourceworld:Spanish painting",
    label: "Spanish paintings",
    kind: "SOURCE",
    apiName: "Spanish painting",
  },
];

const INITIAL_SELECTION: SearchOption = {
  id: "designer:Vionnet",
  label: "Vionnet",
  kind: "HOUSE",
  apiName: "Vionnet",
};

const GARMENT_BATCH_SIZE = 10;
const ARTWORK_BATCH_SIZE = 6;

function App() {
  const [houses, setHouses] = useState<ApiHouse[]>([]);

  const [currentSelection, setCurrentSelection] =
    useState<SearchOption>(INITIAL_SELECTION);

  const [searchValue, setSearchValue] = useState(INITIAL_SELECTION.label);

  const [graphData, setGraphData] = useState<GraphData | null>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const [exhibitionItems, setExhibitionItems] = useState<GraphNode[]>([]);

  const [garmentLimit, setGarmentLimit] = useState(0);

  const [artworkLimits, setArtworkLimits] = useState<Record<string, number>>(
    {},
  );

  const [graphError, setGraphError] = useState(false);

  const [isCuratorOpen, setIsCuratorOpen] = useState(true);

  const [activeShow, setActiveShow] = useState<Show | null>(null);

  const houseOptions: SearchOption[] = houses.map((house) => ({
    id: house.id,
    label: house.label,
    kind: "HOUSE",
    apiName: house.label,
  }));

  const searchOptions = [...houseOptions, ...SOURCE_OPTIONS];

  useEffect(() => {
    getHouses()
      .then(setHouses)
      .catch(() => {
        setGraphError(true);
      });
  }, []);

  useEffect(() => {
    setGraphData(null);
    setSelectedNode(null);
    setGarmentLimit(0);
    setArtworkLimits({});
    setGraphError(false);

    const request =
      currentSelection.kind === "HOUSE"
        ? getHouse(currentSelection.apiName)
        : getSource(currentSelection.apiName);

    request
      .then((response) => {
        setGraphData(toGraphData(response));
      })
      .catch(() => {
        setGraphError(true);
      });
  }, [currentSelection]);

  const visibleGraph = useMemo(() => {
    if (!graphData) {
      return null;
    }

    const structuralNodes = graphData.nodes.filter(
      (node) => node.kind === "DESIGNER" || node.kind === "SOURCE",
    );

    const garments = graphData.nodes
      .filter((node) => node.kind === "GARMENT")
      .slice(0, garmentLimit);

    const visibleArtworkIds = new Set<string>();

    Object.entries(artworkLimits).forEach(([sourceId, limit]) => {
      const artworkIds = graphData.relationships
        .filter(
          (relationship) =>
            relationship.type === "EXAMPLE_OF" &&
            relationship.target === sourceId,
        )
        .map((relationship) => relationship.source)
        .slice(0, limit);

      artworkIds.forEach((id) => {
        visibleArtworkIds.add(id);
      });
    });

    const artworks = graphData.nodes.filter(
      (node) => node.kind === "ARTWORK" && visibleArtworkIds.has(node.id),
    );

    const nodes = [...structuralNodes, ...garments, ...artworks];

    const visibleIds = new Set(nodes.map((node) => node.id));

    const relationships = graphData.relationships.filter(
      (relationship) =>
        visibleIds.has(relationship.source) &&
        visibleIds.has(relationship.target),
    );

    return {
      nodes,
      relationships,
    };
  }, [graphData, garmentLimit, artworkLimits]);

  const handleSearchSubmit = () => {
    const wanted = searchValue.trim().toLowerCase();

    const match = searchOptions.find(
      (option) => option.label.toLowerCase() === wanted,
    );

    if (!match) {
      return;
    }

    setSearchValue(match.label);

    setCurrentSelection(match);
  };

  const handleNodeSelect = (node: GraphNode) => {
    setSelectedNode(node);

    if (!graphData) {
      return;
    }

    if (node.kind === "DESIGNER") {
      const totalGarments = graphData.nodes.filter(
        (candidate) => candidate.kind === "GARMENT",
      ).length;

      setGarmentLimit((currentLimit) =>
        Math.min(currentLimit + GARMENT_BATCH_SIZE, totalGarments),
      );
    }

    if (node.kind === "SOURCE") {
      const totalArtworks = graphData.relationships.filter(
        (relationship) =>
          relationship.type === "EXAMPLE_OF" && relationship.target === node.id,
      ).length;

      setArtworkLimits((currentLimits) => ({
        ...currentLimits,

        [node.id]: Math.min(
          (currentLimits[node.id] ?? 0) + ARTWORK_BATCH_SIZE,
          totalArtworks,
        ),
      }));
    }
  };

  const handleAddToExhibition = (node: GraphNode) => {
    setExhibitionItems((currentItems) => {
      const alreadyExists = currentItems.some((item) => item.id === node.id);

      if (alreadyExists) {
        return currentItems;
      }

      return [...currentItems, node];
    });
  };

  const handleRemoveFromExhibition = (nodeId: string) => {
    setExhibitionItems((currentItems) =>
      currentItems.filter((item) => item.id !== nodeId),
    );
  };

  const handleCreateShow = () => {
    if (exhibitionItems.length === 0) {
      return;
    }

    const now = new Date().toISOString();

    const show: Show = {
      id: crypto.randomUUID(),

      title: "",

      dias: exhibitionItems.map((node, index) => ({
        id: crypto.randomUUID(),

        node,

        order: index,
      })),

      createdAt: now,

      updatedAt: now,
    };

    setActiveShow(show);
  };

  const handleShowTitleChange = (title: string) => {
    setActiveShow((currentShow) => {
      if (!currentShow) {
        return null;
      }

      return {
        ...currentShow,

        title,

        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleSaveShow = () => {
    if (!activeShow) {
      return;
    }

    const savedShow = saveShow(activeShow);

    setActiveShow(savedShow);
  };

  const handleBackToExplore = () => {
    setActiveShow(null);
  };

  const isSelectedNodeInExhibition =
    selectedNode !== null &&
    exhibitionItems.some((item) => item.id === selectedNode.id);

  if (activeShow) {
    return (
      <ShowEditor
        show={activeShow}
        onBack={handleBackToExplore}
        onTitleChange={handleShowTitleChange}
        onSave={handleSaveShow}
      />
    );
  }

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
          ) : visibleGraph ? (
            <GraphCanvas
              graph={visibleGraph}
              selectedNode={selectedNode}
              onNodeSelect={handleNodeSelect}
            />
          ) : (
            <p>Loading {currentSelection.label}…</p>
          )}
        </div>

        <aside
          className={`${styles.curator} ${
            !isCuratorOpen ? styles.curatorCollapsed : ""
          }`}
        >
          <button
            type="button"
            className={styles.curatorToggle}
            onClick={() => {
              setIsCuratorOpen((current) => !current);
            }}
            aria-label={isCuratorOpen ? "Close curator" : "Open curator"}
            aria-expanded={isCuratorOpen}
            title={isCuratorOpen ? "Close curator" : "Open curator"}
          >
            {isCuratorOpen ? "›" : "‹"}
          </button>

          <div
            className={`${styles.curatorContent} ${
              !isCuratorOpen ? styles.curatorContentHidden : ""
            }`}
          >
            <CuratorPanel
              selectedNode={selectedNode}
              isInExhibition={isSelectedNodeInExhibition}
              onAddToExhibition={handleAddToExhibition}
            />

            <ExhibitionPanel
              items={exhibitionItems}
              onRemove={handleRemoveFromExhibition}
              onCreateShow={handleCreateShow}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
