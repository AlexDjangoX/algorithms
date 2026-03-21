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

export type SoundPreset =
  | 'synth'
  | 'organ'
  | 'piano'
  | 'guitar'
  | 'vibraphone'
  | 'strings';

export const SOUND_PRESET_LABELS: Record<SoundPreset, string> = {
  synth: 'Synth',
  organ: 'Organ',
  piano: 'Piano',
  guitar: 'Guitar',
  vibraphone: 'Vibraphone',
  strings: 'Strings',
};

export const SOUND_PRESETS: SoundPreset[] = [
  'synth',
  'organ',
  'piano',
  'guitar',
  'vibraphone',
  'strings',
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
// Values 1–N map across C D E G A (pentatonic) from octave 4 up to 8.
// maxVal is derived from the actual data so the tallest bar always maps to the
// highest note and pitch is proportional to bar height across the full scale.

const PENTATONIC_NOTES = ['C', 'D', 'E', 'G', 'A'] as const;
const BASE_OCTAVE = 4;
const PITCH_SLOTS = 25; // 5 octaves × 5 notes (octaves 4–8)

function valueToNote(value: number, maxVal: number): string {
  const ceiling = Math.max(2, maxVal);
  const v = Math.max(1, Math.min(ceiling, Math.round(value)));
  const pitchIndex = Math.round(((v - 1) * (PITCH_SLOTS - 1)) / (ceiling - 1));
  const noteIndex = pitchIndex % PENTATONIC_NOTES.length;
  const octave = BASE_OCTAVE + Math.floor(pitchIndex / PENTATONIC_NOTES.length);
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
    modulationEnvelope: {
      attack: 0.2,
      decay: 0.01,
      sustain: 0.8,
      release: 0.2,
    },
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
  return pianoReady ? (pianoInst as Triggerable) : initPianoFallback(T);
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
  const chorus = new T.Chorus({
    frequency: 2.5,
    delayTime: 3.5,
    depth: 0.7,
    wet: 0.4,
  }).toDestination();
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
    // Transient audio scheduling error
  }
}

function playArpeggio(
  values: number[],
  noteDuration: number,
  gapBetween: number,
  preset: SoundPreset,
  velocity = 0.6,
  maxVal?: number,
): void {
  const T = getTone();
  if (!T || values.length === 0) return;
  const inst = getInstrument(preset);
  if (!inst) return;
  const now = T.now();
  const m = maxVal ?? Math.max(...values);
  values.forEach((val, i) => {
    const delay = i * (noteDuration + gapBetween);
    try {
      inst.triggerAttackRelease(
        valueToNote(val, m),
        noteDuration,
        now + delay,
        velocity,
      );
    } catch {
      // Transient audio scheduling error
    }
  });
}

/**
 * Opening motif only — short celebratory stinger when a *sort* reaches `done`.
 * (Not a full reproduction; `phase === 'search'` completions keep the arpeggio.)
 */
const IMPERIAL_MARCH_SORT_DONE: readonly {
  t: number;
  note: string;
  dur: number;
  v?: number;
}[] = [
  { t: 0.0, note: 'G3', dur: 0.13, v: 0.74 },
  { t: 0.15, note: 'G3', dur: 0.13, v: 0.72 },
  { t: 0.32, note: 'G3', dur: 0.13, v: 0.74 },
  { t: 0.5, note: 'Eb3', dur: 0.4, v: 0.8 },
  { t: 0.96, note: 'Bb3', dur: 0.14, v: 0.72 },
  { t: 1.14, note: 'G3', dur: 0.13, v: 0.74 },
  { t: 1.31, note: 'Eb3', dur: 0.13, v: 0.7 },
  { t: 1.48, note: 'Bb3', dur: 0.14, v: 0.72 },
  { t: 1.66, note: 'G3', dur: 0.13, v: 0.76 },
  { t: 1.83, note: 'D4', dur: 0.13, v: 0.74 },
  { t: 2.0, note: 'Eb4', dur: 0.55, v: 0.82 },
];

function playImperialMarchSortComplete(preset: SoundPreset): void {
  const T = getTone();
  if (!T) return;
  const inst = getInstrument(preset);
  if (!inst) return;
  const now = T.now();
  for (const { t, note, dur, v = 0.75 } of IMPERIAL_MARCH_SORT_DONE) {
    try {
      inst.triggerAttackRelease(note, dur, now + t, v);
    } catch {
      // Transient audio scheduling error
    }
  }
}

// ── Step → sound mapping ──────────────────────────────────────────────────────
// Data shape: bubble/merge use { array: number[], highlightIndices?: number[] }.
// Library sort uses { array: (number|null)[], input: number[], insertingValue?: number }
// and puts indices on step.highlights instead of data.highlightIndices.

type StepData = {
  array?: (number | null)[];
  input?: number[];
  highlightIndices?: number[];
  insertingValue?: number;
};

function getValuesForArpeggio(
  data: StepData | undefined,
  stepId: string,
): number[] {
  if (!data) return [];
  // Library sort init: use input (unsorted)
  if (stepId === 'init' && data.input?.length) return data.input;
  // Library sort done: sorted order = non-null elements of array in order
  if (stepId === 'done' && data.array?.length) {
    const compact = data.array.filter(
      (x): x is number => typeof x === 'number',
    );
    if (compact.length > 0) return compact;
  }
  // Bubble/merge: array is the current state (number[])
  if (data.array?.length) {
    const nums = data.array.filter((x): x is number => typeof x === 'number');
    if (nums.length > 0) return nums;
  }
  return [];
}

/**
 * Play audio for a single algorithm step.
 *
 * @param stepIntervalSec - How long each visual step lasts (seconds). Notes are
 *   scaled to ~60 % of this so there is a natural gap before the next step
 *   without long silences. Init/done arpeggios ignore this and use their own
 *   fixed durations since they intentionally overlap several visual steps.
 */
export function playStep(
  step: AlgorithmStep<unknown> | null,
  preset: SoundPreset = 'synth',
  stepIntervalSec = 0.8,
): void {
  if (!step) return;
  const T = getTone();
  if (!T) return;
  try {
    if (T.getContext().state !== 'running') return;
  } catch {
    return;
  }

  const data = step.data as StepData | undefined;
  const arr = (data?.array ?? []) as (number | null)[];
  const indices = data?.highlightIndices ?? step.highlights ?? [];
  const vars = step.variables ?? {};

  // Derive the pitch ceiling from the actual data so pitch is proportional to
  // bar height across the full pentatonic scale.
  const arrNums = arr.filter((x): x is number => typeof x === 'number');
  const dataMax = arrNums.length > 1 ? Math.max(...arrNums) : 30;

  // Note duration scales with the visual step interval (~60 %) so notes fill
  // the step naturally instead of leaving a dead-air gap.
  const dur = Math.max(0.06, stepIntervalSec * 0.6);

  const note = (v: number) => valueToNote(v, dataMax);

  // init — arpeggio of the unsorted input
  if (
    step.id === 'init' ||
    step.id === 'init_input' ||
    step.id === 'sort_init'
  ) {
    const values = getValuesForArpeggio(data, 'init');
    const m = values.length > 0 ? Math.max(...values) : dataMax;
    if (values.length > 0) playArpeggio(values, 0.065, 0.018, preset, 0.6, m);
    else playNote(valueToNote(1, dataMax), dur, preset, 0, 0.55);
    return;
  }

  // done — sort: Imperial March–style stinger; search phase: pentatonic arpeggio
  if (step.id === 'done') {
    const values = getValuesForArpeggio(data, 'done');
    const m = values.length > 0 ? Math.max(...values) : dataMax;
    const phase = (data as { phase?: string } | undefined)?.phase;

    if (phase !== 'search') {
      if (values.length > 0) {
        playImperialMarchSortComplete(preset);
        return;
      }
      playNote(valueToNote(8, dataMax), dur * 2, preset, 0, 0.6);
      playNote(valueToNote(dataMax, dataMax), dur * 1.5, preset, 0.1, 0.5);
      return;
    }

    if (values.length > 0) playArpeggio(values, 0.08, 0.022, preset, 0.7, m);
    else {
      playNote(valueToNote(8, dataMax), dur * 2, preset, 0, 0.6);
      playNote(valueToNote(dataMax, dataMax), dur * 1.5, preset, 0.1, 0.5);
    }
    return;
  }

  // Library sort: single value being inserted
  const insertingVal = data?.insertingValue ?? vars['val'];
  if (
    typeof insertingVal === 'number' &&
    ['pick_value', 'binary_search', 'insert'].includes(step.id)
  ) {
    playNote(note(insertingVal), dur, preset, 0, 0.65);
    return;
  }

  // Heap sort — parent vs larger child (silent when heap property already holds)
  const parentIdxHb = vars['parentIdx'];
  const largestIdxHb = vars['largestIdx'];
  if (
    step.id === 'heap_compare' &&
    typeof vars['parent'] === 'number' &&
    typeof vars['other'] === 'number' &&
    typeof parentIdxHb === 'number' &&
    typeof largestIdxHb === 'number'
  ) {
    if (parentIdxHb === largestIdxHb) return;
    playNote(note(vars['parent'] as number), dur, preset, 0, 0.6);
    playNote(
      note(vars['other'] as number),
      dur * 0.7,
      preset,
      dur * 0.08,
      0.5,
    );
    return;
  }

  // swap — play the two values at their new positions (post-swap array)
  if (step.id === 'swap' && indices.length >= 2 && arr.length > 0) {
    const a = arr[indices[0]!];
    const b = arr[indices[1]!];
    if (typeof a === 'number' && typeof b === 'number') {
      playNote(note(a), dur * 0.85, preset, 0, 0.82);
      playNote(note(b), dur * 0.85, preset, dur * 0.15, 0.78);
      return;
    }
  }

  // compare (merge sort) — left/right values stored in variables
  const leftVal = vars['left'];
  const rightVal = vars['right'];
  if (
    step.id === 'compare' &&
    typeof leftVal === 'number' &&
    typeof rightVal === 'number'
  ) {
    playNote(note(leftVal), dur, preset, 0, 0.6);
    playNote(note(rightVal), dur * 0.7, preset, dur * 0.08, 0.5);
    return;
  }

  // Insertion sort (standalone page)
  if (step.id === 'insert_pass' && typeof vars['key'] === 'number') {
    playNote(note(vars['key'] as number), dur, preset, 0, 0.64);
    const pa = vars['placedAt'];
    if (typeof pa === 'number' && arr[pa] != null) {
      playNote(note(arr[pa] as number), dur * 0.72, preset, dur * 0.1, 0.52);
    }
    return;
  }

  // Binary search application: insertion-sort phase (embedded)
  if (step.id === 'sort_step' && typeof vars['key'] === 'number') {
    playNote(note(vars['key'] as number), dur, preset, 0, 0.64);
    const pa = vars['placedAt'];
    if (typeof pa === 'number' && arr[pa] != null) {
      playNote(note(arr[pa] as number), dur * 0.72, preset, dur * 0.1, 0.52);
    }
    return;
  }
  if (step.id === 'search_intro' && typeof vars['target'] === 'number') {
    playNote(note(vars['target'] as number), dur * 1.05, preset, 0, 0.62);
    return;
  }

  // Binary search — compare arr[mid] to target
  const midVal = vars['midVal'];
  const targetVal = vars['target'];
  if (
    step.id === 'compare' &&
    typeof midVal === 'number' &&
    typeof targetVal === 'number'
  ) {
    playNote(note(targetVal), dur, preset, 0, 0.68);
    playNote(note(midVal), dur * 0.62, preset, dur * 0.1, 0.52);
    return;
  }

  if (['go_left', 'go_right'].includes(step.id)) {
    const t = vars['target'];
    const m = vars['midVal'];
    if (typeof t === 'number' && typeof m === 'number') {
      playNote(note(t), dur * 0.85, preset, 0, 0.5);
      return;
    }
  }

  // BST search — compare target with current node
  const searchTargetVal = (data as { searchTarget?: number | null })
    ?.searchTarget;
  if (
    step.id === 'search_compare' &&
    typeof searchTargetVal === 'number' &&
    typeof vars['current'] === 'number'
  ) {
    playNote(note(searchTargetVal), dur, preset, 0, 0.72);
    playNote(
      note(vars['current'] as number),
      dur * 0.65,
      preset,
      dur * 0.12,
      0.52,
    );
    return;
  }
  if (
    ['search_go_left', 'search_go_right', 'search_start'].includes(step.id) &&
    typeof searchTargetVal === 'number'
  ) {
    playNote(note(searchTargetVal), dur * 0.85, preset, 0, 0.55);
    return;
  }
  if (step.id === 'search_found' && typeof searchTargetVal === 'number') {
    playNote(note(searchTargetVal), dur * 1.1, preset, 0, 0.78);
    return;
  }
  if (step.id === 'search_not_found' && typeof searchTargetVal === 'number') {
    playNote(note(searchTargetVal), dur * 0.5, preset, 0, 0.42);
    playNote(valueToNote(1, dataMax), dur * 0.55, preset, dur * 0.12, 0.32);
    return;
  }

  // BST insert compare — play inserting value against the node value being compared
  const bstNodeVal = vars['current'];
  if (
    step.id === 'compare' &&
    typeof bstNodeVal === 'number' &&
    typeof data?.insertingValue === 'number'
  ) {
    playNote(note(data.insertingValue), dur, preset, 0, 0.72);
    playNote(note(bstNodeVal), dur * 0.65, preset, dur * 0.12, 0.52);
    return;
  }

  // BST traversal and placement steps
  if (
    [
      'go_left',
      'go_right',
      'place_left',
      'place_right',
      'place',
      'start_insert',
    ].includes(step.id)
  ) {
    const v = data?.insertingValue;
    if (typeof v === 'number') {
      playNote(note(v), dur, preset, 0, 0.65);
      return;
    }
  }

  // Bead sort: place (beads in column) or gravity (beads in row)
  if (['place', 'gravity'].includes(step.id)) {
    const v = vars['beads'] ?? vars['count'];
    if (typeof v === 'number') {
      playNote(note(v), dur, preset, 0, 0.6);
      return;
    }
  }

  // compare (bubble sort) or shift (library sort) — two highlighted indices
  if (indices.length >= 2 && arr.length > 0) {
    const a = arr[indices[0]!];
    const b = arr[indices[1]!];
    if (typeof a === 'number' && typeof b === 'number') {
      playNote(note(a), dur, preset, 0, 0.6);
      playNote(note(b), dur * 0.7, preset, dur * 0.08, 0.5);
      return;
    }
  }

  // merge_place — value just written at index k-1
  const k = vars['k'];
  if (step.id === 'merge_place' && typeof k === 'number' && arr.length > 0) {
    const idx = k - 1;
    if (idx >= 0) {
      const v = arr[idx];
      if (typeof v === 'number') {
        playNote(note(v), dur, preset, 0, 0.65);
        return;
      }
    }
  }

  // single-index fallback
  if (indices.length >= 1 && arr.length > 0) {
    const v = arr[indices[0]!];
    if (typeof v === 'number') {
      playNote(note(v), dur, preset, 0, 0.58);
      return;
    }
  }

  if (arr.length > 0) {
    const first = arr[0];
    if (typeof first === 'number') {
      playNote(note(first), dur, preset, 0, 0.45);
      return;
    }
  }

  // structural steps with no audible value
  if (
    [
      'pass_start',
      'merge_done',
      'outer',
      'round_start',
      'rebalance_start',
      'rebalance',
      'build_complete',
      'sort_complete',
      'sort_enter',
      'sort_base',
      'recurse',
      'partition_done',
      'heap_phase',
      'heap_build',
    ].includes(step.id)
  )
    return;

  playNote(valueToNote(Math.ceil(dataMax / 6), dataMax), dur, preset, 0, 0.35);
}
