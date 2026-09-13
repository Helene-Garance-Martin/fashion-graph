import type { ApiGraphResponse, ApiHouse } from "../types/api";

import { API_URL } from "./config";

export type HealthResponse = {
  ok: boolean;
  neo4j_configured: boolean;
  neo4j_connected: boolean;
  static_data_available: boolean;
};

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getHouses(): Promise<ApiHouse[]> {
  const response = await fetch(`${API_URL}/houses`);

  if (!response.ok) {
    throw new Error(`Houses request failed: ${response.status}`);
  }

  return response.json();
}

export async function getHouse(name: string): Promise<ApiGraphResponse> {
  const response = await fetch(`${API_URL}/house/${encodeURIComponent(name)}`);

  if (!response.ok) {
    throw new Error(`House request failed: ${response.status}`);
  }

  return response.json();
}

export async function getSource(name: string): Promise<ApiGraphResponse> {
  const response = await fetch(`${API_URL}/source/${encodeURIComponent(name)}`);

  if (!response.ok) {
    throw new Error(`Source request failed: ${response.status}`);
  }

  return response.json();
}
