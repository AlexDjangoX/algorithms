"use client";

import { useMemo } from "react";
import type { BeadSortData } from "@/algorithms/bead-sort/algorithm";

const VIZ_H = 432;
const PAD = 20;
const MIN_ROW_H = 8;

/**
 * Bead sort — horizontal bar visualization.
 *
 * Each row = one input element, displayed as a left-aligned horizontal bar.
 * Bar length = number of beads in that row.
 *
 * Phases:
 *   place   — bars fill in row by row (active row highlighted)
 *   gravity — rods processed left→right; beads fall to the bottom rows
 *             (active column shown as a faint vertical guide)
 *   done    — bars sorted: shortest at top, longest at bottom
 */
export function BeadSortViz({ data }: { data: BeadSortData }) {
  const { grid, n, maxVal, phase, activeCol, activeRow } = data;

  const rowH = useMemo(() => {
    if (n === 0) return MIN_ROW_H;
    const available = VIZ_H - PAD * 2 - (n - 1) * 3;
    return Math.max(MIN_ROW_H, Math.floor(available / n));
  }, [n]);

  if (n === 0 || maxVal === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-secondary/80">
        <div
          className="flex flex-1 items-center justify-center text-sm text-muted-foreground"
          style={{ minHeight: VIZ_H }}
        >
          Press ▶ to start
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-secondary/80"
      style={{ minHeight: VIZ_H }}
    >
      <div className="relative min-h-0 h-full">
        {/* Active-column vertical guide during gravity */}
        {phase === "gravity" && typeof activeCol === "number" && (
          <ActiveColGuide
            activeCol={activeCol}
            maxVal={maxVal}
            pad={PAD}
            height={VIZ_H}
          />
        )}

        <div
          className="flex h-full flex-col justify-center"
          style={{ padding: `${PAD}px ${PAD + 4}px`, minHeight: VIZ_H - 8 }}
        >
        <div className="flex flex-col" style={{ gap: 3 }}>
          {grid.map((row, rowIdx) => {
            const beads = row.reduce((a, b) => a + b, 0);
            const isActiveRow = phase === "place" && activeRow === rowIdx;
            const isSettled =
              phase === "gravity" &&
              typeof activeCol === "number" &&
              rowIdx >= n - beads;
            const isDone = phase === "done";

            return (
              <BeadRow
                key={rowIdx}
                beads={beads}
                maxVal={maxVal}
                rowH={rowH}
                isActiveRow={isActiveRow}
                isSettled={isSettled}
                isDone={isDone}
                phase={phase}
              />
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BeadRow({
  beads,
  maxVal,
  rowH,
  isActiveRow,
  isSettled,
  isDone,
  phase,
}: {
  beads: number;
  maxVal: number;
  rowH: number;
  isActiveRow: boolean;
  isSettled: boolean;
  isDone: boolean;
  phase: string;
}) {
  const pct = maxVal > 0 ? (beads / maxVal) * 100 : 0;

  let barColor: string;
  if (isDone) {
    barColor = "hsl(var(--primary))";
  } else if (isActiveRow) {
    barColor = "var(--foreground)"; // high-contrast vs chromatic bars (light: dark, dark: light)
  } else if (isSettled) {
    barColor = "hsl(var(--primary) / 0.55)"; // dimmed — settled by gravity
  } else if (phase === "gravity") {
    barColor = "hsl(var(--primary) / 0.9)";
  } else {
    barColor = "hsl(var(--primary))";
  }

  return (
    <div
      className="relative rounded-sm overflow-hidden"
      style={{
        height: rowH,
        backgroundColor: "hsl(var(--border))",
      }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-sm transition-all duration-200"
        style={{
          width: `${pct}%`,
          backgroundColor: barColor,
          minWidth: beads > 0 ? 4 : 0,
        }}
      />
    </div>
  );
}

function ActiveColGuide({
  activeCol,
  maxVal,
  pad,
  height,
}: {
  activeCol: number;
  maxVal: number;
  pad: number;
  height: number;
}) {
  // Map rod index to horizontal % of the available bar area
  const innerW = `calc(100% - ${(pad + 4) * 2}px)`;
  const leftOffset = `calc(${pad + 4}px + ${innerW} * ${activeCol / maxVal})`;

  return (
    <div
      className="absolute top-0 bottom-0 pointer-events-none"
      style={{
        left: leftOffset,
        width: 2,
        backgroundColor: "hsl(var(--primary) / 0.35)",
        zIndex: 1,
        height,
      }}
    />
  );
}
