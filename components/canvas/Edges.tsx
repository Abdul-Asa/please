"use client";
import { useCanvas } from "./useCanvas";
import { createPath, getAnchorPoint } from "./utils";
import { Direction } from "./types";

export function CanvasEdges() {
  const { canvas } = useCanvas();
  const { edges, nodes } = canvas;

  return (
    <svg className="absolute inset-0 h-full w-full pointer-events-none">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="8"
          refX="5"
          refY="4"
          orient="auto"
        >
          <polygon points="0 0, 10 4, 0 8" className="fill-text" />
        </marker>
      </defs>
      <g id="edge-paths">
        {edges.map((edge) => {
          const sourceNode = nodes.find((n) => n.id === edge.fromNode);
          const targetNode = nodes.find((n) => n.id === edge.toNode);

          if (!sourceNode || !targetNode) return null;

          // Calculate source and target points
          const fromPoint = {
            x: sourceNode.x + sourceNode.width / 2,
            y: sourceNode.y + sourceNode.height / 2,
          };
          const toPoint = {
            x: targetNode.x + targetNode.width / 2,
            y: targetNode.y + targetNode.height / 2,
          };

          // Determine optimal connection sides
          const fromSide: Direction =
            toPoint.x > fromPoint.x ? "right" : "left";
          const toSide: Direction = fromPoint.x > toPoint.x ? "right" : "left";

          // Create curved path
          const pathData = createPath(
            fromPoint,
            toPoint,
            0.5, // curveTightness
            50, // straightLineLength
            fromSide,
            toSide
          );

          return (
            <path
              key={edge.id}
              d={pathData}
              className="stroke-border"
              strokeWidth={2}
              fill="none"
              markerEnd={edge.toEnd === "arrow" ? "url(#arrowhead)" : undefined}
            />
          );
        })}
      </g>
    </svg>
  );
}
