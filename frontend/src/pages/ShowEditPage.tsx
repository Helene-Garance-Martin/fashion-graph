import { useEffect, useState } from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import ShowEditor from "../components/ShowEditor";

import { useShows } from "../hooks/useShows";

import type { Show } from "../types/show";

type RouteState = {
  draftShow?: Show;
};

function ShowEditPage() {
  const { showId } = useParams<{
    showId: string;
  }>();

  const navigate = useNavigate();
  const location = useLocation();

  const { shows, save, remove, find } = useShows();

  const routeState = location.state as RouteState | null;

  const draftShow = routeState?.draftShow;

  const [show, setShow] = useState<Show | null>(() => {
    if (draftShow && draftShow.id === showId) {
      return draftShow;
    }

    if (!showId) {
      return null;
    }

    return find(showId);
  });

  useEffect(() => {
    if (!showId) {
      return;
    }

    if (show?.id === showId) {
      return;
    }

    if (draftShow && draftShow.id === showId) {
      setShow(draftShow);
      return;
    }

    setShow(find(showId));
  }, [showId, show?.id, draftShow, find]);

  const handleBack = () => {
    navigate("/");
  };

  const handleTitleChange = (title: string) => {
    setShow((currentShow) => {
      if (!currentShow) {
        return null;
      }

      return {
        ...currentShow,
        title,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleSave = () => {
    if (!show) {
      return;
    }

    const savedShow = save(show);

    setShow(savedShow);
  };

  const handleEditShow = (selectedShow: Show) => {
    setShow(selectedShow);

    navigate(`/shows/${selectedShow.id}/edit`);
  };

  const handleDeleteShow = (showToDelete: Show) => {
    const displayTitle = showToDelete.title.trim() || "Untitled Show";

    const confirmed = window.confirm(
      `Delete "${displayTitle}"?\n\nThis will remove the show and its ${showToDelete.dias.length} dias.`,
    );

    if (!confirmed) {
      return;
    }

    const remainingShows = remove(showToDelete.id);

    if (showToDelete.id !== show?.id) {
      return;
    }

    const nextShow = remainingShows[0];

    if (nextShow) {
      setShow(nextShow);

      navigate(`/shows/${nextShow.id}/edit`);

      return;
    }

    setShow(null);
    navigate("/shows");
  };

  const handleReorderDias = (activeDiaId: string, overDiaId: string) => {
    setShow((currentShow) => {
      if (!currentShow) {
        return null;
      }

      const oldIndex = currentShow.dias.findIndex(
        (dia) => dia.id === activeDiaId,
      );

      const newIndex = currentShow.dias.findIndex(
        (dia) => dia.id === overDiaId,
      );

      if (oldIndex === -1 || newIndex === -1) {
        return currentShow;
      }

      const reordered = [...currentShow.dias];

      const [movedDia] = reordered.splice(oldIndex, 1);

      reordered.splice(newIndex, 0, movedDia);

      const dias = reordered.map((dia, index) => ({
        ...dia,
        order: index,
      }));

      return {
        ...currentShow,
        dias,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  if (!showId) {
    return <Navigate to="/shows" replace />;
  }

  if (!show || show.id !== showId) {
    const storedShow = find(showId);

    const routeDraft = draftShow?.id === showId ? draftShow : null;

    if (!storedShow && !routeDraft) {
      return <Navigate to="/shows" replace />;
    }

    return <p>Loading show…</p>;
  }

  return (
    <ShowEditor
      show={show}
      savedShows={shows}
      onBack={handleBack}
      onTitleChange={handleTitleChange}
      onSave={handleSave}
      onEditShow={handleEditShow}
      onDeleteShow={handleDeleteShow}
      onReorderDias={handleReorderDias}
    />
  );
}

export default ShowEditPage;
