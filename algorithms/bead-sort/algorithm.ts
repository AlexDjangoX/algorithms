import type { AlgorithmStep } from '@/app/lib/types';

export interface BeadSortData {
  /**
   * grid[row][col] = 1 if bead present.
   * n rows (one per input element), maxVal cols (one per rod).
   * Row 0 = top. After gravity on each column, beads occupy bottom rows of that column.
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

  const grid = makeGrid();

  yield createStep(
    'init',
    snap(grid, 'init'),
    [
      `n = ${n}, M = max value = ${maxVal}. Grid is n × M with entries 0/1.`,
      '',
      `Bead count Σ_i arr[i] equals the number of 1s in the grid at every step.`,
    ].join('\n'),
    { start: 1, end: 8 },
  );

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < arr[i]!; j++) {
      grid[i]![j] = 1;
    }
    yield createStep(
      'place',
      snap(grid, 'place', undefined, i),
      [
        `For row i = ${i}, place arr[i] = ${arr[i]} beads: set grid[i][0] = … = grid[i][${arr[i]! - 1}] = 1 (if arr[i] = 0, nothing placed).`,
      ].join('\n'),
      { start: 11, end: 13 },
      { variables: { row: i, beads: arr[i] } },
    );
  }

  for (let j = 0; j < maxVal; j++) {
    let count = 0;
    for (let i = 0; i < n; i++) count += grid[i]![j]!;

    for (let i = 0; i < n; i++) {
      grid[i]![j] = i >= n - count ? 1 : 0;
    }

    yield createStep(
      'gravity',
      snap(grid, 'gravity', j),
      [
        `Column j = ${j}: count = ${count} beads. Pack them to the bottom rows: grid[i][j] = 1 iff i ≥ n − count.`,
      ].join('\n'),
      { start: 18, end: 21 },
      { variables: { rod: j, beads: count } },
    );
  }

  const sorted = rowCounts(grid);
  yield createStep(
    'done',
    { ...snap(grid, 'done'), array: sorted },
    [
      `Row sums match the input multiset; here they read non-decreasing left to right — the sorted order of the original values.`,
      '',
      '✓',
    ].join('\n'),
    { start: 26, end: 28 },
  );
}
