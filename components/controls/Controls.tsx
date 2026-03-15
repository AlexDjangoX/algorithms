'use client';

import type { ChangeEvent } from 'react';
import type { SoundPreset } from '@/app/lib/algorithm-sound';
import { SOUND_PRESET_LABELS, SOUND_PRESETS } from '@/app/lib/algorithm-sound';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ControlsProps {
  isPlaying: boolean;
  isComplete: boolean;
  stepIndex: number;
  totalSteps: number;
  speed: number;
  soundEnabled?: boolean;
  soundPreset?: SoundPreset;
  onSoundChange?: (enabled: boolean) => void;
  onSoundPresetChange?: (preset: SoundPreset) => void;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onStepSelect?: (index: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 3, 5, 10];

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
            bg-secondary text-foreground border border-border
            transition-all duration-150
            hover:bg-secondary/80 hover:scale-110 hover:shadow-lg
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
            flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl
            bg-primary text-primary-foreground
            shadow-md shadow-primary/25
            transition-all duration-150
            hover:opacity-90 hover:scale-105 hover:shadow-lg hover:shadow-primary/30
            active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-md
          "
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM14.25 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
            </svg>
          ) : (
            <svg
              className="ml-0.5 h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
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
            bg-secondary text-foreground border border-border
            transition-all duration-150
            hover:bg-secondary/80 hover:scale-110 hover:shadow-lg
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
            cursor-pointer rounded-lg bg-secondary border border-border px-4 py-2
            text-sm font-medium text-foreground
            transition-all duration-150
            hover:bg-secondary/80 hover:scale-105 hover:shadow-lg
            active:scale-95
          "
          title="Reset"
        >
          Reset
        </button>

        {/* Sound */}
        {onSoundChange && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSoundChange(!soundEnabled)}
              className={`
                flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium
                transition-all duration-150 hover:scale-105 active:scale-95
                ${
                  soundEnabled
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border bg-secondary text-muted-foreground hover:bg-secondary/80'
                }
              `}
              title={soundEnabled ? 'Sound on' : 'Sound off'}
            >
              {soundEnabled ? (
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.92 12H2a1 1 0 01-1-1V9a1 1 0 011-1h2.92l3.463-3.924a1 1 0 011-.zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" />
                  <path d="M11.89 6.087a1 1 0 011.415 0 5 5 0 010 7.07 1 1 0 01-1.415-1.415 3 3 0 000-4.24 1 1 0 010-1.415z" />
                </svg>
              ) : (
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776L4.92 12H2a1 1 0 01-1-1V9a1 1 0 011-1h2.92l3.463-3.924a1 1 0 011-.zM16.707 4.293a1 1 0 010 1.414L15.414 7l1.293 1.293a1 1 0 01-1.414 1.414L14 8.414l-1.293 1.293a1 1 0 01-1.414-1.414L12.586 7l-1.293-1.293a1 1 0 011.414-1.414L14 5.586l1.293-1.293a1 1 0 011.414 0z" />
                </svg>
              )}
              <span>{soundEnabled ? 'Sound' : 'Mute'}</span>
            </button>
            {/* Synthesizer preset dropdown — only when sound on */}
            {soundEnabled && onSoundPresetChange && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  title="Synthesizer sound"
                >
                  {SOUND_PRESET_LABELS[soundPreset]}
                  <svg
                    className="h-3.5 w-3.5 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuRadioGroup
                    value={soundPreset}
                    onValueChange={(value) =>
                      onSoundPresetChange(value as SoundPreset)
                    }
                  >
                    {SOUND_PRESETS.map((p) => (
                      <DropdownMenuRadioItem key={p} value={p}>
                        {SOUND_PRESET_LABELS[p]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {/* Speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Speed</span>
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
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/30'
                      : 'bg-secondary text-muted-foreground border border-border hover:bg-secondary/80 hover:text-foreground'
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
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              onStepSelect?.(parseInt(e.target.value, 10))
            }
            className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-secondary accent-primary border border-border"
          />
          <span className="tabular-nums text-xs text-muted-foreground">
            {stepIndex + 1} / {totalSteps}
          </span>
        </div>
      )}
    </div>
  );
}
