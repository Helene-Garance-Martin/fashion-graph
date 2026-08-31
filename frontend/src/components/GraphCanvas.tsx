import {
  useEffect,
  useRef,
  useState,
} from 'react'

import * as d3 from 'd3'

import type {
  GraphData,
  GraphNode,
  GraphRelationship,
} from '../types/graph'

import styles from './GraphCanvas.module.css'

type SimulationNode =
  GraphNode &
  d3.SimulationNodeDatum

type SimulationLink =
  Omit<
    GraphRelationship,
    'source' | 'target'
  > &
  d3.SimulationLinkDatum<SimulationNode> & {
    source: string | SimulationNode
    target: string | SimulationNode
  }

type HoveredNode = {
  node: GraphNode
  x: number
  y: number
}

type GraphCanvasProps = {
  graph: GraphData
  selectedNode: GraphNode | null
  onNodeSelect: (
    node: GraphNode
  ) => void
}

function baseRadius(
  node: GraphNode
) {
  switch (node.kind) {
    case 'DESIGNER':
      return 24

    case 'SOURCE':
      return 16

    case 'GARMENT':
      return 7

    case 'ARTWORK':
      return 9
  }
}

function GraphCanvas({
  graph,
  selectedNode,
  onNodeSelect,
}: GraphCanvasProps) {
  const svgRef =
    useRef<SVGSVGElement | null>(null)

  const [hoveredNode, setHoveredNode] =
    useState<HoveredNode | null>(null)

  useEffect(() => {
    if (!svgRef.current) {
      return
    }

    const svg =
      d3.select(svgRef.current)

    svg.selectAll('*').remove()

    const nodes: SimulationNode[] =
      graph.nodes.map(
        (node) => ({
          ...node,
        })
      )

    const links: SimulationLink[] =
      graph.relationships.map(
        (relationship) => ({
          ...relationship,
        })
      )

    const primaryDesignerColor =
      nodes.find(
        (node) =>
          node.kind === 'DESIGNER'
      )?.color ?? '#222'

    const link = svg
      .selectAll<
        SVGLineElement,
        SimulationLink
      >('line')
      .data(links)
      .join('line')
      .attr(
        'stroke',
        (relationship) => {
          if (
            relationship.type ===
            'CREATED'
          ) {
            return '#d8d8d8'
          }

          if (
            relationship.type ===
            'EXAMPLE_OF'
          ) {
            return '#c9c1b4'
          }

          return '#999'
        }
      )

    const node = svg
      .selectAll<
        SVGCircleElement,
        SimulationNode
      >('circle')
      .data(nodes)
      .join('circle')
      .attr(
        'r',
        (d) => baseRadius(d)
      )
      .attr(
        'fill',
        (d) => {
          if (
            d.kind === 'DESIGNER'
          ) {
            return d.color ?? '#222'
          }

          if (
            d.kind === 'GARMENT'
          ) {
            return primaryDesignerColor
          }

          if (
            d.kind === 'SOURCE'
          ) {
            return d.color ?? '#c9a24b'
          }

          return '#d8cdb8'
        }
      )
      .attr(
        'fill-opacity',
        (d) =>
          d.kind === 'GARMENT'
            ? 0.45
            : 1
      )
      .style(
        'cursor',
        'pointer'
      )
      .on(
        'click',
        (_event, d) => {
          onNodeSelect(d)
        }
      )
      .on(
        'mouseenter',
        (event, d) => {
          const [x, y] =
            d3.pointer(
              event,
              svgRef.current
            )

          setHoveredNode({
            node: d,
            x,
            y,
          })
        }
      )
      .on(
        'mousemove',
        (event, d) => {
          const [x, y] =
            d3.pointer(
              event,
              svgRef.current
            )

          setHoveredNode({
            node: d,
            x,
            y,
          })
        }
      )
      .on(
        'mouseleave',
        () => {
          setHoveredNode(null)
        }
      )

    const label = svg
      .selectAll<
        SVGTextElement,
        SimulationNode
      >('text')
      .data(nodes)
      .join('text')
      .text((d) => {
        if (
          d.kind === 'GARMENT' ||
          d.kind === 'ARTWORK'
        ) {
          return ''
        }

        return d.label
      })
      .attr(
        'text-anchor',
        'middle'
      )
      .attr(
        'font-size',
        14
      )
      .attr(
        'pointer-events',
        'none'
      )

    const simulation = d3
      .forceSimulation<
        SimulationNode
      >(nodes)

      .force(
        'link',
        d3
          .forceLink<
            SimulationNode,
            SimulationLink
          >(links)
          .id((d) => d.id)
          .distance(
            (relationship) => {
              if (
                relationship.type ===
                'CREATED'
              ) {
                return 80
              }

              if (
                relationship.type ===
                'EXAMPLE_OF'
              ) {
                return 95
              }

              return 175
            }
          )
      )

      .force(
        'charge',
        d3
          .forceManyBody<
            SimulationNode
          >()
          .strength((d) => {
            if (
              d.kind === 'GARMENT'
            ) {
              return -30
            }

            if (
              d.kind === 'ARTWORK'
            ) {
              return -45
            }

            return -300
          })
      )

      .force(
        'collision',
        d3
          .forceCollide<
            SimulationNode
          >()
          .radius(
            (d) =>
              baseRadius(d) + 5
          )
      )

      .force(
        'center',
        d3.forceCenter(
          300,
          225
        )
      )

    const drag = d3
      .drag<
        SVGCircleElement,
        SimulationNode
      >()

      .on(
        'start',
        (event, d) => {
          if (!event.active) {
            simulation
              .alphaTarget(0.3)
              .restart()
          }

          d.fx = d.x
          d.fy = d.y
        }
      )

      .on(
        'drag',
        (event, d) => {
          d.fx = event.x
          d.fy = event.y
        }
      )

      .on(
        'end',
        (event, d) => {
          if (!event.active) {
            simulation
              .alphaTarget(0)
          }

          d.fx = null
          d.fy = null
        }
      )

    node.call(drag)

    simulation.on(
      'tick',
      () => {
        link
          .attr(
            'x1',
            (d) =>
              (
                d.source as SimulationNode
              ).x ?? 0
          )
          .attr(
            'y1',
            (d) =>
              (
                d.source as SimulationNode
              ).y ?? 0
          )
          .attr(
            'x2',
            (d) =>
              (
                d.target as SimulationNode
              ).x ?? 0
          )
          .attr(
            'y2',
            (d) =>
              (
                d.target as SimulationNode
              ).y ?? 0
          )

        node
          .attr(
            'cx',
            (d) =>
              d.x ?? 0
          )
          .attr(
            'cy',
            (d) =>
              d.y ?? 0
          )

        label
          .attr(
            'x',
            (d) =>
              d.x ?? 0
          )
          .attr(
            'y',
            (d) =>
              (d.y ?? 0) +
              baseRadius(d) +
              18
          )
      }
    )

    return () => {
      simulation.stop()
    }
  }, [
    graph,
    onNodeSelect,
  ])

  useEffect(() => {
    if (!svgRef.current) {
      return
    }

    const svg =
      d3.select(svgRef.current)

    svg
      .selectAll<
        SVGCircleElement,
        SimulationNode
      >('circle')

      .attr(
        'r',
        (d) => {
          const radius =
            baseRadius(d)

          return d.id ===
            selectedNode?.id
            ? radius + 4
            : radius
        }
      )

      .attr(
        'stroke',
        (d) =>
          d.id ===
          selectedNode?.id
            ? '#111'
            : 'none'
      )

      .attr(
        'stroke-width',
        (d) =>
          d.id ===
          selectedNode?.id
            ? 2
            : 0
      )
  }, [selectedNode])

  return (
    <section>
      <h2>Graph</h2>

      <div className={styles.wrapper}>
        <svg
          ref={svgRef}
          width="600"
          height="450"
        />

        {hoveredNode && (
          <div
            className={styles.tooltip}
            style={{
              left: hoveredNode.x + 14,
              top: hoveredNode.y + 14,
            }}
          >
            {hoveredNode.node.image && (
              <img
                className={styles.tooltipImage}
                src={hoveredNode.node.image}
                alt=""
              />
            )}

            <p className={styles.tooltipKind}>
              {hoveredNode.node.kind}
            </p>

            <p className={styles.tooltipTitle}>
              {hoveredNode.node.label}
            </p>

            {hoveredNode.node.date && (
              <p className={styles.tooltipMeta}>
                {hoveredNode.node.date}
              </p>
            )}

            {hoveredNode.node.medium && (
                <p className={styles.tooltipMeta}>
                    {hoveredNode.node.medium}
                </p>
            )}

            {hoveredNode.node.culture && (
                <p className={styles.tooltipMeta}>
                    {hoveredNode.node.culture}
                </p>
            )}

            {hoveredNode.node.description && (
              <p className={styles.tooltipDescription}>
                {hoveredNode.node.description}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default GraphCanvas