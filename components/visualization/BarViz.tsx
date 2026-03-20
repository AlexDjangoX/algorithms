"use client";

import { gsap } from "gsap";
import { useEffect, useMemo, useRef } from "react";
import type { LibrarySortData } from "@/algorithms/library-sort/algorithm";

// Slightly taller so bottom of viz + status lines up with progress bar
const BAR_H = 384;
const PAD_B = 24;

function barColor(value: number, max: number) {
  const t = value / max;
  return `hsl(${220 + t * 120}, ${68 + t * 22}%, ${52 + t * 12}%)`;
}

/**
 * Computes a unique slot (0..n-1) for every bar so no two bars ever share
 * the same horizontal position.
 *
 * Rules:
 *   - Placed bars  → their final sorted rank (permanent, never changes)
 *   - Unplaced bars → distributed across the remaining free slots,
 *                     in original input order
 *
 * This guarantees: each of the n slots is occupied by exactly one bar.
 */
function computeSlots(
  input: number[],
  placed: Set<number>,
  finalRankOf: Map<number, number>
): Map<number, number> {
  const n = input.length;

  // Which slots are claimed by placed bars?
  const occupied = new Set<number>();
  placed.forEach((v) => occupied.add(finalRankOf.get(v)!));

  // Collect free slots in ascending order
  const free: number[] = [];
  for (let i = 0; i < n; i++) {
    if (!occupied.has(i)) free.push(i);
  }

  const slots = new Map<number, number>();
  let freeIdx = 0;

  input.forEach((val) => {
    if (placed.has(val)) {
      slots.set(val, finalRankOf.get(val)!);
    } else {
      slots.set(val, free[freeIdx++]);
    }
  });

  return slots;
}

export function BarViz({ data }: { data: LibrarySortData }) {
  const { array, input, insertingValue } = data;

  const containerRef = useRef<HTMLDivElement>(null);
  const barEls = useRef<Map<number, HTMLDivElement>>(new Map());
  const initializedRef = useRef(false);

  const n = input.length;
  const maxVal = useMemo(() => (n > 0 ? Math.max(...input) : 1), [input, n]);

  // Each value's final sorted rank — stable across the whole sort
  const finalRankOf = useMemo(() => {
    const sorted = [...input].sort((a, b) => a - b);
    return new Map(sorted.map((v, i) => [v, i]));
  }, [input]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || n === 0) return;
    const W = container.offsetWidth;
    if (W === 0) return;

    const barW = W / n;

    // Values currently placed in S
    const placed = new Set<number>();
    array.forEach((v) => { if (v !== null) placed.add(v); });

    // One unique slot per bar — no two bars ever share the same position
    const slotOf = computeSlots(input, placed, finalRankOf);

    const isFirst = !initializedRef.current;
    initializedRef.current = true;

    input.forEach((val, inputIdx) => {
      const el = barEls.current.get(val);
      if (!el) return;

      const isPlaced = placed.has(val);
      const isActive = val === insertingValue;

      const slot = slotOf.get(val)!;
      const targetX = slot * barW;
      const h = Math.max((val / maxVal) * BAR_H, 6);

      if (isFirst) {
        gsap.set(el, { x: targetX, height: h, zIndex: 1 });
        gsap.fromTo(
          el,
          { scaleY: 0 },
          {
            scaleY: 1,
            duration: 0.5,
            delay: inputIdx * 0.04,
            ease: "back.out(1.2)",
            transformOrigin: "50% 100%",
          }
        );
      } else {
        gsap.to(el, {
          x: targetX,
          height: h,
          backgroundColor: isActive
            ? "#f43f5e"
            : barColor(val, maxVal),
          boxShadow: isActive ? "0 0 22px rgba(244,63,94,0.7)" : "none",
          // Unplaced bars dim once the sort has started
          opacity: isPlaced || placed.size === 0 ? 1 : 0.45,
          zIndex: isPlaced ? 2 : 1,
          duration: 0.35,
          ease: "power2.out",
        });
      }
    });
  }, [array, insertingValue, input, n, maxVal, finalRankOf]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl border border-border bg-secondary/80"
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
          {input.map((val, idx) => (
            <div
              key={`${val}-${idx}`}
              ref={(el) => {
                if (el) barEls.current.set(val, el);
              }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: `${100 / n}%`,
                height: Math.max((val / maxVal) * BAR_H, 6),
                backgroundColor: barColor(val, maxVal),
                borderRadius: "3px 3px 0 0",
                willChange: "transform",
              }}
            />
          ))}
        </div>
    </div>
  );
}
