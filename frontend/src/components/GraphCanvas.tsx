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
      return 11
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

    const defs =
      svg.append('defs')

    const clipIds =
      new Map<string, string>()

    nodes.forEach(
      (node, index) => {
        if (
          node.kind !== 'ARTWORK' ||
          !(node.imageSmall || node.image)
        ) {
          return
        }

        const clipId =
          `artwork-clip-${index}`

        clipIds.set(
          node.id,
          clipId
        )

        defs
          .append('clipPath')
          .attr('id', clipId)
          .append('circle')
          .attr(
            'r',
            baseRadius(node)
          )
      }
    )

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
      .attr(
        'stroke-width',
        1
      )

    const nodeGroup = svg
      .selectAll<
        SVGGElement,
        SimulationNode
      >('g.graph-node')
      .data(nodes)
      .join('g')
      .attr(
        'class',
        'graph-node'
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

    nodeGroup
      .append('circle')
      .attr(
        'class',
        'node-shape'
      )
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

          return '#e3dccf'
        }
      )
      .attr(
        'fill-opacity',
        (d) =>
          d.kind === 'GARMENT'
            ? 0.45
            : 1
      )

    nodeGroup
      .filter(
        (d) =>
          d.kind === 'ARTWORK' &&
          Boolean(
            d.imageSmall || d.image
          )
      )
      .append('image')
      .attr(
        'href',
        (d) =>
          d.imageSmall ??
          d.image ??
          ''
      )
      .attr(
        'x',
        (d) =>
          -baseRadius(d)
      )
      .attr(
        'y',
        (d) =>
          -baseRadius(d)
      )
      .attr(
        'width',
        (d) =>
          baseRadius(d) * 2
      )
      .attr(
        'height',
        (d) =>
          baseRadius(d) * 2
      )
      .attr(
        'preserveAspectRatio',
        'xMidYMid slice'
      )
      .attr(
        'clip-path',
        (d) => {
          const clipId =
            clipIds.get(d.id)

          return clipId
            ? `url(#${clipId})`
            : null
        }
      )
      .attr(
        'pointer-events',
        'none'
      )

    nodeGroup
      .append('circle')
      .attr(
        'class',
        'node-outline'
      )
      .attr(
        'r',
        (d) =>
          baseRadius(d)
      )
      .attr(
        'fill',
        'none'
      )
      .attr(
        'stroke',
        (d) =>
          d.kind === 'ARTWORK'
            ? '#b8b0a4'
            : 'none'
      )
      .attr(
        'stroke-width',
        (d) =>
          d.kind === 'ARTWORK'
            ? 0.8
            : 0
      )
      .attr(
        'pointer-events',
        'none'
      )

    nodeGroup
      .filter(
        (d) =>
          d.kind === 'DESIGNER' ||
          d.kind === 'SOURCE'
      )
      .append('text')
      .text((d) => d.label)
      .attr(
        'text-anchor',
        'middle'
      )
      .attr(
        'y',
        (d) =>
          baseRadius(d) + 18
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
              return -55
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
              baseRadius(d) + 6
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
        SVGGElement,
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

    nodeGroup.call(drag)

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

        nodeGroup.attr(
          'transform',
          (d) =>
            `translate(${d.x ?? 0}, ${d.y ?? 0})`
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
      >('.node-outline')
      .attr(
        'stroke',
        (d) => {
          if (
            d.id ===
            selectedNode?.id
          ) {
            return '#111'
          }

          return d.kind ===
            'ARTWORK'
            ? '#b8b0a4'
            : 'none'
        }
      )
      .attr(
        'stroke-width',
        (d) => {
          if (
            d.id ===
            selectedNode?.id
          ) {
            return 2
          }

          return d.kind ===
            'ARTWORK'
            ? 0.8
            : 0
        }
      )
  }, [selectedNode])

  const hoverImage =
    hoveredNode?.node.kind ===
    'ARTWORK'
      ? (
          hoveredNode.node
            .imageSmall ??
          hoveredNode.node.image
        )
      : undefined

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
              left:
                hoveredNode.x + 14,
              top:
                hoveredNode.y + 14,
            }}
          >
            {hoverImage && (
              <img
                className={
                  styles.tooltipImage
                }
                src={hoverImage}
                alt=""
              />
            )}

            <p
              className={
                styles.tooltipKind
              }
            >
              {hoveredNode.node.kind}
            </p>

            <p
              className={
                styles.tooltipTitle
              }
            >
              {hoveredNode.node.label}
            </p>

            {hoveredNode.node.artist && (
              <p
                className={
                  styles.tooltipArtist
                }
              >
                {hoveredNode.node
                  .artistPrefix
                  ? `${hoveredNode.node.artistPrefix} ${hoveredNode.node.artist}`
                  : hoveredNode.node.artist}
              </p>
            )}

            {hoveredNode.node.date && (
              <p
                className={
                  styles.tooltipMeta
                }
              >
                {hoveredNode.node.date}
              </p>
            )}

            {hoveredNode.node.medium && (
              <p
                className={
                  styles.tooltipMeta
                }
              >
                {hoveredNode.node.medium}
              </p>
            )}

            {hoveredNode.node.culture && (
              <p
                className={
                  styles.tooltipMeta
                }
              >
                {hoveredNode.node.culture}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default GraphCanvas