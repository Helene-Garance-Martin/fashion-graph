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
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { shows, loading, error, save, remove, find } = useShows();

  const routeState = location.state as RouteState | null;

  const draftShow = routeState?.draftShow;

  const [show, setShow] = useState<Show | null>(() => {
    if (draftShow && draftShow.id === showId) {
      return draftShow;
    }

    if (!showId) return null;

    return find(showId);
  });

  useEffect(() => {
    if (!showId) return;
    if (show?.id === showId) return;

    if (draftShow && draftShow.id === showId) {
      setShow(draftShow);
      return;
    }

    const storedShow = find(showId);

    if (storedShow) {
      setShow(storedShow);
    }
  }, [showId, show?.id, draftShow, find]);

  const handleBack = () => {
    navigate("/");
  };

  const handleTitleChange = (title: string) => {
    setShow((currentShow) => {
      if (!currentShow) return null;

      return {
        ...currentShow,
        title,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const handleSave = async () => {
    if (!show) return;

    try {
      const savedShow = await save(show);

      setShow(savedShow);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unknown API error.";

      window.alert(
        `Couldn't save this Show.\n\n${message}\n\nYour changes are still here.`,
      );
    }
  };

  const handleEditShow = (selectedShow: Show) => {
    setShow(selectedShow);

    navigate(`/shows/${selectedShow.id}/edit`);
  };

  const handleDeleteShow = async (showToDelete: Show) => {
    const displayTitle = showToDelete.title.trim() || "Untitled Show";

    const confirmed = window.confirm(
      `Delete "${displayTitle}"?\n\nThis will remove the show and its ${showToDelete.dias.length} dias.`,
    );

    if (!confirmed) return;

    try {
      const remainingShows = await remove(showToDelete.id);

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
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unknown API error.";

      window.alert(`Couldn't delete this Show.\n\n${message}`);
    }
  };

  const handleReorderDias = (activeDiaId: string, overDiaId: string) => {
    setShow((currentShow) => {
      if (!currentShow) return null;

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
    if (loading) {
      return <p>Loading Show…</p>;
    }

    const storedShow = find(showId);

    if (storedShow) {
      return <p>Loading Show…</p>;
    }

    if (error) {
      return <p>Couldn&apos;t load this Show. {error}</p>;
    }

    return <Navigate to="/shows" replace />;
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
