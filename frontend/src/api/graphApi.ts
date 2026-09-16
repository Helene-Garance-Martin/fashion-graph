import type { ApiConcept, ApiGraphResponse, ApiHouse } from "../types/api";

import { API_URL } from "./config";

export type HealthResponse = {
  ok: boolean;
  neo4j_configured: boolean;
  neo4j_connected: boolean;
  static_data_available: boolean;
};

type StaticData = {
  houses: ApiHouse[];
  house: Record<string, ApiGraphResponse>;
  source: Record<string, ApiGraphResponse>;
  concepts: ApiConcept[];
  concept: Record<string, ApiGraphResponse>;
};

const USE_STATIC_DATA = import.meta.env.PROD;

const STATIC_DATA_URL = `${import.meta.env.BASE_URL}data.json`;

let staticDataPromise: Promise<StaticData> | null = null;

async function getStaticData(): Promise<StaticData> {
  if (!staticDataPromise) {
    staticDataPromise = fetch(STATIC_DATA_URL).then(async (response) => {
      if (!response.ok) {
        throw new Error(`Static data request failed: ${response.status}`);
      }

      return response.json() as Promise<StaticData>;
    });
  }

  return staticDataPromise;
}

export async function getHealth(): Promise<HealthResponse> {
  if (USE_STATIC_DATA) {
    return {
      ok: true,
      neo4j_configured: false,
      neo4j_connected: false,
      static_data_available: true,
    };
  }

  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getHouses(): Promise<ApiHouse[]> {
  if (USE_STATIC_DATA) {
    const data = await getStaticData();

    return data.houses;
  }

  const response = await fetch(`${API_URL}/houses`);

  if (!response.ok) {
    throw new Error(`Houses request failed: ${response.status}`);
  }

  return response.json();
}

export async function getHouse(name: string): Promise<ApiGraphResponse> {
  if (USE_STATIC_DATA) {
    const data = await getStaticData();
    const graph = data.house[name];

    if (!graph) {
      throw new Error(`No house named "${name}"`);
    }

    return graph;
  }

  const response = await fetch(`${API_URL}/house/${encodeURIComponent(name)}`);

  if (!response.ok) {
    throw new Error(`House request failed: ${response.status}`);
  }

  return response.json();
}

export async function getSource(name: string): Promise<ApiGraphResponse> {
  if (USE_STATIC_DATA) {
    const data = await getStaticData();
    const graph = data.source[name];

    if (!graph) {
      throw new Error(`No source named "${name}"`);
    }

    return graph;
  }

  const response = await fetch(`${API_URL}/source/${encodeURIComponent(name)}`);

  if (!response.ok) {
    throw new Error(`Source request failed: ${response.status}`);
  }

  return response.json();
}

export async function getConcepts(): Promise<ApiConcept[]> {
  if (USE_STATIC_DATA) {
    const data = await getStaticData();

    return data.concepts;
  }

  const response = await fetch(`${API_URL}/concepts`);

  if (!response.ok) {
    throw new Error(`Concepts request failed: ${response.status}`);
  }

  return response.json();
}

export async function getConcept(name: string): Promise<ApiGraphResponse> {
  if (USE_STATIC_DATA) {
    const data = await getStaticData();
    const graph = data.concept[name];

    if (!graph) {
      throw new Error(`No concept named "${name}"`);
    }

    return graph;
  }

  const response = await fetch(
    `${API_URL}/concept/${encodeURIComponent(name)}`,
  );

  if (!response.ok) {
    throw new Error(`Concept request failed: ${response.status}`);
  }

  return response.json();
}
