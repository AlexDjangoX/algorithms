"use client";

interface ControlsProps {
  isPlaying: boolean;
  isComplete: boolean;
  stepIndex: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onStepSelect?: (index: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 3];

export function Controls({
  isPlaying,
  isComplete,
  stepIndex,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
  onStepSelect,
}: ControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">

        {/* Step back */}
        <button
          onClick={onStepBack}
          disabled={stepIndex <= 0}
          className="
            flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg
            bg-zinc-800 text-zinc-200
            transition-all duration-150
            hover:bg-zinc-700 hover:scale-110 hover:shadow-lg
            active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
          "
          title="Previous step (←)"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
          </svg>
        </button>

        {/* Play / Pause */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={isComplete && stepIndex >= totalSteps - 1 && totalSteps > 0}
          className="
            flex h-14 w-14 cursor-pointer items-center justify-center rounded-2xl
            bg-rose-500 text-white
            shadow-lg shadow-rose-500/30
            transition-all duration-150
            hover:bg-rose-400 hover:scale-110 hover:shadow-xl hover:shadow-rose-500/40
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg
          "
          title={isPlaying ? "Pause (Space)" : "Play (Space)"}
        >
          {isPlaying ? (
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM14.25 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          )}
        </button>

        {/* Step forward */}
        <button
          onClick={onStepForward}
          disabled={stepIndex >= totalSteps - 1}
          className="
            flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg
            bg-zinc-800 text-zinc-200
            transition-all duration-150
            hover:bg-zinc-700 hover:scale-110 hover:shadow-lg
            active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
          "
          title="Next step (→)"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
          </svg>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="
            cursor-pointer rounded-lg bg-zinc-800 px-4 py-2
            text-sm font-medium text-zinc-200
            transition-all duration-150
            hover:bg-zinc-700 hover:scale-105 hover:shadow-lg
            active:scale-95
          "
          title="Reset"
        >
          Reset
        </button>

        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Speed</span>
          <div className="flex gap-1">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`
                  cursor-pointer rounded px-2 py-1 text-xs font-medium
                  transition-all duration-150
                  hover:scale-110 active:scale-95
                  ${
                    speed === s
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/30"
                      : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-200"
                  }
                `}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrubber */}
      {totalSteps > 0 && (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={stepIndex}
            onChange={(e) => onStepSelect?.(parseInt(e.target.value, 10))}
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-rose-500"
          />
          <span className="tabular-nums text-xs text-zinc-500">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>
      )}
    </div>
  );
}
