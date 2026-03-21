# AlgoViz — Interactive Algorithm Learning Platform

> A professional, world-class platform for visualising and learning algorithms step-by-step — built with Next.js 16, React 19, GSAP, and TypeScript.

![AlgoViz — Library Sort visualisation](public/image.png)

---

## Overview

AlgoViz transforms abstract algorithms into living, breathing visualisations. Every step of every algorithm is rendered in real time — bars animate into their correct positions as the logic executes, while a synchronised code viewer highlights the exact lines being run. Variables, descriptions, and playback controls keep you oriented at every moment.

The goal is simple: **make algorithms intuitive, not intimidating.**

---

## Features

### Visualisation Engine
- **GSAP-powered bar chart** — all elements are visible at all times; bars smoothly fly to their sorted positions as each step executes
- **Collision-free slot assignment** — a mathematically guaranteed unique horizontal slot for every bar at every step (no two elements ever share a position)
- **Value-proportional heights** — bar heights scale to their actual values so relative magnitudes are always clear
- **Value-based colour gradient** — bars transition from deep blue (low values) through purple to hot pink (high values)
- **Active element highlight** — the bar currently being inserted glows bright red-pink with a soft radial shadow

### Synchronised Code Viewer
- **Line-by-line execution tracking** — the active code range is highlighted in green as the algorithm advances
- **VS Code–style tab header** — language badge, filename, and close tab for a familiar IDE feel
- **Scrollable, full-height panel** — the entire algorithm is readable at a glance on larger screens

### Playback Controls
- **Play / Pause / Step Forward / Step Back / Reset**
- **Speed control** — 0.5×, 1×, 1.5×, 2×, 3×
- **Scrubber** — jump to any step instantly
- **Keyboard shortcuts** — `Space` to play/pause, `←` / `→` to step

### Layout
- **Responsive two-column layout on large screens** — code viewer pinned on the left, animated bar chart on the right — both visible simultaneously
- **Single-column stacked layout on mobile**

### Step sonification (optional)
- **Tone.js** — when sound is enabled, each step maps data (compares, swaps, etc.) to notes; timbre presets (synth, organ, piano, …) persist in `localStorage`

### Modularity
- **Single dynamic route** — every algorithm is served from `/algorithms/[slug]`; no per-algorithm page or layout files
- **Algorithm registry** — one place wires metadata, code, generator, and optional visualization per slug
- **Reusable visualizations** — `BarArrayViz` for array + `highlightIndices`; custom viz for Library Sort (`BarViz`), BST, bead sort, and the binary-search flow (`BinarySearchViz`)

### Variables Panel
- Live display of all algorithm variables at the current step (e.g. `val`, `pos`, `round`, `insPos`)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| UI Library | [React 19](https://react.dev/) |
| Animation | [GSAP 3](https://gsap.com/) |
| Audio (optional) | [Tone.js](https://tonejs.github.io/) |
| Syntax Highlighting | [prism-react-renderer](https://github.com/FormidableLabs/prism-react-renderer) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |

---

## Architecture

Component files use **PascalCase** (e.g. `BarViz.tsx`, `AlgorithmPageContent.tsx`). Folders use **kebab-case** (e.g. `algorithm-player/`, `code-viewer/`). One dynamic route serves all algorithms; no per-algorithm pages or layouts.

```
.
├── algorithms/                        # Each folder: algorithm.ts + code.ts (+ README.md)
│   ├── bead-sort/
│   ├── binary-search/
│   ├── binary-search-tree/
│   ├── bubble-sort/
│   ├── heap-sort/
│   ├── insertion-sort/
│   ├── library-sort/
│   ├── merge-sort/
│   ├── quick-sort/
│   └── README.md                     # "Adding a new algorithm" guide
├── app/
│   ├── layout.tsx                   # Root layout (theme, fonts)
│   ├── page.tsx                     # Home (algorithm cards)
│   ├── error.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   ├── hooks/
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── algorithm-registry.ts    # slug → code, generator, viz (single source)
│   │   ├── algorithm-sound.ts       # Tone.js step → note mapping
│   │   ├── default-input.ts         # Shared shuffle / demo inputs
│   │   ├── extract-visualization-input.ts
│   │   ├── types.ts                 # AlgorithmStep, CodeRange
│   │   ├── use-algorithm-player.ts  # Step collection, playback state
│   │   └── utils.ts
│   └── algorithms/
│       ├── layout.tsx               # Navbar + Footer for all algorithm pages
│       └── [slug]/
│           └── page.tsx             # Dynamic route — one page per algorithm
├── components/
│   ├── algorithm-page/
│   │   └── AlgorithmPageContent.tsx # Shared page (back link, heading, player)
│   ├── algorithm-player/
│   │   └── AlogorithmPlayer.tsx     # Orchestrator (player, code viewer, controls, viz)
│   ├── algorithm-card/
│   │   └── AlgorithmCard.tsx        # Card on home grid
│   ├── code-viewer/
│   │   └── CodeViewer.tsx           # Syntax-highlighted code + line highlight
│   ├── controls/
│   │   └── Controls.tsx             # Play / Pause / Step / Speed / Scrubber / sound
│   ├── home/
│   │   └── AlgorithmGrid.tsx        # Home page grid of algorithm cards
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── navigation/
│   │   └── NavLink.tsx
│   ├── providers/
│   │   └── ThemeProvider.tsx        # next-themes
│   ├── variables-panel/
│   │   └── VariablesPanel.tsx      # Live variables at current step
│   └── visualization/
│       ├── ArrayViz.tsx
│       ├── BarArrayViz.tsx          # Generic array + highlightIndices
│       ├── BarViz.tsx               # Library Sort — gapped array, collision-free slots
│       ├── BeadSortViz.tsx
│       ├── BinarySearchViz.tsx
│       └── BSTViz.tsx
├── lib/
│   ├── data/
│   │   └── algorithms.ts            # Metadata (slug, name, complexity, status)
│   └── utils.ts
└── public/
    └── image.png
```

### How an Algorithm is Added

There are **no per-algorithm page or layout files**. Adding an algorithm is three steps:

1. **Metadata** — One entry in `lib/data/algorithms.ts` (slug, name, description, complexity, `status: 'live'`).
2. **Implementation** — `algorithms/<slug>/algorithm.ts` (generator) and `algorithms/<slug>/code.ts` (code string).
3. **Registry** — One entry in `app/lib/algorithm-registry.ts` (wire code, generator, and optional viz).

See **`algorithms/README.md`** for the full step-by-step guide. The dynamic route `app/algorithms/[slug]` and shared `AlgorithmPageContent` render every algorithm from the registry.

Every algorithm is a **generator** that `yield`s an `AlgorithmStep` at each meaningful operation:

```typescript
yield createStep("compare", { array: [...arr], highlightIndices: [j, j + 1] },
  `Compare arr[${j}] and arr[${j + 1}]`,
  { start: 6, end: 8 },
  { variables: { j, "arr[j]": arr[j], "arr[j+1]": arr[j + 1] } }
);
```

The `useAlgorithmPlayer` hook collects all steps on mount, enabling instant scrubbing without re-running the generator.

### Collision-Free Slot Assignment

The visualisation guarantees no two bars ever share a horizontal slot:

1. **Placed bars** are permanently assigned their final sorted rank (e.g. value `4` in a 15-element array always occupies slot `3`).
2. **Unplaced bars** are distributed — in original input order — across the remaining free slots.

This means at every step the `n` slots are partitioned between placed and unplaced bars with zero overlap, and the end state is always a perfect ascending bar chart.

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
git clone https://github.com/AlexDjangoX/algorithms.git
cd algorithms
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Algorithms

Synced with `lib/data/algorithms.ts` (home grid excludes `cardKind: 'application'` entries from the main sort/search cards).

| Algorithm | Category | Time | Space | Status |
|---|---|---|---|---|
| Library Sort | Sorting | O(n · log n) | O(n) | Live |
| Bubble Sort | Sorting | O(n²) | O(1) | Live |
| Insertion Sort | Sorting | O(n²) | O(1) | Live |
| Merge Sort | Sorting | O(n · log n) | O(n) | Live |
| Heap Sort | Sorting | O(n · log n) | O(1) | Live |
| Bead Sort | Sorting | O(n · S) | O(n · S) | Live |
| Quick Sort | Sorting | O(n · log n) avg | O(log n) | Live |
| Binary Search Tree | Trees | O(h) insert & search | O(n) | Live |
| Binary Search | Applications | O(n²) sort + O(log n) search | O(1) | Live |
| A\* Pathfinding | Graph | O(E · log V) | O(V) | Coming soon |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `→` | Step forward one operation |
| `←` | Step back one operation |

---

## Contributing

Adding a new algorithm requires **no new page or layout files**. Three steps:

1. **`lib/data/algorithms.ts`** — Add (or flip to `status: 'live'`) one metadata entry (slug, name, description, complexity).
2. **`algorithms/<slug>/`** — Add `algorithm.ts` (generator that yields `AlgorithmStep`) and `code.ts` (display code string).
3. **`app/lib/algorithm-registry.ts`** — Add one entry wiring code, generator, and optional viz.

The player, controls, code viewer, and shared viz (e.g. `BarArrayViz` for array + highlights) are fully generic. See **`algorithms/README.md`** for the detailed guide.

---

## License

MIT
