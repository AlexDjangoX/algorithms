"use client";

import { useMemo } from "react";
import {
  type BSTData,
  type BSTNode,
  BST_SEARCH_DEMO_TARGETS,
} from "@/algorithms/binary-search-tree/algorithm";

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

/** Always visible so users know the page has a second phase (easy to miss at the end of the timeline). */
function BstDemoRoadmap({ phase }: { phase: "insert" | "search" }) {
  const insertActive = phase === "insert";
  const searchActive = phase === "search";
  const badge = (active: boolean, label: string) => (
    <span
      className={
        active
          ? "inline-flex rounded-md border border-primary bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary"
          : "inline-flex rounded-md border border-transparent bg-secondary/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground"
      }
    >
      {label}
    </span>
  );
  return (
    <div className="flex flex-col gap-2 border-b border-border bg-muted/25 px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="max-w-xl text-[11px] leading-snug text-muted-foreground">
        <span className="font-semibold text-foreground">Two-part demo:</span> insert keys from the strip
        below, then the timeline continues with{" "}
        <span className="font-semibold text-foreground">lookup</span> for{" "}
        <span className="whitespace-nowrap font-mono text-xs font-bold text-foreground">
          {BST_SEARCH_DEMO_TARGETS.join(" → ")}
        </span>{" "}
        (in tree vs not).
      </p>
      <div className="flex shrink-0 items-center gap-2">
        {badge(insertActive, "1 · Build")}
        <span className="text-muted-foreground" aria-hidden>
          →
        </span>
        {badge(searchActive, "2 · Lookup")}
      </div>
    </div>
  );
}

function InputSequenceStrip({
  values,
  completedCount,
  insertingValue,
}: {
  values: number[];
  completedCount: number;
  insertingValue: number | null;
}) {
  if (values.length === 0) return null;
  return (
    <div className="shrink-0 border-b border-border bg-background/40 px-3 py-2.5">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Input · insertion order
      </p>
      <div className="flex max-h-24 flex-wrap content-start gap-1.5 overflow-y-auto">
        {values.map((v, idx) => {
          const inTree = idx < completedCount;
          const active = idx === completedCount && insertingValue !== null;
          return (
            <span
              key={idx}
              className={[
                "inline-flex min-w-8 items-center justify-center rounded-md border px-2 py-1 font-mono text-xs font-semibold tabular-nums transition-colors",
                inTree
                  ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                  : active
                    ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/30"
                    : "border-border bg-secondary/60 text-muted-foreground",
              ].join(" ")}
              title={
                inTree
                  ? "Already in the tree"
                  : active
                    ? "Inserting now"
                    : "Not inserted yet"
              }
            >
              {v}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SearchPhaseBanner({
  target,
  resultNodeId,
  missNodeId,
}: {
  target: number | null;
  resultNodeId: number | null;
  missNodeId: number | null;
}) {
  if (target === null) return null;
  const found = resultNodeId !== null;
  const missed = missNodeId !== null;
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-primary/5 px-3 py-2">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Search
      </span>
      <span className="rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-sm font-bold tabular-nums text-primary">
        {target}
      </span>
      {found && (
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
          Found in tree
        </span>
      )}
      {missed && (
        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
          Not in tree
        </span>
      )}
      {!found && !missed && (
        <span className="text-xs text-muted-foreground">Walking from the root…</span>
      )}
    </div>
  );
}

export function BSTViz({ data }: { data: BSTData }) {
  const {
    nodes,
    root,
    highlightId,
    pathIds,
    newNodeId,
    inputSequence = [],
    completedInputCount = 0,
    insertingValue,
    phase = "insert",
    searchTarget = null,
    searchResultNodeId = null,
    searchMissNodeId = null,
  } = data;
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
        className="flex flex-col overflow-hidden rounded-2xl border border-border bg-secondary/80"
        style={{ height: VIZ_HEIGHT + 72 }}
      >
        <BstDemoRoadmap phase={phase} />
        <InputSequenceStrip
          values={inputSequence}
          completedCount={completedInputCount}
          insertingValue={insertingValue}
        />
        {phase === "search" && (
          <SearchPhaseBanner
            target={searchTarget}
            resultNodeId={searchResultNodeId}
            missNodeId={searchMissNodeId}
          />
        )}
        <div className="flex flex-1 items-center justify-center px-4 text-center text-sm text-muted-foreground">
          Press ▶ to start building the tree
        </div>
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
      className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-secondary/80"
      style={{ height: VIZ_HEIGHT + 72 }}
    >
      <BstDemoRoadmap phase={phase} />
      <InputSequenceStrip
        values={inputSequence}
        completedCount={completedInputCount}
        insertingValue={insertingValue}
      />
      {phase === "search" && (
        <SearchPhaseBanner
          target={searchTarget}
          resultNodeId={searchResultNodeId}
          missNodeId={searchMissNodeId}
        />
      )}
      <div className="min-h-0 flex-1 overflow-auto">
        <svg
          width={viewW}
          height={viewH}
          viewBox={`0 0 ${viewW} ${viewH}`}
          preserveAspectRatio="xMidYMid meet"
          className="mx-auto block max-w-full"
        >
        {/* Edges */}
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.from.x}
            y1={e.from.y}
            x2={e.to.x}
            y2={e.to.y}
            stroke="hsl(var(--muted-foreground))"
            strokeOpacity={0.85}
            strokeWidth={3.5}
            strokeLinecap="round"
          />
        ))}

        {/* Nodes */}
        {Object.values(nodes).map((node) => {
          const pos = positions.get(node.id);
          if (!pos) return null;

          const isNew = node.id === newNodeId;
          const isHighlight = node.id === highlightId;
          const isPath = pathSet.has(node.id);
          const isSearchFound = searchResultNodeId === node.id;
          const isSearchMiss = searchMissNodeId === node.id;

          // Colour logic — only one state applies at a time
          let fill: string;
          let stroke: string;
          let fillOpacity = 1;
          let strokeOpacity = 1;
          let textFill: string;

          if (isSearchFound) {
            fill = "#f59e0b";
            stroke = "#d97706";
            textFill = "#ffffff";
          } else if (isSearchMiss) {
            fill = "#ea580c";
            stroke = "#c2410c";
            fillOpacity = 0.35;
            strokeOpacity = 0.95;
            textFill = "var(--foreground)";
          } else if (isNew) {
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
    </div>
  );
}
