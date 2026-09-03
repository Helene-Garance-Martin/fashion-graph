import type { Show } from "../types/show";

const STORAGE_KEY = "twinning-the-codex-shows";

export function getShows(): Show[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Show[];
  } catch {
    return [];
  }
}

export function getShow(showId: string): Show | null {
  return getShows().find((show) => show.id === showId) ?? null;
}

export function saveShow(show: Show): Show {
  const shows = getShows();

  const updatedShow: Show = {
    ...show,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = shows.findIndex(
    (candidate) => candidate.id === show.id,
  );

  if (existingIndex === -1) {
    shows.push(updatedShow);
  } else {
    shows[existingIndex] = updatedShow;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(shows));

  return updatedShow;
}

export function deleteShow(showId: string) {
  const remaining = getShows().filter((show) => show.id !== showId);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
}
