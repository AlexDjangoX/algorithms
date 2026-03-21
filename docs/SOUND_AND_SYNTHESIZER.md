# Sound & Synthesizer in AlgoViz

## What we’re trying to achieve

We want the algorithm visualisation to be **audible as well as visual**. The goals are:

1. **Sonification** — Each step of the algorithm should produce sound so users can _hear_ what’s happening, not only see it. This supports accessibility and different learning styles.
2. **Meaningful mapping** — The sound should reflect the **actual data and operations**: which values are being compared, swapped, or written, so that listening conveys the same information as the viz.
3. **Pleasant and configurable** — The default tone should be inoffensive; users should be able to choose a **timbre** (synth, organ, piano, guitar) and have that choice **persist** across sessions.
4. **Actually awesome** — We aim for sonification that sounds **great**, not just “good enough.” We do **not** believe we can achieve that with the native Web Audio API alone (oscillators are too limited). We **need to find a JavaScript library** that can do this for us — better synthesis, real instrument timbres, or similar — and integrate it while keeping our step → sound mapping and UI.

We are **not** trying to:

- Let users “paste a function” and have it automatically generate stepped sound (that would require instrumentation or a sandbox; we use explicit step generators).
- Provide full musical composition or tempo control; the “score” is fixed by the algorithm steps and the playback speed slider.

---

## What we’ve already implemented

### 1. Web Audio–based synthesis

- **Single `AudioContext`** created on first use; resumed on first user gesture to satisfy browser autoplay rules.
- **Pitch mapping** — Array values (e.g. 1–15) are mapped to a **pentatonic scale** (C D E G A across octaves) so any sequence of values sounds musical and the same value always maps to the same note.
- **Short tones** — Each step triggers one or more notes with a quick attack and decay to avoid overlap and clicks.

### 2. Meaningful step → sound mapping

Sound is driven by **step type and step data**, not generic beeps:

| Step type                           | What you hear                                                                            |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| **Init**                            | Arpeggio of the **input array** in order (the unsorted sequence).                        |
| **Done**                            | **Sort** complete (`phase` ≠ `search`): short **Imperial March–style** opening motif (G minor). **Search** `done` (binary search / BST): pentatonic arpeggio of the array. |
| **Compare (e.g. bubble)**           | The **two values** at the compared indices (two notes, slightly staggered).              |
| **Compare (merge)**                 | The **two values** from the left and right runs (`variables.left`, `variables.right`).   |
| **Swap**                            | The **two values** that were just swapped (distinct timbre: triangle, quick succession). |
| **Merge place**                     | The **value just written** at index `k - 1`.                                             |
| **pass_start / merge_done / outer** | No sound (no single “value” to represent).                                               |

So: init = “here’s the input,” done = “here’s the output,” compare = “these two are being compared,” swap = “these two just swapped.”

### 3. Sound presets (timbre)

Users can choose a **preset** that only changes **how** notes sound, not which notes play:

- **Synth** — Default sine (and triangle for second note in a pair); short, clean envelope.
- **Organ** — Sine plus a 5th harmonic (1.5× frequency), longer sustain and decay.
- **Piano** — Sine with a very fast attack (2 ms) and medium decay for a percussive attack.
- **Guitar** — Triangle with instant attack and short decay for a pluck.

Implementation: each preset sets oscillator type, attack time, decay time, and (for organ) an optional second oscillator. All presets use the same pentatonic pitch mapping.

### 4. UI and persistence

- **Sound on/off** — Toggle in the algorithm player controls; when off, no `playStep` calls.
- **Preset selector** — Shadcn **DropdownMenu** (Synth / Organ / Piano / Guitar) shown when sound is on; implemented with `@/components/ui/dropdown-menu` (trigger shows current preset, radio items for selection).
- **Persistence** — The selected preset is stored in **localStorage** under `algoviz-sound-preset` and restored on the next visit (after mount, to avoid hydration issues).

### 5. Integration points

- **AlgorithmPlayer** — Holds `soundEnabled` and `soundPreset` state; calls `playStep(currentStep, soundPreset)` when the step or preset changes; passes preset and handlers to **Controls**.
- **Controls** — Renders the Sound toggle and the shadcn preset dropdown (DropdownMenu); calls `onSoundPresetChange` and (via parent) `setStoredSoundPreset` when the user changes the preset.
- **algorithm-sound.ts** — Exposes `playStep(step, preset)`, `resumeAudioContext()`, `getStoredSoundPreset()`, `setStoredSoundPreset()`, and the preset type/labels for the UI.

---

## What we’ve tried and decided (or ruled out)

- **“Paste a function and hear it”** — Discussed; not implemented. Automatically turning a plain function into stepped sound would require either instrumenting the code (e.g. AST-based) or running it in a sandbox and sampling state; we stick with explicit generators that yield steps.
- **Sample-based sounds (WAV/MP3)** — Not used. We rely on Web Audio oscillators so there are no asset files and we can keep the mapping fully data-driven.
- **Different pitch mapping** — We use a fixed pentatonic mapping so the “melody” of the sort is always in tune; we have not added alternative scales or octave shifts.
- **Volume control** — Not exposed in the UI; levels are fixed in code to keep the UX simple.

---

## We need a JavaScript library (not optional)

Our aim is to make the sonification **awesome**. The current implementation uses raw Web Audio oscillators; the presets (Synth, Organ, Piano, Guitar) are **approximations** and don’t sound like real instruments. We do **not** think we can get to “awesome” with the native API alone — it’s too limited.

So we **need to find a JavaScript library** that can do this for us: better synthesis, real instrument timbres, or high-quality sound, while:

- Fitting our **step → sound mapping** (we tell it “play these notes for this step”),
- Working in the **browser** with no backend,
- Keeping the same **UI** (preset choice, persistence) and **playStep(step, preset)** integration.

Once we have a suitable library, we swap the internals of `algorithm-sound.ts` and plug it in. Finding that library is a **requirement** to reach our goal, not an optional improvement.

---

## File and API reference

- **`app/lib/algorithm-sound.ts`** — All synthesis logic, preset definitions, and localStorage helpers.
- **`components/controls/Controls.tsx`** — Sound toggle and shadcn DropdownMenu preset selector.
- **`components/algorithm-player/AlogorithmPlayer.tsx`** — Sound state, persistence on change, and calling `playStep(step, soundPreset)`.

Public API from `algorithm-sound.ts`:

- `playStep(step, preset?)` — Play sound for the current algorithm step using the given preset.
- `resumeAudioContext()` — Call on first user gesture so playback is allowed.
- `getStoredSoundPreset()` / `setStoredSoundPreset(preset)` — Read/write preset in localStorage.
- `SoundPreset`, `SOUND_PRESETS`, `SOUND_PRESET_LABELS` — For the preset selector UI.
