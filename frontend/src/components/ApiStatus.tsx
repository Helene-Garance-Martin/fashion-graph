import { useEffect, useState } from 'react'
import { getHealth } from '../api/graphApi'
import type { HealthResponse } from '../api/graphApi'

function ApiStatus() {
  const [health, setHealth] =
    useState<HealthResponse | null>(null)

  const [error, setError] = useState(false)

  useEffect(() => {
    getHealth()
      .then((data) => {
        setHealth(data)
      })
      .catch(() => {
        setError(true)
      })
  }, [])

  if (error) {
    return <p>API offline</p>
  }

  if (!health) {
    return <p>Checking API…</p>
  }

  if (health.neo4j_connected) {
    return <p>API online · Neo4j connected</p>
  }

  if (health.static_data_available) {
    return <p>API online · static collection snapshot</p>
  }

  return <p>API online · collection unavailable</p>
}

export default ApiStatus