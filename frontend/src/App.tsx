import { Routes, Route, useNavigate } from "react-router-dom";

import ShowsPage from "./pages/ShowsPage";
import ExplorePage from "./pages/ExplorePage";
import ShowEditPage from "./pages/ShowEditPage";

import { useEffect, useMemo, useState } from "react";

import {
  getConcept,
  getConcepts,
  getHouse,
  getHouses,
  getSource,
} from "./api/graphApi";

import { toGraphData } from "./adapters/graphAdapter";

import type {
  ApiConcept,
  ApiGraphResponse,
  ApiHouse,
  SearchOption,
} from "./types/api";

import type { GraphData, GraphNode } from "./types/graph";

import type { Show } from "./types/show";

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
  const navigate = useNavigate();

  const [houses, setHouses] = useState<ApiHouse[]>([]);
  const [concepts, setConcepts] = useState<ApiConcept[]>([]);

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

  const houseOptions: SearchOption[] = houses.map((house) => ({
    id: house.id,
    label: house.label,
    kind: "HOUSE",
    apiName: house.label,
  }));

  const conceptOptions: SearchOption[] = concepts.map((concept) => ({
    id: concept.id,
    label: concept.label,
    kind: "CONCEPT",
    apiName: concept.label,
  }));

  const searchOptions = [...houseOptions, ...SOURCE_OPTIONS, ...conceptOptions];

  useEffect(() => {
    Promise.all([getHouses(), getConcepts()])
      .then(([houseData, conceptData]) => {
        setHouses(houseData);
        setConcepts(conceptData);
      })
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

    let request: Promise<ApiGraphResponse>;

    switch (currentSelection.kind) {
      case "HOUSE":
        request = getHouse(currentSelection.apiName);
        break;

      case "SOURCE":
        request = getSource(currentSelection.apiName);
        break;

      case "CONCEPT":
        request = getConcept(currentSelection.apiName);
        break;
    }
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
    if (currentSelection.kind === "CONCEPT") {
      return graphData;
    }
    const structuralNodes = graphData.nodes.filter(
      (node) => node.kind === "DESIGNER" || node.kind === "SOURCE",
    );

    const conceptLinkedGarmentIds = new Set(
      graphData.relationships
        .filter((relationship) => relationship.type === "HAS_CONCEPT")
        .map((relationship) => relationship.source),
    );

    const allGarments = graphData.nodes.filter(
      (node) => node.kind === "GARMENT",
    );

    const orderedGarments = [
      ...allGarments.filter((garment) =>
        conceptLinkedGarmentIds.has(garment.id),
      ),
      ...allGarments.filter(
        (garment) => !conceptLinkedGarmentIds.has(garment.id),
      ),
    ];

    const garments = orderedGarments.slice(0, garmentLimit);

    const visibleGarmentIds = new Set(garments.map((garment) => garment.id));

    const visibleConceptIds = new Set(
      graphData.relationships
        .filter(
          (relationship) =>
            relationship.type === "HAS_CONCEPT" &&
            visibleGarmentIds.has(relationship.source),
        )
        .map((relationship) => relationship.target),
    );

    const concepts = graphData.nodes.filter(
      (node) => node.kind === "CONCEPT" && visibleConceptIds.has(node.id),
    );

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

    const nodes = [...structuralNodes, ...garments, ...concepts, ...artworks];
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

    navigate(`/shows/${show.id}/edit`, {
      state: {
        draftShow: show,
      },
    });
  };

  const isSelectedNodeInExhibition =
    selectedNode !== null &&
    exhibitionItems.some((item) => item.id === selectedNode.id);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ExplorePage
            searchValue={searchValue}
            searchOptions={searchOptions}
            graphError={graphError}
            graph={visibleGraph}
            selectedNode={selectedNode}
            currentSelectionLabel={currentSelection.label}
            exhibitionItems={exhibitionItems}
            isSelectedNodeInExhibition={isSelectedNodeInExhibition}
            onSearchChange={setSearchValue}
            onSearchSubmit={handleSearchSubmit}
            onNodeSelect={handleNodeSelect}
            onAddToExhibition={handleAddToExhibition}
            onRemoveFromExhibition={handleRemoveFromExhibition}
            onCreateShow={handleCreateShow}
          />
        }
      />

      <Route path="/shows" element={<ShowsPage />} />

      <Route path="/shows/:showId/edit" element={<ShowEditPage />} />
    </Routes>
  );
}

export default App;
