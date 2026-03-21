'use client';

import { CodeCommentsToggle } from '@/components/controls/CodeCommentsToggle';
import { PlaybackTransport } from '@/components/controls/PlaybackTransport';
import { SoundControls } from '@/components/controls/SoundControls';
import { SpeedSelector } from '@/components/controls/SpeedSelector';
import { StepScrubber } from '@/components/controls/StepScrubber';
import type { ControlsProps } from '@/components/controls/types';

export type { CodeCommentsControl } from '@/components/controls/types';

export function Controls({
  isPlaying,
  isComplete,
  stepIndex,
  totalSteps,
  speed,
  soundEnabled = true,
  soundPreset = 'synth',
  onSoundChange,
  onSoundPresetChange,
  codeComments,
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
        <PlaybackTransport
          stepIndex={stepIndex}
          totalSteps={totalSteps}
          isPlaying={isPlaying}
          isComplete={isComplete}
          onStepBack={onStepBack}
          onPlay={onPlay}
          onPause={onPause}
          onStepForward={onStepForward}
          onReset={onReset}
        />

        {onSoundChange && (
          <SoundControls
            soundEnabled={soundEnabled}
            soundPreset={soundPreset}
            onSoundChange={onSoundChange}
            onSoundPresetChange={onSoundPresetChange}
          />
        )}

        {codeComments && <CodeCommentsToggle control={codeComments} />}

        <SpeedSelector speed={speed} onSpeedChange={onSpeedChange} />
      </div>

      <StepScrubber
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        onStepSelect={onStepSelect}
      />
    </div>
  );
}
