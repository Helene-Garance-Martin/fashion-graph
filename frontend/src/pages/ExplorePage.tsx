import { useState } from "react";

import Header from "../components/Header";
import GraphCanvas from "../components/GraphCanvas";
import CuratorPanel from "../components/CuratorPanel";
import ExhibitionPanel from "../components/ExhibitionPanel";

import type { SearchOption } from "../types/api";
import type { GraphData, GraphNode } from "../types/graph";

import styles from "../App.module.css";

type ExplorePageProps = {
  searchValue: string;
  searchOptions: SearchOption[];

  graphError: boolean;
  graph: GraphData | null;

  selectedNode: GraphNode | null;
  currentSelectionLabel: string;

  exhibitionItems: GraphNode[];
  isSelectedNodeInExhibition: boolean;

  onSearchChange: (value: string) => void;

  onSearchSubmit: () => void;

  onNodeSelect: (node: GraphNode) => void;

  onAddToExhibition: (node: GraphNode) => void;

  onRemoveFromExhibition: (nodeId: string) => void;

  onCreateShow: () => void;
};

function ExplorePage({
  searchValue,
  searchOptions,
  graphError,
  graph,
  selectedNode,
  currentSelectionLabel,
  exhibitionItems,
  isSelectedNodeInExhibition,
  onSearchChange,
  onSearchSubmit,
  onNodeSelect,
  onAddToExhibition,
  onRemoveFromExhibition,
  onCreateShow,
}: ExplorePageProps) {
  const [isCuratorOpen, setIsCuratorOpen] = useState(true);

  return (
    <div className={styles.page}>
      <Header
        searchValue={searchValue}
        searchOptions={searchOptions}
        onSearchChange={onSearchChange}
        onSearchSubmit={onSearchSubmit}
      />

      <main className={styles.main}>
        <div className={styles.graph}>
          {graphError ? (
            <p>Unable to load graph.</p>
          ) : graph ? (
            <GraphCanvas
              graph={graph}
              selectedNode={selectedNode}
              onNodeSelect={onNodeSelect}
            />
          ) : (
            <p>Loading {currentSelectionLabel}…</p>
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
            onClick={() => setIsCuratorOpen((current) => !current)}
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
              onAddToExhibition={onAddToExhibition}
            />

            <ExhibitionPanel
              items={exhibitionItems}
              onRemove={onRemoveFromExhibition}
              onCreateShow={onCreateShow}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}

export default ExplorePage;
