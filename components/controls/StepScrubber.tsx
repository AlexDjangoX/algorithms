import type { ChangeEvent } from 'react';

type StepScrubberProps = {
  stepIndex: number;
  totalSteps: number;
  onStepSelect?: (index: number) => void;
};

export function StepScrubber({
  stepIndex,
  totalSteps,
  onStepSelect,
}: StepScrubberProps) {
  if (totalSteps <= 0) return null;

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={totalSteps - 1}
        value={stepIndex}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onStepSelect?.(parseInt(e.target.value, 10))
        }
        className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary border border-border"
      />
      <span className="tabular-nums text-xs text-muted-foreground">
        {stepIndex + 1} / {totalSteps}
      </span>
    </div>
  );
}
