"use client";

import { useCallback } from "react";
import Link from "next/link";
import { AlgorithmPlayer } from "@/components/algorithm-player/algorithm-player";
import { librarySortGenerator } from "@/algorithms/library-sort/algorithm";
import { LIBRARY_SORT_CODE } from "@/algorithms/library-sort/code";

export default function LibrarySortPage() {
  const createGenerator = useCallback(() => librarySortGenerator(), []);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Minimal back nav */}
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="cursor-pointer text-sm text-zinc-600 transition-all duration-150 hover:text-zinc-300 hover:scale-105 active:scale-95"
        >
          ← AlgoViz
        </Link>
        <span className="text-xs text-zinc-700">
          Space: Play/Pause · ← →: Step
        </span>
      </div>

      <main className="mx-auto max-w-2xl px-6 pb-16">
        {/* Title + description + complexity */}
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Library Sort
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg leading-relaxed text-zinc-400">
            Leaves empty spaces (gaps) in the array, significantly speeding
            up insertions — like a librarian leaving space on shelves for
            new books.
          </p>

          {/* Single complexity bar, matching the reference image */}
          <div
            className="mx-auto mt-6 flex items-center justify-center gap-10 rounded-xl px-8 py-4 font-mono text-base ring-1 ring-white/10"
            style={{ background: "#161b22", maxWidth: 480 }}
          >
            <span>
              <span style={{ color: "#38bdf8" }}>Time: </span>
              <span className="text-white">O(n ∗ log(n))</span>
            </span>
            <span>
              <span style={{ color: "#38bdf8" }}>Space: </span>
              <span className="text-white">O(n)</span>
            </span>
          </div>
        </div>

        {/* Player */}
        <AlgorithmPlayer
          createGenerator={createGenerator}
          code={LIBRARY_SORT_CODE}
          filename="librarySort.ts"
        />
      </main>
    </div>
  );
}
