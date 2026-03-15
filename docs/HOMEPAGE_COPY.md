# AlgoViz — Homepage Design

## Project Context

**AlgoViz** is an interactive algorithm learning platform. Users arrive at the homepage, read a short hero pitch, then navigate to individual algorithm visualisers where they watch the algorithm execute step-by-step alongside live code highlighting and animated bar charts.

This homepage is a **landing page only** — one scrollable page with:

1. A minimal, fixed navbar
2. A full-viewport hero section
3. An algorithm card grid
4. A minimal footer

---

## Hard Technical Constraints

These are non-negotiable. Every line of code must conform to them.

| Constraint                 | Value                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| Framework                  | **Next.js 16** (App Router — `app/` directory, no `pages/`)                               |
| UI Library                 | **React 19**                                                                              |
| Styling                    | **Tailwind CSS v4** (no v3 syntax — use `@import "tailwindcss"`, not `@tailwind base`)    |
| Language                   | **TypeScript 5** (strict mode)                                                            |
| Dark / Light Mode          | Tailwind `darkMode: 'class'` — toggled by adding/removing the `dark` class on `<html>`    |
| Fonts                      | Imported from **Google Fonts** via `next/font/google` — **no Inter, no Roboto, no Arial** |
| Icons                      | Use **Lucide React** (`lucide-react`) for all icons                                       |
| Routing                    | All algorithm cards link via Next.js `<Link href="/algorithms/<slug>">`                   |
| Images                     | Next.js `<Image>` component where applicable                                              |
| No external CSS frameworks | Tailwind only — no Bootstrap, no Chakra, no MUI                                           |
| No inline styles           | All styling via Tailwind utility classes                                                  |

---

## Brand & Aesthetic Direction

### Personality

**Sophisticated. Technical. Alive.**
Think: the design language of a premium developer tool crossed with a high-end creative studio. Not a textbook. Not a bootcamp site. Something a senior engineer would be proud to share.

### Visual Style

- **Dark mode is the primary experience.** Light mode is an equally considered, not-an-afterthought alternate.
- **Geometric and precise** — sharp grid lines, monospace accents, clean spacing
- **Subtle motion** — micro-animations on hover, staggered entrance reveals on scroll, nothing jarring
- **Depth through layering** — glassy cards with backdrop blur, subtle gradients, noise/grain texture on backgrounds
- **Asymmetric layout moments** — break the grid occasionally (e.g. hero text offset, oversized decorative element)

### Dark Mode Background

A deep, near-black canvas with **depth and texture** — NOT flat `#000000` or `#111111`.

Options (pick the strongest one or combine):

- Radial gradient mesh: `from-slate-950 via-zinc-900 to-neutral-950` with a faint cyan or indigo glow emanating from top-left
- CSS noise grain overlay (SVG filter or pseudo-element) at 3–5% opacity
- Subtle animated grid of dots or lines at very low opacity (pure CSS, no canvas)
- A deep `#0a0a0f` base with a blurred `bg-indigo-900/20` orb positioned behind the hero

### Light Mode Background

NOT plain white. Options:

- `slate-50` / `zinc-50` with a very faint warm gradient
- Off-white `#f8f7f4` with soft shadow layering on cards
- Barely-there dot grid pattern at 4% opacity

### Colour Palette

| Role              | Dark Mode                     | Light Mode                 |
| ----------------- | ----------------------------- | -------------------------- |
| Background        | `#0a0a0f` / `zinc-950`        | `#f8f7f4` / `slate-50`     |
| Surface (cards)   | `zinc-900/80` + backdrop-blur | `white/90` + backdrop-blur |
| Border            | `white/8`                     | `zinc-200`                 |
| Primary accent    | `indigo-500`                  | `indigo-600`               |
| Secondary accent  | `violet-400`                  | `violet-600`               |
| Glow / highlight  | `cyan-400/30` (blur glow)     | `indigo-400/20`            |
| Text primary      | `zinc-50`                     | `zinc-900`                 |
| Text secondary    | `zinc-400`                    | `zinc-500`                 |
| Text muted        | `zinc-600`                    | `zinc-400`                 |
| Destructive / hot | `rose-500`                    | `rose-600`                 |

### Typography

Import exactly **two** fonts via `next/font/google`. Suggested pairing (or improve upon it):

| Role               | Font suggestion                      | Weight   |
| ------------------ | ------------------------------------ | -------- |
| Display / headings | `Space Grotesk`, `Outfit`, or `Syne` | 700, 800 |
| Body / UI          | `DM Sans`, `Figtree`, or `Geist`     | 400, 500 |
| Monospace accents  | `JetBrains Mono` or `Fira Code`      | 400, 500 |

Use the monospace font for: algorithm complexity badges (`O(n log n)`), code snippets, category tags, step counters.

---

## Navbar

### Behaviour

- Fixed to the top, full width
- Blurred glass effect: `bg-zinc-950/80 backdrop-blur-md` (dark) / `bg-white/80 backdrop-blur-md` (light)
- Border bottom: `border-b border-white/8` (dark) / `border-b border-zinc-200` (light)
- On scroll: subtle shadow appears (`shadow-md shadow-black/20`)

### Content (left → right)

1. **Logo mark** — a small geometric icon (e.g. two overlapping rectangles suggesting a bar chart, or a stylised `{}`) + the wordmark **"AlgoViz"** in the display font, weight 700
2. **Nav links** (centre or right) — `Algorithms`, `About` _(placeholder anchors for now)_
3. **Dark/Light toggle** — icon button, no label. Sun icon in dark mode, Moon icon in light mode. Smooth transition. Uses `lucide-react` (`Sun`, `Moon`).

### Sizing

- Height: `h-16`
- Max width of inner content: `max-w-7xl mx-auto px-6`

---

## Hero Section

### Layout

Full viewport height (`min-h-screen`) with content centred vertically and horizontally. The decorative background element (glowing orb / gradient mesh) lives here.

### Copy

**Eyebrow tag** (small, monospace, uppercase, letter-spaced, accent colour):

```
// learn by seeing
```

**Headline** (display font, very large — `text-5xl md:text-7xl lg:text-8xl`, bold):

```
Algorithms,
Finally Visual.
```

**Sub-headline** (body font, `text-lg md:text-xl`, secondary text colour, max-width ~560px):

```
Step through real algorithm execution — every comparison,
every swap, every insertion — animated in real time alongside
the live code that drives it.
```

**CTA buttons** (two):

- Primary: `Explore Algorithms →` — filled, `bg-indigo-600 hover:bg-indigo-500`, rounded-full, px-6 py-3
- Secondary: `View on GitHub ↗` — ghost/outline, `border border-white/20 hover:border-white/40`, rounded-full, px-6 py-3

**Below buttons** — a small social proof / stat row (monospace font, muted colour):

```
01 algorithm  ·  step-by-step execution  ·  open source
```

### Decorative Element

A large, blurred radial gradient orb positioned behind and slightly to the upper-right of the headline. In dark mode: `bg-indigo-700/25 blur-[120px]` approximately `w-[600px] h-[600px]`, absolutely positioned, `pointer-events-none`. In light mode: `bg-indigo-300/30`.

---

## Algorithm Cards Grid

### Section Header

```
// algorithms
```

Then a heading:

```
Pick an Algorithm.
Watch It Think.
```

Sub-text:

```
Every visualiser shows the full execution trace — code, bars, variables — in perfect sync.
```

### Grid Layout

```
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
max-w-7xl mx-auto px-6
```

### Card Design

Each card is a **glassmorphic tile** with a hover state that lifts the card and reveals a subtle accent glow.

**Card anatomy (top to bottom):**

1. **Category tag** — top-left, monospace, small, uppercase
   - e.g. `// sorting`

2. **Icon or abstract visual** — a small decorative element suggesting the algorithm. Options:
   - A miniature bar chart SVG (3–5 bars of varying height, coloured in the accent gradient)
   - A geometric shape unique to the algorithm type
   - Keep it small (`h-10 w-10`), `text-indigo-400` or gradient

3. **Algorithm name** — display font, `text-2xl font-bold`

4. **One-line description** — body font, muted, `text-sm`

5. **Complexity badges** — two pill badges side by side, monospace:
   - `Time: O(n · log n)` — `bg-indigo-500/10 text-indigo-400 border border-indigo-500/20`
   - `Space: O(n)` — `bg-violet-500/10 text-violet-400 border border-violet-500/20`

6. **"Explore →" link** — bottom-right, small, accent colour, appears/slides on hover

**Card styles:**

- Dark: `bg-zinc-900/60 backdrop-blur-sm border border-white/8 rounded-2xl p-6`
- Light: `bg-white/80 backdrop-blur-sm border border-zinc-200 rounded-2xl p-6`
- Hover dark: `hover:bg-zinc-800/80 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-900/20 hover:-translate-y-1`
- Hover light: `hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100 hover:-translate-y-1`
- Transition: `transition-all duration-300`
- The entire card is wrapped in `<Link href="/algorithms/<slug>">` — cursor pointer

### Algorithm Data (render these cards)

```typescript
const algorithms = [
  {
    slug: 'library-sort',
    name: 'Library Sort',
    category: 'Sorting',
    description:
      "Gapped insertion sort that binary-searches for each element's position.",
    complexity: { time: 'O(n · log n)', space: 'O(n)' },
    status: 'live', // "live" | "coming-soon"
  },
  {
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    description:
      'Repeatedly swaps adjacent elements until the array is sorted.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    status: 'coming-soon',
  },
  {
    slug: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    description:
      'Divides the array in half recursively, then merges sorted halves.',
    complexity: { time: 'O(n · log n)', space: 'O(n)' },
    status: 'coming-soon',
  },
  {
    slug: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    description:
      'Partitions around a pivot and recursively sorts each partition.',
    complexity: { time: 'O(n · log n) avg', space: 'O(log n)' },
    status: 'coming-soon',
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    description:
      'Halves the search space on each step to find a target in O(log n).',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    status: 'coming-soon',
  },
  {
    slug: 'a-star',
    name: 'A* Pathfinding',
    category: 'Graph',
    description:
      'Finds the shortest path using a heuristic to guide the search.',
    complexity: { time: 'O(E · log V)', space: 'O(V)' },
    status: 'coming-soon',
  },
];
```

**"Coming Soon" cards** should be visually dimmed (`opacity-60`) with a `Coming Soon` badge overlaid (`bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full`) and `pointer-events-none` on the link.

---

## Footer

Minimal. One row. `border-t border-white/8` (dark) / `border-t border-zinc-200` (light).

```
Left:  AlgoViz  ·  Open Source Algorithm Visualiser
Right: GitHub ↗   (link to repo)
```

Font: small, muted, monospace for the copyright / tagline, sans-serif for links.

---

## Dark / Light Mode Toggle Implementation

Use a `ThemeProvider` client component that:

1. Reads initial preference from `localStorage` (key: `"algoviz-theme"`)
2. Falls back to `prefers-color-scheme` media query
3. Applies/removes the `dark` class on `document.documentElement`
4. Persists the choice to `localStorage` on toggle

The toggle button should use:

- `Sun` icon (Lucide) when in dark mode (clicking switches to light)
- `Moon` icon (Lucide) when in light mode (clicking switches to dark)
- Smooth icon swap: `transition-all duration-200 rotate-0 scale-100` / `rotate-90 scale-0` style crossfade

---

## Animations & Micro-interactions

- **Hero headline**: staggered word-by-word entrance on mount (`opacity-0 → opacity-100`, `translateY(20px) → translateY(0)`) using CSS `@keyframes` or Tailwind `animate-` utilities
- **Cards**: stagger-in on scroll using `IntersectionObserver` — each card fades up with a 60ms delay per card
- **Card hover**: `transition-all duration-300 hover:-translate-y-1` lift + glow shadow
- **Navbar**: `transition-shadow duration-300` shadow appears on scroll
- **CTA button**: `hover:scale-105 active:scale-95 transition-transform duration-150`
- **Theme toggle**: icon rotation crossfade

No external animation libraries — pure CSS transitions and Tailwind `animate-` utilities only.

---

## File Structure Expected

```
app/
├── layout.tsx          # Imports fonts, ThemeProvider, global dark-class logic
├── page.tsx            # Homepage — Hero + Cards + Footer
└── globals.css         # @import "tailwindcss"; + CSS variables for theme

components/
├── navbar.tsx          # Fixed navbar with logo + theme toggle
├── hero.tsx            # Hero section
├── algorithm-card.tsx  # Single reusable card component
├── algorithm-grid.tsx  # Grid of AlgorithmCards + section header
├── footer.tsx          # Footer
└── theme-provider.tsx  # Client component for dark/light toggle logic
```

---

## Do Not

- ❌ Do not use Tailwind v3 syntax (`@tailwind base` / `@tailwind components` / `@tailwind utilities`)
- ❌ Do not use `pages/` directory — App Router only
- ❌ Do not use `styled-components`, `emotion`, or any CSS-in-JS
- ❌ Do not use `next-themes` — implement the theme toggle manually as described above
- ❌ Do not use `useLayoutEffect` on the server — guard with `typeof window !== "undefined"` or move to a client component
- ❌ Do not use placeholder/lorem ipsum copy — use the exact copy provided above
- ❌ Do not use Inter, Roboto, or Arial as the primary font
- ❌ Do not add a hamburger menu or mobile nav drawer — the navbar collapses gracefully with `hidden md:flex` on nav links
- ❌ Do not add any content beyond what is specified — no blog section, no testimonials, no pricing

---

## Summary Checklist

- [ ] Fixed glass navbar with logo, nav links, dark/light toggle
- [ ] Full-viewport hero with eyebrow, headline, sub-headline, two CTAs, stat row, background orb
- [ ] Algorithm card grid (6 cards: 1 live, 5 coming soon) with glassmorphic cards, complexity badges, hover lift
- [ ] Minimal footer
- [ ] Dark mode (primary) + light mode (equal quality)
- [ ] Theme toggle persisted to localStorage
- [ ] Google Fonts via `next/font/google` — display + body + monospace
- [ ] All routing via Next.js `<Link>`
- [ ] TypeScript throughout — no `any`
- [ ] Tailwind CSS v4 syntax
- [ ] Staggered entrance animations (CSS only)
- [ ] Responsive: mobile → tablet → desktop
