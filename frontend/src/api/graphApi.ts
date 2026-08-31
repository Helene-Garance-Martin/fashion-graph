export type HealthResponse = {
  ok: boolean
  neo4j_configured: boolean
}

const API_URL = 'http://127.0.0.1:8000'

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}