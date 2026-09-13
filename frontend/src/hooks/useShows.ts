import { useCallback, useEffect, useRef, useState } from "react";

import {
  createShow as createShowApi,
  deleteShow as deleteShowApi,
  getShows as getShowsApi,
  updateShow as updateShowApi,
} from "../api/showApi";

import {
  deleteShow as deleteShowLocal,
  getShow as getShowLocal,
  getShows as getShowsLocal,
  saveShow as saveShowLocal,
} from "../store/showStore";

import type { Show } from "../types/show";

function sortShows(shows: Show[]) {
  return [...shows].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while talking to the API.";
}

export function useShows() {
  const [shows, setShows] = useState<Show[]>(() => sortShows(getShowsLocal()));

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const serverShowIds = useRef(new Set<string>());

  const refreshShows = useCallback(async (): Promise<Show[]> => {
    setLoading(true);
    setError(null);

    try {
      const remoteShows = sortShows(await getShowsApi());

      const remoteIds = new Set(remoteShows.map((show) => show.id));

      serverShowIds.current = remoteIds;

      const localShows = getShowsLocal();

      const localOnlyShows = localShows.filter(
        (show) => !remoteIds.has(show.id),
      );

      const mergedShows = sortShows([...remoteShows, ...localOnlyShows]);

      for (const show of remoteShows) {
        saveShowLocal(show);
      }

      setShows(mergedShows);

      return mergedShows;
    } catch (caughtError) {
      const message = getErrorMessage(caughtError);

      setError(message);

      const cachedShows = sortShows(getShowsLocal());

      setShows(cachedShows);

      return cachedShows;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshShows();
  }, [refreshShows]);

  const save = useCallback(async (show: Show): Promise<Show> => {
    setError(null);

    try {
      const existsOnServer = serverShowIds.current.has(show.id);

      const savedShow = existsOnServer
        ? await updateShowApi(show)
        : await createShowApi(show);

      serverShowIds.current.add(savedShow.id);

      saveShowLocal(savedShow);

      setShows((currentShows) =>
        sortShows([
          savedShow,
          ...currentShows.filter(
            (currentShow) => currentShow.id !== savedShow.id,
          ),
        ]),
      );

      return savedShow;
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));

      throw caughtError;
    }
  }, []);

  const remove = useCallback(async (showId: string): Promise<Show[]> => {
    setError(null);

    try {
      if (serverShowIds.current.has(showId)) {
        await deleteShowApi(showId);

        serverShowIds.current.delete(showId);
      }

      deleteShowLocal(showId);

      const remainingShows = sortShows(
        getShowsLocal().filter((show) => show.id !== showId),
      );

      setShows(remainingShows);

      return remainingShows;
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));

      throw caughtError;
    }
  }, []);

  const find = useCallback(
    (showId: string) =>
      shows.find((show) => show.id === showId) ?? getShowLocal(showId),
    [shows],
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    shows,
    loading,
    error,
    save,
    remove,
    find,
    refreshShows,
    clearError,
  };
}
