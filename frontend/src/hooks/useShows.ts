import { useCallback, useState } from "react";

import { deleteShow, getShow, getShows, saveShow } from "../store/showStore";

import type { Show } from "../types/show";

function sortShows(shows: Show[]) {
  return [...shows].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function useShows() {
  const [shows, setShows] = useState<Show[]>(() => sortShows(getShows()));

  const refreshShows = useCallback(() => {
    const storedShows = sortShows(getShows());

    setShows(storedShows);

    return storedShows;
  }, []);

  const save = useCallback(
    (show: Show) => {
      const savedShow = saveShow(show);

      refreshShows();

      return savedShow;
    },
    [refreshShows],
  );

  const remove = useCallback(
    (showId: string) => {
      deleteShow(showId);

      return refreshShows();
    },
    [refreshShows],
  );

  const find = useCallback((showId: string) => getShow(showId), []);

  return {
    shows,
    save,
    remove,
    find,
    refreshShows,
  };
}
