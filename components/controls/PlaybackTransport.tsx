import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

type PlaybackTransportProps = {
  stepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  isComplete: boolean;
  onStepBack: () => void;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onReset: () => void;
};

export function PlaybackTransport({
  stepIndex,
  totalSteps,
  isPlaying,
  isComplete,
  onStepBack,
  onPlay,
  onPause,
  onStepForward,
  onReset,
}: PlaybackTransportProps) {
  return (
    <>
      <button
        onClick={onStepBack}
        disabled={stepIndex <= 0}
        className="
            flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg
            bg-secondary text-foreground border border-border
            transition-all duration-150
            hover:bg-secondary/80 hover:scale-110 hover:shadow-lg
            active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
          "
        title="Previous step (←)"
        type="button"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>

      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={isComplete && stepIndex >= totalSteps - 1 && totalSteps > 0}
        className="
            flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl
            bg-primary text-primary-foreground
            shadow-md shadow-primary/25
            transition-all duration-150
            hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-primary/30
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md
          "
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        type="button"
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" aria-hidden />
        ) : (
          <Play className="ml-0.5 h-4 w-4" aria-hidden />
        )}
      </button>

      <button
        onClick={onStepForward}
        disabled={stepIndex >= totalSteps - 1}
        className="
            flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg
            bg-secondary text-foreground border border-border
            transition-all duration-150
            hover:bg-secondary/80 hover:scale-110 hover:shadow-lg
            active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
          "
        title="Next step (→)"
        type="button"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>

      <button
        onClick={onReset}
        className="
            cursor-pointer rounded-lg bg-secondary border border-border px-4 py-2
            text-sm font-medium text-foreground
            transition-all duration-150
            hover:bg-secondary/80 hover:scale-105 hover:shadow-lg
            active:scale-95
          "
        title="Reset"
        type="button"
      >
        Reset
      </button>
    </>
  );
}
