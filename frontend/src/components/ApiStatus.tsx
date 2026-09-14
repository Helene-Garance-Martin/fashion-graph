import { useEffect, useState } from "react";

import { getHealth } from "../api/graphApi";

import type { HealthResponse } from "../api/graphApi";

function ApiStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  const [error, setError] = useState(false);

  useEffect(() => {
    let isActive = true;

    const checkHealth = async () => {
      try {
        const data = await getHealth();

        if (!isActive) return;

        setHealth(data);
        setError(false);
      } catch {
        if (!isActive) return;

        setError(true);
      }
    };

    void checkHealth();

    const intervalId = window.setInterval(checkHealth, 10_000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, []);

  if (error) {
    return <p>API offline</p>;
  }

  if (!health) {
    return <p>Checking API…</p>;
  }

  if (health.neo4j_connected) {
    return <p>API online · Neo4j connected</p>;
  }

  if (health.static_data_available) {
    return <p>Static collection snapshot</p>;
  }

  return <p>API online · collection unavailable</p>;
}

export default ApiStatus;
