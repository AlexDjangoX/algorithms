import type { SoundPreset } from '@/app/lib/algorithm-sound';

export type CodeCommentsControl = {
  show: boolean;
  onChange: (show: boolean) => void;
};

export type ControlsProps = {
  isPlaying: boolean;
  isComplete: boolean;
  stepIndex: number;
  totalSteps: number;
  speed: number;
  soundEnabled?: boolean;
  soundPreset?: SoundPreset;
  onSoundChange?: (enabled: boolean) => void;
  onSoundPresetChange?: (preset: SoundPreset) => void;
  /** Code viewer: comments toggle (omit to hide the control). */
  codeComments?: CodeCommentsControl;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onStepSelect?: (index: number) => void;
};
