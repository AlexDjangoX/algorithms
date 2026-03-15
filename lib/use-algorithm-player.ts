"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AlgorithmStep } from "./types";

const DEFAULT_SPEED = 1;
const STEP_DURATION_MS = 800;

export interface UseAlgorithmPlayerOptions<TData> {
  createGenerator: () => Generator<AlgorithmStep<TData>, void, unknown>;
  onStep?: (step: AlgorithmStep<TData>, index: number) => void;
  onComplete?: () => void;
}

export interface UseAlgorithmPlayerReturn<TData> {
  currentStep: AlgorithmStep<TData> | null;
  stepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  isComplete: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBack: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  goToStep: (index: number) => void;
}

export function useAlgorithmPlayer<TData>({
  createGenerator,
  onStep,
  onComplete,
}: UseAlgorithmPlayerOptions<TData>): UseAlgorithmPlayerReturn<TData> {
  const [currentStep, setCurrentStep] = useState<AlgorithmStep<TData> | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(DEFAULT_SPEED);

  const stepsRef = useRef<AlgorithmStep<TData>[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);

  const collectSteps = useCallback(() => {
    const gen = createGenerator();
    const steps: AlgorithmStep<TData>[] = [];
    let result = gen.next();
    while (!result.done) {
      steps.push(result.value);
      result = gen.next();
    }
    return steps;
  }, [createGenerator]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    const steps = collectSteps();
    stepsRef.current = steps;
    setTotalSteps(steps.length);
    if (steps.length > 0) {
      setCurrentStep(steps[0]);
      setStepIndex(0);
      onStep?.(steps[0], 0);
    } else {
      setCurrentStep(null);
      setStepIndex(0);
    }
  }, [collectSteps, onStep]);

  // Initialize on mount so bars are visible immediately
  useEffect(() => {
    reset();
  }, [createGenerator]); // eslint-disable-line react-hooks/exhaustive-deps

  const stepForward = useCallback(() => {
    const steps = stepsRef.current;
    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      onComplete?.();
      return;
    }
    const nextIndex = stepIndex + 1;
    setStepIndex(nextIndex);
    const next = steps[nextIndex];
    setCurrentStep(next);
    onStep?.(next, nextIndex);
  }, [stepIndex, onStep, onComplete]);

  const stepBack = useCallback(() => {
    if (stepIndex <= 0) return;
    const prevIndex = stepIndex - 1;
    setStepIndex(prevIndex);
    const prev = stepsRef.current[prevIndex];
    setCurrentStep(prev);
    onStep?.(prev, prevIndex);
  }, [stepIndex, onStep]);

  const goToStep = useCallback(
    (index: number) => {
      const steps = stepsRef.current;
      if (steps.length === 0 || index < 0 || index >= steps.length) return;
      setStepIndex(index);
      setCurrentStep(steps[index]);
      onStep?.(steps[index], index);
    },
    [onStep]
  );

  const play = useCallback(() => {
    if (stepsRef.current.length === 0) return;
    if (stepIndex >= stepsRef.current.length - 1) {
      reset();
      setTimeout(() => {
        isPlayingRef.current = true;
        setIsPlaying(true);
      }, 0);
      return;
    }
    isPlayingRef.current = true;
    setIsPlaying(true);
  }, [stepIndex, reset]);

  const pause = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const setSpeed = useCallback((s: number) => setSpeedState(s), []);

  useEffect(() => {
    if (!isPlaying || !isPlayingRef.current) return;

    const steps = stepsRef.current;
    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      onComplete?.();
      return;
    }

    const ms = ((steps[stepIndex]?.duration ?? 1) * STEP_DURATION_MS) / speed;
    timeoutRef.current = setTimeout(stepForward, ms);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, stepIndex, speed, stepForward, onComplete]);

  return {
    currentStep,
    stepIndex,
    totalSteps,
    isPlaying,
    isComplete: totalSteps > 0 && stepIndex >= totalSteps - 1,
    speed,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    setSpeed,
    goToStep,
  };
}
