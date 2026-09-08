import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";

import ShowEditor from "../components/ShowEditor";

import { getShow } from "../store/showStore";

import type { Show } from "../types/show";

type ShowEditPageProps = {
  activeShow: Show | null;
  savedShows: Show[];

  onSetActiveShow: (show: Show) => void;

  onBack: () => void;

  onTitleChange: (title: string) => void;

  onSave: () => void;

  onEditShow: (show: Show) => void;

  onDeleteShow: (show: Show) => void;

  onReorderDias: (activeDiaId: string, overDiaId: string) => void;
};

function ShowEditPage({
  activeShow,
  savedShows,
  onSetActiveShow,
  onBack,
  onTitleChange,
  onSave,
  onEditShow,
  onDeleteShow,
  onReorderDias,
}: ShowEditPageProps) {
  const { showId } = useParams<{
    showId: string;
  }>();

  useEffect(() => {
    if (!showId) {
      return;
    }

    if (activeShow?.id === showId) {
      return;
    }

    const storedShow = getShow(showId);

    if (storedShow) {
      onSetActiveShow(storedShow);
    }
  }, [showId, activeShow?.id, onSetActiveShow]);

  if (!showId) {
    return <Navigate to="/shows" replace />;
  }

  if (!activeShow || activeShow.id !== showId) {
    const storedShow = getShow(showId);

    if (!storedShow) {
      return <Navigate to="/shows" replace />;
    }

    return <p>Loading show…</p>;
  }

  return (
    <ShowEditor
      show={activeShow}
      savedShows={savedShows}
      onBack={onBack}
      onTitleChange={onTitleChange}
      onSave={onSave}
      onEditShow={onEditShow}
      onDeleteShow={onDeleteShow}
      onReorderDias={onReorderDias}
    />
  );
}

export default ShowEditPage;
