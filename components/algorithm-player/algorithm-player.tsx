"use client";

import { useEffect } from "react";
import { useAlgorithmPlayer } from "@/lib/use-algorithm-player";
import { BarViz } from "@/components/visualization/bar-viz";
import { CodeViewer } from "@/components/code-viewer/code-viewer";
import { Controls } from "@/components/controls/controls";
import type { LibrarySortData } from "@/algorithms/library-sort/algorithm";

interface AlgorithmPlayerProps {
  createGenerator: () => Generator<
    import("@/lib/types").AlgorithmStep<LibrarySortData>,
    void,
    unknown
  >;
  code: string;
  filename?: string;
}

export function AlgorithmPlayer({
  createGenerator,
  code,
  filename,
}: AlgorithmPlayerProps) {
  const {
    currentStep,
    stepIndex,
    totalSteps,
    isPlaying,
    isComplete,
    speed,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    setSpeed,
    goToStep,
  } = useAlgorithmPlayer<LibrarySortData>({
    createGenerator,
    onComplete: () => {},
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      switch (e.key) {
        case " ":
          e.preventDefault();
          isPlaying ? pause() : play();
          break;
        case "ArrowRight":
          e.preventDefault();
          stepForward();
          break;
        case "ArrowLeft":
          e.preventDefault();
          stepBack();
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, play, pause, stepForward, stepBack]);

  const vars = currentStep?.variables;

  return (
    <div className="flex flex-col gap-5">
      {/* Bar visualization */}
      <BarViz data={currentStep?.data ?? { array: [], input: [] }} />

      {/* Status + variables */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-zinc-900 px-4 py-3 ring-1 ring-white/5">
        <p className="flex-1 text-sm text-zinc-300 min-w-0">
          {currentStep?.description ?? "Click ▶ Play or Step → to start"}
        </p>
        {vars && Object.keys(vars).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(vars).map(([key, value]) => (
              <span
                key={key}
                className="flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-1"
              >
                <span className="font-mono text-xs text-zinc-500">{key}</span>
                <span className="font-mono text-xs font-semibold text-rose-400">
                  {String(value)}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Code viewer */}
      <CodeViewer
        code={code}
        highlightRange={currentStep?.codeRange}
        filename={filename}
      />

      {/* Controls */}
      <Controls
        isPlaying={isPlaying}
        isComplete={isComplete}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        speed={speed}
        onPlay={play}
        onPause={pause}
        onStepForward={stepForward}
        onStepBack={stepBack}
        onReset={reset}
        onSpeedChange={setSpeed}
        onStepSelect={goToStep}
      />
    </div>
  );
}
