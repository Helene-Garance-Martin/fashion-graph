import type { Show } from "../types/show";

const API_BASE =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000";

type ApiErrorBody = {
  detail?: string;
};

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body =
        (await response.json()) as ApiErrorBody;

      if (body.detail) {
        message = body.detail;
      }
    } catch {
      // The server did not return JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export async function getShows(): Promise<Show[]> {
  const response = await fetch(
    `${API_BASE}/shows`,
  );

  return parseResponse<Show[]>(response);
}

export async function getShow(
  showId: string,
): Promise<Show> {
  const response = await fetch(
    `${API_BASE}/shows/${showId}`,
  );

  return parseResponse<Show>(response);
}

export async function createShow(
  show: Show,
): Promise<Show> {
  const response = await fetch(
    `${API_BASE}/shows`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(show),
    },
  );

  return parseResponse<Show>(response);
}

export async function updateShow(
  show: Show,
): Promise<Show> {
  const response = await fetch(
    `${API_BASE}/shows/${show.id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(show),
    },
  );

  return parseResponse<Show>(response);
}

export async function deleteShow(
  showId: string,
): Promise<{ deleted: string }> {
  const response = await fetch(
    `${API_BASE}/shows/${showId}`,
    {
      method: "DELETE",
    },
  );

  return parseResponse<{ deleted: string }>(
    response,
  );
}