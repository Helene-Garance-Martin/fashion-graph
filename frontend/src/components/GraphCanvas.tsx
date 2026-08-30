import { mockGraph } from '../data/mockGraph'

function GraphCanvas() {
  const getNodeLabel = (id: string) => {
    const node = mockGraph.nodes.find((node) => node.id === id)

    return node?.label ?? id
  }

  return (
    <section>
      <h2>Graph</h2>

      <h3>Nodes</h3>

      <ul>
        {mockGraph.nodes.map((node) => (
          <li key={node.id}>
            {node.label} ({node.kind})
          </li>
        ))}
      </ul>

      <h3>Relationships</h3>

      <ul>
        {mockGraph.relationships.map((relationship) => (
          <li key={`${relationship.source}-${relationship.target}`}>
            {getNodeLabel(relationship.source)}
            {' → '}
            {relationship.type}
            {' → '}
            {getNodeLabel(relationship.target)}
            {' '}
            [{relationship.provenance}]
          </li>
        ))}
      </ul>
    </section>
  )
}

export default GraphCanvas