/**
 * Tone.js–based synth for algorithm steps.
 *
 * Preset instruments:
 *   Synth       → PolySynth(AMSynth)            — AM synthesis, rich triangle-wave timbre
 *   Organ       → PolySynth(FMSynth) + Reverb   — FM synthesis, pipe-organ character
 *   Piano       → Sampler (Salamander Grand)    — real piano WAV samples via CDN + Reverb
 *   Guitar      → PluckSynth                    — Karplus-Strong string synthesis
 *   Vibraphone  → MetalSynth                    — inharmonic FM + highpass; bell/vibe tones
 *   Strings     → DuoSynth + Chorus + Reverb    — two detuned voices with vibrato
 *
 * All presets share the same pentatonic pitch mapping and step → note logic.
 * The public API is identical to the previous Web Audio implementation.
 *
 * SSR safety: Tone.js is loaded via dynamic import inside a `typeof window`
 * guard so Next.js server rendering never attempts to instantiate Web Audio.
 */

import type { AlgorithmStep } from '@/app/lib/types';

// ── Types & constants ─────────────────────────────────────────────────────────

export type SoundPreset = 'synth' | 'organ' | 'piano' | 'guitar' | 'vibraphone' | 'strings';

export const SOUND_PRESET_LABELS: Record<SoundPreset, string> = {
  synth: 'Synth',
  organ: 'Organ',
  piano: 'Piano',
  guitar: 'Guitar',
  vibraphone: 'Vibraphone',
  strings: 'Strings',
};

export const SOUND_PRESETS: SoundPreset[] = ['synth', 'organ', 'piano', 'guitar', 'vibraphone', 'strings'];

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

// ── Tone.js dynamic import (browser-only) ────────────────────────────────────

type ToneModule = typeof import('tone');
let tone: ToneModule | null = null;

if (typeof window !== 'undefined') {
  import('tone')
    .then((m) => {
      tone = m;
    })
    .catch(() => {});
}

function getTone(): ToneModule | null {
  return tone;
}

// ── Pentatonic note mapping ───────────────────────────────────────────────────
// Values 0–15 map across C D E G A (pentatonic) starting at octave 4.
// The same value always maps to the same note regardless of array context.

const PENTATONIC_NOTES = ['C', 'D', 'E', 'G', 'A'] as const;
const BASE_OCTAVE = 4;

function valueToNote(value: number): string {
  const v = Math.max(0, Math.min(15, Math.round(value)));
  const noteIndex = v % PENTATONIC_NOTES.length;
  const octave = BASE_OCTAVE + Math.floor(v / PENTATONIC_NOTES.length);
  return `${PENTATONIC_NOTES[noteIndex]}${octave}`;
}

// ── Instrument singletons (lazy, one per preset) ──────────────────────────────
// Stored as `unknown` so this module compiles cleanly without a static Tone.js
// import. The Triggerable interface captures the only method we need.

type Triggerable = {
  triggerAttackRelease(
    note: string,
    duration: number,
    time?: number,
    velocity?: number,
  ): unknown;
};

let synthInst: unknown = null;
let organInst: unknown = null;
let guitarInst: unknown = null;
let pianoInst: unknown = null;
let pianoFallbackInst: unknown = null;
let pianoReady = false;
let vibraphoneInst: unknown = null;
let stringsInst: unknown = null;

function initSynth(T: ToneModule): Triggerable {
  if (synthInst) return synthInst as Triggerable;
  const inst = new T.PolySynth(T.AMSynth, {
    harmonicity: 1.5,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.2, release: 0.25 },
    modulation: { type: 'square' },
    modulationEnvelope: { attack: 0.2, decay: 0.01, sustain: 0.8, release: 0.2 },
  });
  inst.volume.value = -14;
  inst.toDestination();
  synthInst = inst;
  return inst as unknown as Triggerable;
}

function initOrgan(T: ToneModule): Triggerable {
  if (organInst) return organInst as Triggerable;
  const reverb = new T.Reverb({ decay: 1.5, wet: 0.18 }).toDestination();
  const inst = new T.PolySynth(T.FMSynth, {
    harmonicity: 3.01,
    modulationIndex: 14,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.0, sustain: 1.0, release: 0.5 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.5, decay: 0.0, sustain: 1, release: 0.5 },
  });
  inst.volume.value = -18;
  inst.connect(reverb);
  organInst = inst;
  return inst as unknown as Triggerable;
}

function initGuitar(T: ToneModule): Triggerable {
  if (guitarInst) return guitarInst as Triggerable;
  const inst = new T.PluckSynth({
    attackNoise: 1.5,
    dampening: 3500,
    resonance: 0.975,
  });
  inst.volume.value = -8;
  inst.toDestination();
  guitarInst = inst;
  return inst as unknown as Triggerable;
}

function initPianoFallback(T: ToneModule): Triggerable {
  if (pianoFallbackInst) return pianoFallbackInst as Triggerable;
  // Piano-like PolySynth used while Sampler samples are downloading.
  const inst = new T.PolySynth(T.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.3, sustain: 0.05, release: 0.5 },
  });
  inst.volume.value = -12;
  inst.toDestination();
  pianoFallbackInst = inst;
  return inst as unknown as Triggerable;
}

function initPiano(T: ToneModule): Triggerable {
  if (!pianoInst) {
    const reverb = new T.Reverb({ decay: 2.0, wet: 0.28 }).toDestination();
    // Salamander Grand Piano samples — subset covering our playable range (A3–A6).
    // Tone.Sampler pitch-interpolates between the loaded files automatically.
    const inst = new T.Sampler({
      urls: {
        A3: 'A3.mp3',
        C4: 'C4.mp3',
        'D#4': 'Ds4.mp3',
        'F#4': 'Fs4.mp3',
        A4: 'A4.mp3',
        C5: 'C5.mp3',
        'D#5': 'Ds5.mp3',
        'F#5': 'Fs5.mp3',
        A5: 'A5.mp3',
        C6: 'C6.mp3',
        'D#6': 'Ds6.mp3',
        'F#6': 'Fs6.mp3',
        A6: 'A6.mp3',
      },
      onload: () => {
        pianoReady = true;
      },
      release: 1.2,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
    });
    inst.volume.value = -10;
    inst.connect(reverb);
    pianoInst = inst;
  }
  // Return the real sampler only once all buffers are loaded; otherwise hand
  // back the fallback PolySynth so the user hears something immediately.
  return pianoReady
    ? (pianoInst as Triggerable)
    : initPianoFallback(T);
}

function initVibraphone(T: ToneModule): Triggerable {
  if (vibraphoneInst) return vibraphoneInst as Triggerable;
  const inst = new T.MetalSynth({
    envelope: { attack: 0.001, decay: 0.8, sustain: 0, release: 0.5 },
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 3500,
    octaves: 1.5,
  });
  inst.volume.value = -10;
  inst.toDestination();
  vibraphoneInst = inst;
  return inst as unknown as Triggerable;
}

function initStrings(T: ToneModule): Triggerable {
  if (stringsInst) return stringsInst as Triggerable;
  const chorus = new T.Chorus({ frequency: 2.5, delayTime: 3.5, depth: 0.7, wet: 0.4 }).toDestination();
  const reverb = new T.Reverb({ decay: 2.5, wet: 0.3 }).connect(chorus);
  const inst = new T.DuoSynth({
    vibratoAmount: 0.3,
    vibratoRate: 5,
    harmonicity: 1.005,
  });
  inst.volume.value = -14;
  inst.connect(reverb);
  stringsInst = inst;
  return inst as unknown as Triggerable;
}

function getInstrument(preset: SoundPreset): Triggerable | null {
  const T = getTone();
  if (!T) return null;
  try {
    switch (preset) {
      case 'synth':
        return initSynth(T);
      case 'organ':
        return initOrgan(T);
      case 'guitar':
        return initGuitar(T);
      case 'piano':
        return initPiano(T);
      case 'vibraphone':
        return initVibraphone(T);
      case 'strings':
        return initStrings(T);
    }
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Resume / start the Tone.js audio context after a user gesture. */
export function resumeAudioContext(): void {
  const T = getTone();
  if (!T) return;
  T.start().catch(() => {});
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function playNote(
  note: string,
  durationSec: number,
  preset: SoundPreset,
  delaySec = 0,
  velocity = 0.65,
): void {
  const T = getTone();
  if (!T) return;
  const inst = getInstrument(preset);
  if (!inst) return;
  try {
    inst.triggerAttackRelease(note, durationSec, T.now() + delaySec, velocity);
  } catch {
    // Transient audio scheduling error (e.g. context not yet running)
  }
}

function playArpeggio(
  values: number[],
  noteDuration: number,
  gapBetween: number,
  preset: SoundPreset,
  velocity = 0.6,
): void {
  const T = getTone();
  if (!T || values.length === 0) return;
  const inst = getInstrument(preset);
  if (!inst) return;
  const now = T.now();
  values.forEach((val, i) => {
    const delay = i * (noteDuration + gapBetween);
    try {
      inst.triggerAttackRelease(valueToNote(val), noteDuration, now + delay, velocity);
    } catch {
      // Transient audio scheduling error
    }
  });
}

// ── Step → sound mapping ──────────────────────────────────────────────────────

export function playStep(
  step: AlgorithmStep<unknown> | null,
  preset: SoundPreset = 'synth',
): void {
  if (!step) return;
  const T = getTone();
  if (!T) return;
  try {
    if (T.getContext().state !== 'running') return;
  } catch {
    return;
  }

  const data = step.data as
    | { array?: number[]; highlightIndices?: number[] }
    | undefined;
  const arr = data?.array ?? [];
  const indices = data?.highlightIndices ?? [];
  const vars = step.variables ?? {};
  const dur = 0.12;

  // init — arpeggio of the unsorted input
  if (step.id === 'init') {
    if (arr.length > 0) playArpeggio(arr, 0.065, 0.018, preset);
    else playNote(valueToNote(1), dur, preset, 0, 0.55);
    return;
  }

  // done — arpeggio of the sorted result
  if (step.id === 'done') {
    if (arr.length > 0) playArpeggio(arr, 0.08, 0.022, preset, 0.7);
    else {
      playNote(valueToNote(8), dur * 2, preset, 0, 0.6);
      playNote(valueToNote(12), dur * 1.5, preset, 0.1, 0.5);
    }
    return;
  }

  // swap — checked before the generic two-index path so it gets a distinct,
  // accented sound (higher velocity, tighter gap)
  if (step.id === 'swap' && indices.length >= 2 && arr.length > 0) {
    const a = arr[indices[0]!];
    const b = arr[indices[1]!];
    if (typeof a === 'number' && typeof b === 'number') {
      playNote(valueToNote(a), dur * 0.85, preset, 0, 0.82);
      playNote(valueToNote(b), dur * 0.85, preset, 0.04, 0.78);
      return;
    }
  }

  // compare (merge sort) — driven by left/right variables
  const leftVal = vars['left'];
  const rightVal = vars['right'];
  if (
    step.id === 'compare' &&
    typeof leftVal === 'number' &&
    typeof rightVal === 'number'
  ) {
    playNote(valueToNote(leftVal), dur, preset, 0, 0.6);
    playNote(valueToNote(rightVal), dur * 0.7, preset, 0.05, 0.5);
    return;
  }

  // compare (bubble / insertion sort) — two highlighted indices
  if (indices.length >= 2 && arr.length > 0) {
    const a = arr[indices[0]!];
    const b = arr[indices[1]!];
    if (typeof a === 'number' && typeof b === 'number') {
      playNote(valueToNote(a), dur, preset, 0, 0.6);
      playNote(valueToNote(b), dur * 0.7, preset, 0.05, 0.5);
      return;
    }
  }

  // merge place — value just written at index k-1
  const k = vars['k'];
  if (step.id === 'merge_place' && typeof k === 'number' && arr.length > 0) {
    const idx = k - 1;
    if (idx >= 0 && typeof arr[idx] === 'number') {
      playNote(valueToNote(arr[idx] as number), dur, preset, 0, 0.65);
      return;
    }
  }

  // single-index fallback
  if (indices.length >= 1 && arr.length > 0) {
    const v = arr[indices[0]!];
    if (typeof v === 'number') {
      playNote(valueToNote(v), dur, preset, 0, 0.58);
      return;
    }
  }

  if (arr.length > 0 && typeof arr[0] === 'number') {
    playNote(valueToNote(arr[0]), dur, preset, 0, 0.45);
    return;
  }

  // structural steps with no single value to represent
  if (['pass_start', 'merge_done', 'outer'].includes(step.id)) return;

  playNote(valueToNote(5), dur, preset, 0, 0.35);
}
