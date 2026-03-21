'use client';

import { useEffect, useRef, useState } from 'react';
import {
  useAlgorithmPlayer,
  STEP_DURATION_MS,
} from '@/app/lib/use-algorithm-player';
import {
  playStep,
  resumeAudioContext,
  getStoredSoundPreset,
  setStoredSoundPreset,
  type SoundPreset,
} from '@/app/lib/algorithm-sound';
import { BarViz } from '@/components/visualization/BarViz';
import { AlgorithmInputPreview } from '@/components/algorithm-player/AlgorithmInputPreview';
import { StepStatusPanel } from '@/components/algorithm-player/StepStatusPanel';
import { CodeViewer } from '@/components/code-viewer/CodeViewer';
import { Controls } from '@/components/controls/Controls';
import type { LibrarySortData } from '@/algorithms/library-sort/algorithm';
import type { AlgorithmStep } from '@/app/lib/types';

interface AlgorithmPlayerProps<TData = LibrarySortData> {
  createGenerator: () => Generator<AlgorithmStep<TData>, void, unknown>;
  code: string;
  filename?: string;
  /** On large screens: code + controls left, children + viz + status right. Default 'column' keeps single column. */
  layout?: 'column' | 'split';
  children?: React.ReactNode;
  /** Custom visualization; when provided, defaultVizData is used for empty state. */
  Visualization?: React.ComponentType<{ data: TData }>;
  defaultVizData?: TData;
  /** Shown under page heading / complexity; omit to use default copy. */
  inputPreviewHeading?: string;
}

const DEFAULT_LIBRARY_SORT_DATA: LibrarySortData = {
  array: [],
  input: [],
};

const CODE_COMMENTS_STORAGE_KEY = 'algoviz-show-code-comments';

function getStoredShowCodeComments(): boolean {
  if (typeof window === 'undefined') return true;
  const v = localStorage.getItem(CODE_COMMENTS_STORAGE_KEY);
  if (v === '0') return false;
  if (v === '1') return true;
  return true;
}

export function AlgorithmPlayer<TData = LibrarySortData>({
  createGenerator,
  code,
  filename,
  layout = 'column',
  children,
  Visualization,
  defaultVizData,
  inputPreviewHeading,
}: AlgorithmPlayerProps<TData>) {
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
  } = useAlgorithmPlayer<TData>({
    createGenerator,
    onComplete: () => {},
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundPreset, setSoundPreset] = useState<SoundPreset>('synth');
  const [showCodeComments, setShowCodeComments] = useState(true);

  // Keep refs in sync so the sound effect always reads the latest values without
  // being listed as deps (which would re-trigger sound on every preset/toggle change).
  const soundEnabledRef = useRef(soundEnabled);
  const soundPresetRef = useRef(soundPreset);
  const speedRef = useRef(speed);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  useEffect(() => {
    soundPresetRef.current = soundPreset;
  }, [soundPreset]);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const stored = getStoredSoundPreset();
    if (stored !== 'synth') {
      queueMicrotask(() => setSoundPreset(stored));
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => setShowCodeComments(getStoredShowCodeComments()));
  }, []);

  const handleSoundPresetChange = (preset: SoundPreset) => {
    setSoundPreset(preset);
    setStoredSoundPreset(preset);
  };

  // Only fire when the step actually advances — not when preset or enabled changes.
  // stepIntervalSec scales note duration proportionally so pitch fills the step.
  useEffect(() => {
    if (!soundEnabledRef.current || !currentStep) return;
    const stepIntervalSec = STEP_DURATION_MS / (speedRef.current * 1000);
    playStep(currentStep, soundPresetRef.current, stepIntervalSec);
  }, [currentStep]); // intentionally excludes soundEnabled/soundPreset/speed — using refs

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          resumeAudioContext();
          if (isPlaying) pause();
          else play();
          break;
        case 'ArrowRight':
          e.preventDefault();
          resumeAudioContext();
          stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          resumeAudioContext();
          stepBack();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, play, pause, stepForward, stepBack]);

  const vars = currentStep?.variables;
  const vizData = Visualization
    ? (currentStep?.data ?? defaultVizData)
    : (currentStep?.data ?? DEFAULT_LIBRARY_SORT_DATA);
  const barViz = Visualization ? (
    <Visualization data={vizData as TData} />
  ) : (
    <BarViz data={vizData as LibrarySortData} />
  );
  const statusBlock = (
    <StepStatusPanel
      description={
        currentStep?.description ?? 'Click ▶ Play or Step → to start'
      }
      variables={vars ?? undefined}
    />
  );
  const codeViewer = (
    <CodeViewer
      code={code}
      highlightRange={currentStep?.codeRange}
      filename={filename}
      showComments={showCodeComments}
    />
  );
  const controls = (
    <Controls
      isPlaying={isPlaying}
      isComplete={isComplete}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      speed={speed}
      soundEnabled={soundEnabled}
      soundPreset={soundPreset}
      onSoundChange={setSoundEnabled}
      onSoundPresetChange={handleSoundPresetChange}
      onPlay={() => {
        resumeAudioContext();
        play();
      }}
      onPause={pause}
      onStepForward={() => {
        resumeAudioContext();
        stepForward();
      }}
      onStepBack={() => {
        resumeAudioContext();
        stepBack();
      }}
      onReset={reset}
      onSpeedChange={setSpeed}
      onStepSelect={(index: number) => {
        resumeAudioContext();
        goToStep(index);
      }}
      codeComments={{
        show: showCodeComments,
        onChange: (show) => {
          setShowCodeComments(show);
          if (typeof window !== 'undefined') {
            localStorage.setItem(CODE_COMMENTS_STORAGE_KEY, show ? '1' : '0');
          }
        },
      }}
    />
  );

  if (layout === 'split') {
    return (
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* Full-width heading above the columns on all screens; on lg this is the page heading */}
        {children}
        <AlgorithmInputPreview
          vizData={vizData}
          heading={inputPreviewHeading}
        />
        {/*
          Mobile: graph → controls → status → code (controls sit directly under the viz).
          lg: left column = code + controls; right column = viz | status (status only in right column on lg).
        */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:grid-rows-[auto_minmax(0,1fr)] lg:gap-8 lg:items-stretch">
          <div className="order-4 flex min-h-0 flex-col gap-5 lg:order-0 lg:col-start-1 lg:row-start-1 lg:min-h-80">
            {codeViewer}
          </div>
          <div className="order-2 lg:order-0 lg:col-start-1 lg:row-start-2">
            {controls}
          </div>
          <div className="order-1 flex min-h-0 flex-col gap-5 lg:order-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:min-h-112 lg:flex-row lg:items-stretch lg:gap-6">
            <div className="min-h-0 min-w-0 flex-1">{barViz}</div>
            <aside className="hidden min-h-0 w-full shrink-0 flex-col lg:flex lg:h-full lg:w-[min(19rem,36%)] lg:max-w-sm">
              {statusBlock}
            </aside>
          </div>
          <aside className="order-3 flex min-h-0 w-full shrink-0 flex-col lg:hidden">
            {statusBlock}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {barViz}
      {controls}
      {statusBlock}
      {codeViewer}
    </div>
  );
}
