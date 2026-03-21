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
      `There are ${n} numbers in the input. The largest value is ${maxVal}, so we draw a grid with ${n} rows and ${maxVal} columns. Each cell is either empty or holds one bead (shown as 1).`,
      '',
      `The total number of beads equals the sum of the input values, and we never add or remove beads—only move them.`,
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
        `Row ${i} stands for input value ${arr[i]}. We place that many beads in the leftmost cells of the row (if the value is zero, the row stays empty).`,
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
        `Column ${j} is the next rod we let “fall.” There are ${count} beads in this column. Gravity stacks them at the bottom: the lowest ${count} rows get a bead in this column and the rest are empty.`,
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
      `Count beads in each row: that row sum is the output value for that position. The multiset of row sums equals the multiset of inputs, and the row sums read from top to bottom in order from smallest to largest.`,
      '',
      '✓',
    ].join('\n'),
    { start: 26, end: 28 },
  );
}
