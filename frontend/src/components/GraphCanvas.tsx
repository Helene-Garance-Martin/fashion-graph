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

type StoredPosition = {
  x: number
  y: number
  vx: number
  vy: number
}

type GraphCanvasProps = {
  graph: GraphData
  selectedNode: GraphNode | null
  onNodeSelect: (
    node: GraphNode
  ) => void
}

const WORLD_WIDTH = 600
const WORLD_HEIGHT = 450

const MIN_ZOOM = 0.35
const MAX_ZOOM = 4

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

  const wrapperRef =
    useRef<HTMLDivElement | null>(null)

  const worldRef =
    useRef<SVGGElement | null>(null)

  const zoomBehaviorRef =
    useRef<
      d3.ZoomBehavior<
        SVGSVGElement,
        unknown
      > | null
    >(null)

  const zoomTransformRef =
    useRef<d3.ZoomTransform>(
      d3.zoomIdentity
    )

  const positionCacheRef =
    useRef<
      Map<string, StoredPosition>
    >(new Map())

  const graphKeyRef =
    useRef<string | null>(null)

  const onNodeSelectRef =
    useRef(onNodeSelect)

  const isDraggingNodeRef =
    useRef(false)

  const [
    hoveredNode,
    setHoveredNode,
  ] =
    useState<HoveredNode | null>(
      null
    )

  useEffect(() => {
    onNodeSelectRef.current =
      onNodeSelect
  }, [onNodeSelect])

  const animateToTransform = (
    transform: d3.ZoomTransform,
    duration = 320
  ) => {
    if (
      !svgRef.current ||
      !zoomBehaviorRef.current
    ) {
      return
    }

    const svg =
      d3.select(svgRef.current)

    svg
      .transition()
      .duration(duration)
      .ease(d3.easeCubicOut)
      .call(
        zoomBehaviorRef.current
          .transform,
        transform
      )
  }

  const getViewportSize = () => {
    if (!svgRef.current) {
      return {
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
      }
    }

    return {
      width:
        svgRef.current
          .clientWidth ||
        WORLD_WIDTH,

      height:
        svgRef.current
          .clientHeight ||
        WORLD_HEIGHT,
    }
  }

  const getResetTransform = () => {
    const {
      width,
      height,
    } = getViewportSize()

    return d3.zoomIdentity.translate(
      width / 2 -
        WORLD_WIDTH / 2,
      height / 2 -
        WORLD_HEIGHT / 2
    )
  }

  const handleZoomBy = (
    factor: number
  ) => {
    const {
      width,
      height,
    } = getViewportSize()

    const current =
      zoomTransformRef.current

    const nextScale =
      Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          current.k * factor
        )
      )

    const centreX =
      width / 2

    const centreY =
      height / 2

    const worldX =
      (
        centreX -
        current.x
      ) /
      current.k

    const worldY =
      (
        centreY -
        current.y
      ) /
      current.k

    const nextX =
      centreX -
      worldX * nextScale

    const nextY =
      centreY -
      worldY * nextScale

    animateToTransform(
      d3.zoomIdentity
        .translate(
          nextX,
          nextY
        )
        .scale(nextScale),
      220
    )
  }

  const handleZoomIn = () => {
    handleZoomBy(1.25)
  }

  const handleZoomOut = () => {
    handleZoomBy(0.8)
  }

  const handleReset = () => {
    animateToTransform(
      getResetTransform(),
      360
    )
  }

  const handleFit = () => {
    if (
      !svgRef.current ||
      !worldRef.current
    ) {
      return
    }

    const {
      width,
      height,
    } = getViewportSize()

    const bounds =
      worldRef.current.getBBox()

    if (
      bounds.width === 0 ||
      bounds.height === 0
    ) {
      return
    }

    const padding = 56

    const availableWidth =
      Math.max(
        1,
        width -
          padding * 2
      )

    const availableHeight =
      Math.max(
        1,
        height -
          padding * 2
      )

    const scale =
      Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          Math.min(
            availableWidth /
              bounds.width,
            availableHeight /
              bounds.height
          )
        )
      )

    const centreX =
      bounds.x +
      bounds.width / 2

    const centreY =
      bounds.y +
      bounds.height / 2

    const transform =
      d3.zoomIdentity
        .translate(
          width / 2 -
            centreX * scale,
          height / 2 -
            centreY * scale
        )
        .scale(scale)

    animateToTransform(
      transform,
      440
    )
  }

  useEffect(() => {
    if (!svgRef.current) {
      return
    }

    const svg =
      d3.select(svgRef.current)

    svg
      .selectAll('*')
      .remove()

    setHoveredNode(null)

    const primaryNode =
      graph.nodes.find(
        (node) =>
          node.kind ===
          'DESIGNER'
      ) ??
      graph.nodes.find(
        (node) =>
          node.kind ===
          'SOURCE'
      )

    const graphKey =
      primaryNode?.id ??
      'graph'

    const isNewGraph =
      graphKeyRef.current !==
      graphKey

    if (isNewGraph) {
      graphKeyRef.current =
        graphKey

      positionCacheRef.current.clear()

      zoomTransformRef.current =
        d3.zoomIdentity
    }

    const nodes: SimulationNode[] =
      graph.nodes.map(
        (node) => {
          const cached =
            positionCacheRef.current.get(
              node.id
            )

          if (!cached) {
            return {
              ...node,
            }
          }

          return {
            ...node,

            x: cached.x,
            y: cached.y,
            vx: cached.vx,
            vy: cached.vy,
          }
        }
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
          node.kind ===
          'DESIGNER'
      )?.color ?? '#222'

    const defs =
      svg.append('defs')

    const clipIds =
      new Map<string, string>()

    nodes.forEach(
      (node, index) => {
        if (
          node.kind !==
            'ARTWORK' ||
          !(
            node.imageSmall ||
            node.image
          )
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
          .attr(
            'id',
            clipId
          )
          .append('circle')
          .attr(
            'r',
            baseRadius(node)
          )
      }
    )

    const world =
      svg
        .append('g')
        .attr(
          'class',
          'graph-world'
        )

    worldRef.current =
      world.node()

    const zoom =
      d3
        .zoom<
          SVGSVGElement,
          unknown
        >()
        .scaleExtent([
          MIN_ZOOM,
          MAX_ZOOM,
        ])
        .extent(() => [
          [0, 0],
          [
            svgRef.current
              ?.clientWidth ??
              WORLD_WIDTH,

            svgRef.current
              ?.clientHeight ??
              WORLD_HEIGHT,
          ],
        ])
        .filter(
          (event) => {
            if (
              event.type ===
              'dblclick'
            ) {
              return false
            }

            if (
              event.type ===
              'wheel'
            ) {
              return true
            }

            if (
              event.button &&
              event.button !== 0
            ) {
              return false
            }

            const target =
              event.target

            if (
              target instanceof
              Element
            ) {
              return !target.closest(
                '.graph-node'
              )
            }

            return true
          }
        )
        .on(
          'zoom',
          (event) => {
            zoomTransformRef.current =
              event.transform

            world.attr(
              'transform',
              event.transform.toString()
            )
          }
        )

    zoomBehaviorRef.current =
      zoom

    svg.call(zoom)

    svg.on(
      'dblclick.zoom',
      null
    )

    const initialTransform =
      isNewGraph
        ? getResetTransform()
        : zoomTransformRef.current

    zoomTransformRef.current =
      initialTransform

    svg.call(
      zoom.transform,
      initialTransform
    )

    const link =
      world
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
        .attr(
          'vector-effect',
          'non-scaling-stroke'
        )

    const nodeGroup =
      world
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
          'grab'
        )
        .on(
          'click',
          (event, d) => {
            if (
              event.defaultPrevented
            ) {
              return
            }

            onNodeSelectRef.current(
              d
            )
          }
        )
        .on(
          'mouseenter',
          (event, d) => {
            if (
              isDraggingNodeRef.current
            ) {
              return
            }

            const wrapper =
              wrapperRef.current

            if (!wrapper) {
              return
            }

            const rect =
              wrapper.getBoundingClientRect()

            const x =
              event.clientX -
              rect.left

            const y =
              event.clientY -
              rect.top

            const tooltipWidth =
              190

            const tooltipHeight =
              220

            const left =
              Math.max(
                12,
                Math.min(
                  x + 14,
                  rect.width -
                    tooltipWidth -
                    12
                )
              )

            const top =
              y >
              rect.height -
                tooltipHeight
                ? Math.max(
                    12,
                    y -
                      tooltipHeight
                  )
                : y + 14

            setHoveredNode({
              node: d,
              x: left,
              y: top,
            })
          }
        )
        .on(
          'mousemove',
          (event, d) => {
            if (
              isDraggingNodeRef.current
            ) {
              return
            }

            const wrapper =
              wrapperRef.current

            if (!wrapper) {
              return
            }

            const rect =
              wrapper.getBoundingClientRect()

            const x =
              event.clientX -
              rect.left

            const y =
              event.clientY -
              rect.top

            const tooltipWidth =
              190

            const tooltipHeight =
              220

            const left =
              Math.max(
                12,
                Math.min(
                  x + 14,
                  rect.width -
                    tooltipWidth -
                    12
                )
              )

            const top =
              y >
              rect.height -
                tooltipHeight
                ? Math.max(
                    12,
                    y -
                      tooltipHeight
                  )
                : y + 14

            setHoveredNode({
              node: d,
              x: left,
              y: top,
            })
          }
        )
        .on(
          'mouseleave',
          () => {
            if (
              !isDraggingNodeRef.current
            ) {
              setHoveredNode(
                null
              )
            }
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
        (d) =>
          baseRadius(d)
      )
      .attr(
        'fill',
        (d) => {
          if (
            d.kind ===
            'DESIGNER'
          ) {
            return (
              d.color ??
              '#222'
            )
          }

          if (
            d.kind ===
            'GARMENT'
          ) {
            return primaryDesignerColor
          }

          if (
            d.kind ===
            'SOURCE'
          ) {
            return (
              d.color ??
              '#c9a24b'
            )
          }

          return '#e3dccf'
        }
      )
      .attr(
        'fill-opacity',
        (d) =>
          d.kind ===
          'GARMENT'
            ? 0.45
            : 1
      )

    nodeGroup
      .filter(
        (d) =>
          d.kind ===
            'ARTWORK' &&
          Boolean(
            d.imageSmall ||
              d.image
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
          d.kind ===
          'ARTWORK'
            ? '#b8b0a4'
            : 'none'
      )
      .attr(
        'stroke-width',
        (d) =>
          d.kind ===
          'ARTWORK'
            ? 0.8
            : 0
      )
      .attr(
        'vector-effect',
        'non-scaling-stroke'
      )
      .attr(
        'pointer-events',
        'none'
      )

    nodeGroup
      .filter(
        (d) =>
          d.kind ===
            'DESIGNER' ||
          d.kind ===
            'SOURCE'
      )
      .append('text')
      .text(
        (d) => d.label
      )
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

    const simulation =
      d3
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
            .id(
              (d) => d.id
            )
            .distance(
              (
                relationship
              ) => {
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
            .strength(
              (d) => {
                if (
                  d.kind ===
                  'GARMENT'
                ) {
                  return -30
                }

                if (
                  d.kind ===
                  'ARTWORK'
                ) {
                  return -55
                }

                return -300
              }
            )
        )

        .force(
          'collision',
          d3
            .forceCollide<
              SimulationNode
            >()
            .radius(
              (d) =>
                baseRadius(d) +
                6
            )
        )

        .force(
          'center',
          d3.forceCenter(
            WORLD_WIDTH / 2,
            WORLD_HEIGHT / 2
          )
        )

    const drag =
      d3
        .drag<
          SVGGElement,
          SimulationNode
        >()

        .on(
          'start',
          (event, d) => {
            isDraggingNodeRef.current =
              true

            setHoveredNode(
              null
            )

            d3
              .select(
                event.sourceEvent
                  .currentTarget
              )
              .style(
                'cursor',
                'grabbing'
              )

            if (
              !event.active
            ) {
              simulation
                .alphaTarget(
                  0.3
                )
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
            if (
              !event.active
            ) {
              simulation.alphaTarget(
                0
              )
            }

            d.fx = null
            d.fy = null

            isDraggingNodeRef.current =
              false

            d3
              .select(
                event.sourceEvent
                  .currentTarget
              )
              .style(
                'cursor',
                'grab'
              )
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
                d.source as
                  SimulationNode
              ).x ?? 0
          )
          .attr(
            'y1',
            (d) =>
              (
                d.source as
                  SimulationNode
              ).y ?? 0
          )
          .attr(
            'x2',
            (d) =>
              (
                d.target as
                  SimulationNode
              ).x ?? 0
          )
          .attr(
            'y2',
            (d) =>
              (
                d.target as
                  SimulationNode
              ).y ?? 0
          )

        nodeGroup.attr(
          'transform',
          (d) =>
            `translate(${
              d.x ?? 0
            }, ${
              d.y ?? 0
            })`
        )

        nodes.forEach(
          (node) => {
            if (
              node.x ===
                undefined ||
              node.y ===
                undefined
            ) {
              return
            }

            positionCacheRef.current.set(
              node.id,
              {
                x: node.x,
                y: node.y,
                vx:
                  node.vx ??
                  0,
                vy:
                  node.vy ??
                  0,
              }
            )
          }
        )
      }
    )

    return () => {
      simulation.stop()

      svg.on(
        '.zoom',
        null
      )
    }
  }, [graph])

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
    <section
      className={
        styles.section
      }
    >
      <div
        className={
          styles.graphHeader
        }
      >
        <h2
          className={
            styles.heading
          }
        >
          Graph
        </h2>

        <p
          className={
            styles.hint
          }
        >
          Drag to pan · scroll to zoom
        </p>
      </div>

      <div
        ref={wrapperRef}
        className={
          styles.wrapper
        }
      >
        <svg
          ref={svgRef}
          className={
            styles.svg
          }
          role="img"
          aria-label="Interactive collection graph"
        />

        <div
          className={
            styles.controls
          }
          aria-label="Graph controls"
        >
          <button
            type="button"
            className={
              styles.controlButton
            }
            onClick={
              handleZoomIn
            }
            aria-label="Zoom in"
            title="Zoom in"
          >
            +
          </button>

          <button
            type="button"
            className={
              styles.controlButton
            }
            onClick={
              handleZoomOut
            }
            aria-label="Zoom out"
            title="Zoom out"
          >
            −
          </button>

          <button
            type="button"
            className={`${styles.controlButton} ${styles.controlText}`}
            onClick={
              handleFit
            }
            title="Fit graph to view"
          >
            Fit
          </button>

          <button
            type="button"
            className={`${styles.controlButton} ${styles.controlText}`}
            onClick={
              handleReset
            }
            title="Reset graph view"
          >
            Reset
          </button>
        </div>

        {hoveredNode && (
          <div
            className={
              styles.tooltip
            }
            style={{
              left:
                hoveredNode.x,
              top:
                hoveredNode.y,
            }}
          >
            {hoverImage && (
              <img
                className={
                  styles.tooltipImage
                }
                src={
                  hoverImage
                }
                alt=""
              />
            )}

            <p
              className={
                styles.tooltipKind
              }
            >
              {
                hoveredNode
                  .node.kind
              }
            </p>

            <p
              className={
                styles.tooltipTitle
              }
            >
              {
                hoveredNode
                  .node.label
              }
            </p>

            {hoveredNode.node
              .artist && (
              <p
                className={
                  styles.tooltipArtist
                }
              >
                {hoveredNode
                  .node
                  .artistPrefix
                  ? `${hoveredNode.node.artistPrefix} ${hoveredNode.node.artist}`
                  : hoveredNode.node.artist}
              </p>
            )}

            {hoveredNode.node
              .date && (
              <p
                className={
                  styles.tooltipMeta
                }
              >
                {
                  hoveredNode
                    .node.date
                }
              </p>
            )}

            {hoveredNode.node
              .medium && (
              <p
                className={
                  styles.tooltipMeta
                }
              >
                {
                  hoveredNode
                    .node.medium
                }
              </p>
            )}

            {hoveredNode.node
              .culture && (
              <p
                className={
                  styles.tooltipMeta
                }
              >
                {
                  hoveredNode
                    .node.culture
                }
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export default GraphCanvas