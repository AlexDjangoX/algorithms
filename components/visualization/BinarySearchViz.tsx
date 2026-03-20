"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { BinarySearchData } from "@/algorithms/binary-search/algorithm";

const BAR_H = 300;
const CONNECTOR_H = 52;
const PAD_B = 24;
const CHART_H = BAR_H + CONNECTOR_H + PAD_B * 2;

function barColor(value: number, max: number) {
  const t = value / max;
  return `hsl(${220 + t * 120}, ${68 + t * 22}%, ${52 + t * 12}%)`;
}

function BsPhaseRoadmap({ phase }: { phase: "sort" | "search" }) {
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
    <div className="shrink-0 border-b border-border bg-muted/25 px-3 py-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="max-w-xl text-[11px] leading-snug text-muted-foreground">
          <span className="font-semibold text-foreground">This application</span> runs{" "}
          <span className="text-foreground">insertion sort</span> on the bars, then{" "}
          <span className="text-foreground">binary search</span>. See also the standalone{" "}
          <Link
            href="/algorithms/insertion-sort"
            className="font-medium text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
          >
            Insertion sort
          </Link>{" "}
          page.
        </p>
        <div className="flex shrink-0 items-center gap-2">
          {badge(phase === "sort", "1 · Sort")}
          <span className="text-muted-foreground" aria-hidden>
            →
          </span>
          {badge(phase === "search", "2 · Search")}
        </div>
      </div>
    </div>
  );
}

export function BinarySearchViz({ data }: { data: BinarySearchData }) {
  const { array, highlightIndices = [], target, range, phase = "search" } = data;
  const n = array.length;
  const highlightSet = useMemo(
    () => new Set(highlightIndices),
    [highlightIndices],
  );
  const maxVal = useMemo(
    () => (n > 0 ? Math.max(...array) : 1),
    [array, n],
  );

  /** Merge lo/mid/hi onto one caption per index so they never stack illegibly (e.g. found: all same index). */
  const rangeLabelMarkers = useMemo(() => {
    if (n === 0 || range == null) return [];
    const loI = range.lo;
    const hiI = range.hi;
    if (loI > hiI) return [];
    const map = new Map<number, string[]>();
    const push = (i: number, label: string) => {
      const cur = map.get(i) ?? [];
      if (!cur.includes(label)) cur.push(label);
      map.set(i, cur);
    };
    push(loI, "lo");
    const midV = range.mid;
    if (typeof midV === "number" && midV >= loI && midV <= hiI) {
      push(midV, "mid");
    }
    push(hiI, "hi");
    return [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([idx, labels]) => ({
        idx,
        text: labels.join(" · "),
        hasMid: labels.includes("mid"),
      }));
  }, [n, range]);

  if (n === 0) {
    return (
      <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-secondary/80">
        <BsPhaseRoadmap phase={phase} />
        <div
          className="flex items-center justify-center text-sm text-muted-foreground"
          style={{ height: CHART_H }}
        >
          No data
        </div>
      </div>
    );
  }

  const u = 100;
  const vbW = n * u;
  const cx = (i: number) => i * u + u / 2;

  const lo = range?.lo ?? 0;
  const hi = range?.hi ?? n - 1;
  const mid = range?.mid;
  const showConnector = phase === "search" && range != null && lo <= hi;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-secondary/80">
      <BsPhaseRoadmap phase={phase} />
      <div className="relative shrink-0" style={{ height: CHART_H }}>
        <div className="absolute right-3 top-2 z-10 font-mono text-xs text-muted-foreground">
          {phase === "sort" ? (
            <>
              <span className="text-muted-foreground">then find </span>
              <span className="font-semibold text-foreground">{target}</span>
            </>
          ) : (
            <>
              target = <span className="font-semibold text-foreground">{target}</span>
            </>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: CONNECTOR_H + PAD_B,
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

        <div
          className="absolute left-0 right-0 overflow-hidden"
          style={{
            bottom: PAD_B,
            height: CONNECTOR_H,
          }}
        >
          {showConnector && (
            <svg
              className="h-full w-full"
              viewBox={`0 0 ${vbW} ${CONNECTOR_H}`}
              preserveAspectRatio="none"
              aria-hidden
            >
              <line
                x1={cx(lo)}
                y1={10}
                x2={cx(hi)}
                y2={10}
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <line
                x1={cx(lo)}
                y1={10}
                x2={cx(lo)}
                y2={CONNECTOR_H - 4}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeLinecap="round"
              />
              <line
                x1={cx(hi)}
                y1={10}
                x2={cx(hi)}
                y2={CONNECTOR_H - 4}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeLinecap="round"
              />
              {typeof mid === "number" && mid >= lo && mid <= hi && (
                <line
                  x1={cx(mid)}
                  y1={10}
                  x2={cx(mid)}
                  y2={CONNECTOR_H - 4}
                  stroke="hsl(var(--accent))"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              )}
              <circle cx={cx(lo)} cy={10} r={4} fill="hsl(var(--primary))" />
              <circle cx={cx(hi)} cy={10} r={4} fill="hsl(var(--primary))" />
              {typeof mid === "number" && mid >= lo && mid <= hi && (
                <circle cx={cx(mid)} cy={10} r={5} fill="hsl(var(--accent))" />
              )}
            </svg>
          )}
          {showConnector && rangeLabelMarkers.length > 0 && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 px-1 text-[10px] font-mono leading-tight"
              style={{ minHeight: 18 }}
            >
              {rangeLabelMarkers.map(({ idx, text, hasMid }) => (
                <span
                  key={`${idx}-${text}`}
                  title={`Indices under search: ${text} → ${idx}`}
                  className={
                    hasMid
                      ? "absolute font-semibold text-foreground"
                      : "absolute text-foreground/80"
                  }
                  style={{
                    left: `${((idx + 0.5) / n) * 100}%`,
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {text}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
