import type { Show } from "../types/show";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

const USE_LOCAL_STORAGE = import.meta.env.PROD;

const STORAGE_KEY = "twinning-the-codex-shows";

type ApiErrorBody = {
  detail?: string;
};

function readLocalShows(): Show[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as Show[]) : [];
  } catch {
    return [];
  }
}

function writeLocalShows(shows: Show[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(shows));
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const body = (await response.json()) as ApiErrorBody;

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
  if (USE_LOCAL_STORAGE) {
    return readLocalShows();
  }

  const response = await fetch(`${API_BASE}/shows`);

  return parseResponse<Show[]>(response);
}

export async function getShow(showId: string): Promise<Show> {
  if (USE_LOCAL_STORAGE) {
    const show = readLocalShows().find((item) => item.id === showId);

    if (!show) {
      throw new Error(`No show named "${showId}"`);
    }

    return show;
  }

  const response = await fetch(`${API_BASE}/shows/${showId}`);

  return parseResponse<Show>(response);
}

export async function createShow(show: Show): Promise<Show> {
  if (USE_LOCAL_STORAGE) {
    const shows = readLocalShows();

    if (shows.some((item) => item.id === show.id)) {
      throw new Error(`Show "${show.id}" already exists`);
    }

    writeLocalShows([...shows, show]);

    return show;
  }

  const response = await fetch(`${API_BASE}/shows`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(show),
  });

  return parseResponse<Show>(response);
}

export async function updateShow(show: Show): Promise<Show> {
  if (USE_LOCAL_STORAGE) {
    const shows = readLocalShows();

    const index = shows.findIndex((item) => item.id === show.id);

    if (index === -1) {
      throw new Error(`No show named "${show.id}"`);
    }

    const nextShows = [...shows];

    nextShows[index] = show;

    writeLocalShows(nextShows);

    return show;
  }

  const response = await fetch(`${API_BASE}/shows/${show.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(show),
  });

  return parseResponse<Show>(response);
}

export async function deleteShow(showId: string): Promise<{ deleted: string }> {
  if (USE_LOCAL_STORAGE) {
    const shows = readLocalShows();

    const exists = shows.some((item) => item.id === showId);

    if (!exists) {
      throw new Error(`No show named "${showId}"`);
    }

    writeLocalShows(shows.filter((item) => item.id !== showId));

    return {
      deleted: showId,
    };
  }

  const response = await fetch(`${API_BASE}/shows/${showId}`, {
    method: "DELETE",
  });

  return parseResponse<{ deleted: string }>(response);
}
