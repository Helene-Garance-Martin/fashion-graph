import { Navigate, useNavigate, useParams } from "react-router-dom";

import ShowPresentation from "../components/ShowPresentation";
import { useShows } from "../hooks/useShows";

function ShowPresentPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();

  const { loading, error, find } = useShows();

  if (!showId) {
    return <Navigate to="/shows" replace />;
  }

  const show = find(showId);

  if (!show) {
    if (loading) {
      return <p>Loading Show…</p>;
    }

    if (error) {
      return <p>Couldn&apos;t load this Show. {error}</p>;
    }

    return <Navigate to="/shows" replace />;
  }

  return (
    <ShowPresentation
      show={show}
      onExit={() => navigate(`/shows/${show.id}/edit`)}
    />
  );
}

export default ShowPresentPage;
