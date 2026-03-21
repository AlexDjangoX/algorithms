# Adding a new algorithm

Three steps and no new page or layout files.

## 1. Metadata

In **`lib/data/algorithms.ts`**, add an entry (or set `status: 'live'` on an existing one):

```ts
{
  slug: 'my-algorithm',
  name: 'My Algorithm',
  category: 'Sorting',
  description: 'One-line description.',
  complexity: { time: 'O(n)', space: 'O(1)' },
  status: 'live',
}
```

## 2. Implementation

Create **`algorithms/my-algorithm/`** with:

- **`algorithm.ts`** — Export a generator that yields `AlgorithmStep<TData>` with `data`, `codeRange`, `description`, and optional `variables`. Use `createStep()` if you like. The `codeRange` line numbers must match the code file (1-based, inclusive). After edits, run **`npm run check:code-ranges`** from the repo root to confirm every `{ start, end }` fits `code.ts`.
- **`code.ts`** — Export a string constant with the display code (e.g. `MY_ALGORITHM_CODE`).

If the viz is “array of numbers with optional highlighted indices”, use the shared type and viz:

- In `algorithm.ts`: use `ArrayWithHighlightsData` from `@/components/visualization/BarArrayViz` and yield `{ array, highlightIndices? }`.
- In the registry (step 3), use `BarArrayViz` and `defaultVizData: { array: [] }`.

For custom visuals (e.g. Library Sort’s gaps), implement your own viz component and pass it in the registry.

## 3. Registry

In **`app/lib/algorithm-registry.ts`**:

- Define a stable factory: `const createMyAlgoGenerator = () => myAlgorithmGenerator();`
- Add an entry in `IMPLEMENTATIONS` with `code`, `filename`, `createGenerator`, and optionally `Visualization` and `defaultVizData`.

That’s it. The app serves `/algorithms/my-algorithm` via the dynamic route and the shared `AlgorithmPageContent`.
