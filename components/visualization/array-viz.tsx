"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import type { LibrarySortData } from "@/algorithms/library-sort/algorithm";

interface ArrayVizProps {
  data: LibrarySortData;
}

function ArrayCell({
  value,
  index,
  isActive,
  cellRef,
}: {
  value: number | null;
  index: number;
  isActive: boolean;
  cellRef: (el: HTMLDivElement | null) => void;
}) {
  const isGap = value === null;

  return (
    <div
      ref={cellRef}
      data-index={index}
      className={`
        flex h-12 w-12 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-semibold
        transition-shadow duration-200
        ${
          isGap
            ? "border-2 border-dashed border-zinc-600 bg-zinc-800"
            : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-zinc-950 shadow-lg shadow-emerald-500/25"
        }
        ${isActive ? "scale-110 shadow-[0_0_24px_rgba(52,211,153,0.5)]" : ""}
      `}
    >
      {!isGap ? value : ""}
    </div>
  );
}

export function ArrayViz({ data }: ArrayVizProps) {
  const { array, activeIndex } = data;
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevActiveRef = useRef<number>(-1);

  useEffect(() => {
    const activeIdx = activeIndex ?? -1;
    cellRefs.current.forEach((el, i) => {
      if (!el) return;
      const isActive = i === activeIdx;
      if (isActive && prevActiveRef.current !== i) {
        gsap.to(el, {
          scale: 1.12,
          boxShadow: "0 0 24px rgba(52, 211, 153, 0.5)",
          duration: 0.25,
          ease: "power2.out",
        });
      } else if (!isActive) {
        gsap.to(el, {
          scale: 1,
          boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
          duration: 0.2,
        });
      }
    });
    prevActiveRef.current = activeIdx;
  }, [activeIndex, array]);

  return (
    <div className="rounded-xl bg-zinc-900/80 p-6 shadow-xl ring-1 ring-white/5">
      <div className="flex flex-wrap justify-center gap-2" style={{ minHeight: 96 }}>
        {array.map((value, index) => (
          <ArrayCell
            key={`${index}-${value === null ? "gap" : value}`}
            value={value}
            index={index}
            isActive={index === (activeIndex ?? -1)}
            cellRef={(el) => {
              cellRefs.current[index] = el;
            }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-zinc-500">
        <span className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-md bg-emerald-500" />
          Value
        </span>
        <span className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-md border-2 border-dashed border-zinc-600 bg-zinc-800" />
          Gap
        </span>
      </div>
    </div>
  );
}
