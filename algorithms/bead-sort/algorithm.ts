import type { AlgorithmStep } from '@/app/lib/types';

export interface BeadSortData {
  /**
   * grid[row][col] = 1 if bead present.
   * n rows (one per input element), maxVal cols (one per rod).
   * Row 0 = top element. After gravity: row 0 = smallest, row n-1 = largest.
   */
  grid: number[][];
  /** Original input */
  input: number[];
  /** Phase label */
  phase: string;
  /** Column currently being gravity-processed */
  activeCol?: number;
  /** Row currently being placed */
  activeRow?: number;
  /** Number of input elements (rows) */
  n: number;
  /** Max value (number of columns / rods) */
  maxVal: number;
  /** For sound: current row-bead counts */
  array: number[];
}

function seededShuffle(length: number, seed: number): number[] {
  const arr = Array.from({ length }, (_, i) => i + 1);
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export const BEAD_SORT_DEFAULT_INPUT = seededShuffle(12, 99);

function createStep(
  id: string,
  data: BeadSortData,
  description: string,
  codeRange: { start: number; end: number },
  overrides?: Partial<AlgorithmStep<BeadSortData>>,
): AlgorithmStep<BeadSortData> {
  return { id, data, action: id, codeRange, description, ...overrides };
}

function rowCounts(grid: number[][]): number[] {
  return grid.map((row) => row.reduce((a, b) => a + b, 0));
}

export function* beadSortGenerator(
  input: number[] = BEAD_SORT_DEFAULT_INPUT,
): Generator<AlgorithmStep<BeadSortData>, void, unknown> {
  const arr = [...input];
  const n = arr.length;
  const maxVal = Math.max(...arr, 1);

  const makeGrid = () =>
    Array.from({ length: n }, () => Array<number>(maxVal).fill(0));

  const snap = (
    grid: number[][],
    phase: string,
    activeCol?: number,
    activeRow?: number,
  ): BeadSortData => ({
    grid: grid.map((r) => [...r]),
    input: [...arr],
    phase,
    activeCol,
    activeRow,
    n,
    maxVal,
    array: rowCounts(grid),
  });

  // ── Init ────────────────────────────────────────────────────────────────────
  const grid = makeGrid();

  yield createStep(
    'init',
    snap(grid, 'init'),
    `Input: [${arr.join(', ')}] — ${n} elements, max ${maxVal}`,
    { start: 1, end: 3 },
  );

  // ── Place: row by row, beads left-aligned ────────────────────────────────
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < arr[i]!; j++) {
      grid[i]![j] = 1;
    }
    yield createStep(
      'place',
      snap(grid, 'place', undefined, i),
      `for row i = ${i}, arr[${i}] = ${arr[i]} → place ${arr[i]} beads left-to-right`,
      { start: 9, end: 14 },
      { variables: { row: i, beads: arr[i] } },
    );
  }

  // ── Gravity: column by column, beads fall to the bottom rows ────────────
  for (let j = 0; j < maxVal; j++) {
    // Count beads in this column across all rows
    let count = 0;
    for (let i = 0; i < n; i++) count += grid[i]![j]!;

    // Push them to the bottom: last `count` rows get 1, rest get 0
    for (let i = 0; i < n; i++) {
      grid[i]![j] = i >= n - count ? 1 : 0;
    }

    yield createStep(
      'gravity',
      snap(grid, 'gravity', j),
      `for column j = ${j}: pack ${count} bead(s) into bottom rows of grid[i][${j}]`,
      { start: 16, end: 22 },
      { variables: { rod: j, beads: count } },
    );
  }

  // ── Done ───────────────────────────────────────────────────────────────────
  const sorted = rowCounts(grid);
  yield createStep(
    'done',
    { ...snap(grid, 'done'), array: sorted },
    `Sorted: [${sorted.join(', ')}] ✓`,
    { start: 24, end: 25 },
  );
}
