"use client";

import { useMemo } from "react";
import type { BSTData, BSTNode } from "@/algorithms/binary-search-tree/algorithm";

const VIZ_HEIGHT = 432;
const NODE_R = 21;
// Vertical spacing between levels — fits 4 levels comfortably in VIZ_HEIGHT.
const V_SPACING = 96;

type Pos = { x: number; y: number };

/**
 * Position each node using recursive halving of the horizontal range.
 * Each node owns [xLeft, xRight] and sits at the midpoint. Its children
 * split that range in half. Positions are stable as new nodes are added —
 * inserting a child never moves its siblings or ancestors.
 */
function layoutTree(
  nodeId: number | null,
  nodes: Record<number, BSTNode>,
  xLeft: number,
  xRight: number,
  depth: number,
  positions: Map<number, Pos>,
): void {
  if (nodeId === null || !nodes[nodeId]) return;
  const x = (xLeft + xRight) / 2;
  const y = depth * V_SPACING + NODE_R + 16;
  positions.set(nodeId, { x, y });
  const node = nodes[nodeId]!;
  layoutTree(node.left, nodes, xLeft, x, depth + 1, positions);
  layoutTree(node.right, nodes, x, xRight, depth + 1, positions);
}

function treeDepth(nodeId: number | null, nodes: Record<number, BSTNode>): number {
  if (nodeId === null || !nodes[nodeId]) return 0;
  const n = nodes[nodeId]!;
  return 1 + Math.max(treeDepth(n.left, nodes), treeDepth(n.right, nodes));
}

export function BSTViz({ data }: { data: BSTData }) {
  const { nodes, root, highlightId, pathIds, newNodeId } = data;
  const nodeCount = Object.keys(nodes).length;

  const { positions, viewW, viewH } = useMemo(() => {
    if (root === null || nodeCount === 0) {
      return { positions: new Map<number, Pos>(), viewW: 300, viewH: 200 };
    }

    const maxDepth = treeDepth(root, nodes) - 1;
    // At the deepest level there can be 2^maxDepth slots; each slot needs
    // at least 2*NODE_R + 4 px of breathing room.
    const leafSlots = Math.pow(2, maxDepth);
    const slotW = Math.max(NODE_R * 2 + 8, (NODE_R * 2 + 8));
    const W = Math.max(400, leafSlots * slotW + NODE_R * 4);
    const H = (maxDepth + 1) * V_SPACING + NODE_R * 2 + 32;

    const positions = new Map<number, Pos>();
    layoutTree(root, nodes, 0, W, 0, positions);

    return { positions, viewW: W, viewH: H };
  }, [nodes, root, nodeCount]);

  if (nodeCount === 0 || root === null) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-border bg-secondary/80 text-muted-foreground text-sm"
        style={{ height: VIZ_HEIGHT + 48 }}
      >
        Press ▶ to start building the tree
      </div>
    );
  }

  const pathSet = new Set(pathIds);

  // Collect edges (draw before nodes so nodes sit on top)
  const edges: { from: Pos; to: Pos }[] = [];
  for (const node of Object.values(nodes)) {
    const from = positions.get(node.id);
    if (!from) continue;
    if (node.left !== null) {
      const to = positions.get(node.left);
      if (to) edges.push({ from, to });
    }
    if (node.right !== null) {
      const to = positions.get(node.right);
      if (to) edges.push({ from, to });
    }
  }

  return (
    <div
      className="relative overflow-auto rounded-2xl border border-border bg-secondary/80"
      style={{ height: VIZ_HEIGHT + 48 }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${viewW} ${viewH}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", minHeight: "100%" }}
      >
        {/* Edges */}
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.from.x}
            y1={e.from.y}
            x2={e.to.x}
            y2={e.to.y}
            stroke="var(--border)"
            strokeWidth={2.5}
          />
        ))}

        {/* Nodes */}
        {Object.values(nodes).map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;

          const isNew = node.id === newNodeId;
          const isHighlight = node.id === highlightId;
          const isPath = pathSet.has(node.id);

          // Colour logic — only one state applies at a time
          let fill: string;
          let stroke: string;
          let fillOpacity = 1;
          let strokeOpacity = 1;
          let textFill: string;

          if (isNew) {
            // Just inserted: bright green
            fill = "#22c55e";
            stroke = "#16a34a";
            textFill = "#ffffff";
          } else if (isHighlight) {
            // Currently being compared: primary accent
            fill = "var(--primary)";
            stroke = "var(--primary)";
            textFill = "var(--primary-foreground)";
          } else if (isPath) {
            // Already traversed on this insertion path: dim primary tint
            fill = "var(--primary)";
            stroke = "var(--primary)";
            fillOpacity = 0.18;
            strokeOpacity = 0.55;
            textFill = "var(--foreground)";
          } else {
            // Default settled node: green tint matching the BST aesthetic
            fill = "#16a34a";
            stroke = "#15803d";
            fillOpacity = 0.15;
            strokeOpacity = 0.6;
            textFill = "var(--foreground)";
          }

          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_R}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke={stroke}
                strokeOpacity={strokeOpacity}
                strokeWidth={2}
              />
              <text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fill={textFill}
                fontSize={13}
                fontWeight={700}
                fontFamily="ui-monospace, monospace"
              >
                {node.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
