import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { mockGraph } from '../data/mockGraph'
import type { GraphNode, GraphRelationship } from '../types/graph'

type SimulationNode = GraphNode & d3.SimulationNodeDatum

type SimulationLink = Omit<GraphRelationship, 'source' | 'target'> &
  d3.SimulationLinkDatum<SimulationNode> & {
    source: string | SimulationNode
    target: string | SimulationNode
  }

type GraphCanvasProps = {
  onNodeSelect: (node: GraphNode) => void
}

function GraphCanvas({ onNodeSelect }: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)

    svg.selectAll('*').remove()

    const nodes: SimulationNode[] = mockGraph.nodes.map((node) => ({
      ...node,
    }))

    const links: SimulationLink[] = mockGraph.relationships.map(
      (relationship) => ({
        ...relationship,
      })
    )

    const link = svg
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#999')

    const node = svg
      .selectAll<SVGCircleElement, SimulationNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => (d.kind === 'DESIGNER' ? 24 : 16))
      .attr('fill', (d) => (d.kind === 'DESIGNER' ? '#222' : '#aaa'))
      .style('cursor', 'grab')
      .on('click', (_event, d) => {
        onNodeSelect(d)
      })

    const label = svg
      .selectAll('text')
      .data(nodes)
      .join('text')
      .text((d) => d.label)
      .attr('text-anchor', 'middle')
      .attr('font-size', 14)
      .attr('pointer-events', 'none')

    const simulation = d3
      .forceSimulation<SimulationNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<SimulationNode, SimulationLink>(links)
          .id((d) => d.id)
          .distance(180)
      )
      .force('charge', d3.forceManyBody().strength(-350))
      .force('center', d3.forceCenter(300, 225))

    const drag = d3
      .drag<SVGCircleElement, SimulationNode>()
      .on('start', (event, d) => {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart()
        }

        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        if (!event.active) {
          simulation.alphaTarget(0)
        }

        d.fx = null
        d.fy = null
      })

    node.call(drag)

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => (d.source as SimulationNode).x ?? 0)
        .attr('y1', (d) => (d.source as SimulationNode).y ?? 0)
        .attr('x2', (d) => (d.target as SimulationNode).x ?? 0)
        .attr('y2', (d) => (d.target as SimulationNode).y ?? 0)

      node
        .attr('cx', (d) => d.x ?? 0)
        .attr('cy', (d) => d.y ?? 0)

      label
        .attr('x', (d) => d.x ?? 0)
        .attr('y', (d) => (d.y ?? 0) + 40)
    })

    return () => {
      simulation.stop()
    }
  }, [onNodeSelect])

  return (
    <section>
      <h2>Graph</h2>

      <svg
        ref={svgRef}
        width="600"
        height="450"
      />
    </section>
  )
}

export default GraphCanvas