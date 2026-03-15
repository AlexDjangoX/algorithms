/**
 * Web Audio synth for algorithm steps. Supports multiple presets (synth, organ, piano, guitar).
 * Every sound is tied to actual data; preset controls timbre only.
 */

import type { AlgorithmStep } from '@/app/lib/types';

export type SoundPreset = 'synth' | 'organ' | 'piano' | 'guitar';

export const SOUND_PRESET_LABELS: Record<SoundPreset, string> = {
  synth: 'Synth',
  organ: 'Organ',
  piano: 'Piano',
  guitar: 'Guitar',
};

export const SOUND_PRESETS: SoundPreset[] = [
  'synth',
  'organ',
  'piano',
  'guitar',
];

const STORAGE_KEY = 'algoviz-sound-preset';

export function getStoredSoundPreset(): SoundPreset {
  if (typeof window === 'undefined') return 'synth';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SOUND_PRESETS.includes(stored as SoundPreset)) {
    return stored as SoundPreset;
  }
  return 'synth';
}

export function setStoredSoundPreset(preset: SoundPreset): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, preset);
}

const PENTATONIC = [261.63, 293.66, 329.63, 392, 440];
const OCTAVE_RATIO = 2;

function valueToFreq(value: number): number {
  const v = Math.max(0, Math.min(15, Math.round(value)));
  const index = v % PENTATONIC.length;
  const octave = Math.floor(v / PENTATONIC.length);
  return PENTATONIC[index]! * Math.pow(OCTAVE_RATIO, octave);
}

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export function resumeAudioContext(): void {
  const ctx = getContext();
  if (ctx?.state === 'suspended') {
    ctx.resume();
  }
}

/** Preset-specific: oscillator type, duration scale, envelope (attack, decay). */
function presetParams(
  preset: SoundPreset,
  durationSec: number,
): {
  type: OscillatorType;
  duration: number;
  attack: number;
  decay: number;
  secondOsc?: { freqRatio: number; volume: number };
} {
  switch (preset) {
    case 'organ':
      return {
        type: 'sine',
        duration: durationSec * 1.4,
        attack: 0.02,
        decay: 0.25,
        secondOsc: { freqRatio: 1.5, volume: 0.05 },
      };
    case 'piano':
      return {
        type: 'sine',
        duration: durationSec * 1.2,
        attack: 0.002,
        decay: 0.2,
      };
    case 'guitar':
      return {
        type: 'triangle',
        duration: durationSec * 0.9,
        attack: 0.001,
        decay: 0.12,
      };
    default:
      return {
        type: 'sine',
        duration: durationSec,
        attack: 0.01,
        decay: durationSec,
      };
  }
}

function playTone(
  freq: number,
  durationSec: number,
  preset: SoundPreset,
  typeOverride?: OscillatorType,
  volume = 0.15,
  delaySec = 0,
): void {
  const ctx = getContext();
  if (!ctx) return;

  const params = presetParams(preset, durationSec);
  const when = ctx.currentTime + delaySec;
  const oscType = typeOverride ?? params.type;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = oscType;
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(volume, when + params.attack);
  gain.gain.exponentialRampToValueAtTime(0.001, when + params.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(when);
  osc.stop(when + params.duration);

  if (params.secondOsc && preset === 'organ') {
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * params.secondOsc.freqRatio, when);
    gain2.gain.setValueAtTime(0, when);
    gain2.gain.linearRampToValueAtTime(
      volume * params.secondOsc.volume,
      when + params.attack,
    );
    gain2.gain.exponentialRampToValueAtTime(0.001, when + params.duration);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(when);
    osc2.stop(when + params.duration);
  }
}

function playArpeggio(
  values: number[],
  noteDuration: number,
  gapBetween: number,
  preset: SoundPreset,
  volume = 0.12,
): void {
  const ctx = getContext();
  if (!ctx || values.length === 0) return;

  values.forEach((val, i) => {
    const delay = i * (noteDuration + gapBetween);
    playTone(valueToFreq(val), noteDuration, preset, undefined, volume, delay);
  });
}

export function playStep(
  step: AlgorithmStep<unknown> | null,
  preset: SoundPreset = 'synth',
): void {
  if (!step) return;

  const ctx = getContext();
  if (!ctx || ctx.state === 'suspended') return;

  const data = step.data as
    | { array?: number[]; highlightIndices?: number[] }
    | undefined;
  const arr = data?.array ?? [];
  const indices = data?.highlightIndices ?? [];
  const vars = step.variables ?? {};
  const duration = 0.1;

  if (step.id === 'init' && arr.length > 0) {
    playArpeggio(arr, 0.055, 0.02, preset);
    return;
  }
  if (step.id === 'init') {
    playTone(valueToFreq(1), duration * 1.2, preset, undefined, 0.12);
    return;
  }

  if (step.id === 'done' && arr.length > 0) {
    playArpeggio(arr, 0.07, 0.025, preset, 0.14);
    return;
  }
  if (step.id === 'done') {
    playTone(valueToFreq(8), duration * 2, preset, undefined, 0.12);
    playTone(valueToFreq(12), duration * 1.5, preset, undefined, 0.08, 0.08);
    return;
  }

  const leftVal = vars['left'];
  const rightVal = vars['right'];
  if (
    step.id === 'compare' &&
    typeof leftVal === 'number' &&
    typeof rightVal === 'number'
  ) {
    playTone(valueToFreq(leftVal), duration, preset, undefined, 0.12);
    playTone(
      valueToFreq(rightVal),
      duration * 0.7,
      preset,
      preset === 'synth' ? 'triangle' : undefined,
      0.1,
      0.04,
    );
    return;
  }

  if (indices.length >= 2 && arr.length > 0) {
    const a = arr[indices[0]!];
    const b = arr[indices[1]!];
    if (typeof a === 'number' && typeof b === 'number') {
      playTone(valueToFreq(a), duration, preset, undefined, 0.12);
      playTone(
        valueToFreq(b),
        duration * 0.7,
        preset,
        preset === 'synth' ? 'triangle' : undefined,
        0.1,
        0.04,
      );
      return;
    }
  }

  if (step.id === 'swap' && indices.length >= 2 && arr.length > 0) {
    const a = arr[indices[0]!];
    const b = arr[indices[1]!];
    if (typeof a === 'number' && typeof b === 'number') {
      playTone(valueToFreq(a), duration * 0.9, preset, 'triangle', 0.13);
      playTone(valueToFreq(b), duration * 0.9, preset, 'triangle', 0.11, 0.05);
      return;
    }
  }

  const k = vars['k'];
  if (step.id === 'merge_place' && typeof k === 'number' && arr.length > 0) {
    const idx = k - 1;
    if (idx >= 0 && typeof arr[idx] === 'number') {
      playTone(
        valueToFreq(arr[idx] as number),
        duration,
        preset,
        undefined,
        0.14,
      );
      return;
    }
  }

  if (indices.length >= 1 && arr.length > 0) {
    const v = arr[indices[0]!];
    if (typeof v === 'number') {
      playTone(valueToFreq(v), duration, preset, undefined, 0.12);
      return;
    }
  }

  if (arr.length > 0 && typeof arr[0] === 'number') {
    playTone(valueToFreq(arr[0]), duration, preset, undefined, 0.08);
    return;
  }

  if (['pass_start', 'merge_done', 'outer'].includes(step.id)) {
    return;
  }

  playTone(valueToFreq(5), duration, preset, undefined, 0.06);
}
