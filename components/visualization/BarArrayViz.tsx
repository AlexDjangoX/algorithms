"use client";

import { useMemo } from "react";

/** Shared shape for algorithms that visualize an array with optional highlighted indices (e.g. bubble sort, insertion sort). */
export interface ArrayWithHighlightsData {
  array: number[];
  highlightIndices?: number[];
  /** Original input order — carried on steps for the page-level input preview. */
  inputSequence?: number[];
}

const BAR_H = 384;
const PAD_B = 24;

function barColor(value: number, max: number) {
  const t = value / max;
  return `hsl(${220 + t * 120}, ${68 + t * 22}%, ${52 + t * 12}%)`;
}

export function BarArrayViz({ data }: { data: ArrayWithHighlightsData }) {
  const { array, highlightIndices = [] } = data;
  const n = array.length;
  const highlightSet = useMemo(
    () => new Set(highlightIndices),
    [highlightIndices],
  );
  const maxVal = useMemo(
    () => (n > 0 ? Math.max(...array) : 1),
    [array, n],
  );

  if (n === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-secondary/80">
        <div
          className="flex flex-1 items-center justify-center text-sm text-muted-foreground"
          style={{ minHeight: BAR_H + PAD_B * 2 }}
        >
          No data
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-secondary/80">
      <div
        className="relative shrink-0"
        style={{ height: BAR_H + PAD_B * 2 }}
      >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: PAD_B,
          height: BAR_H,
        }}
      >
        {array.map((val, idx) => {
          const isHighlight = highlightSet.has(idx);
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                bottom: 0,
                left: `${(idx / n) * 100}%`,
                width: `${100 / n}%`,
                height: Math.max((val / maxVal) * BAR_H, 6),
                backgroundColor: barColor(val, maxVal),
                borderRadius: "3px 3px 0 0",
                boxShadow: isHighlight
                  ? "0 0 0 2px var(--primary)"
                  : undefined,
              }}
            />
          );
        })}
      </div>
      </div>
    </div>
  );
}
