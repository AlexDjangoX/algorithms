/**
 * Bead sort (gravity sort) — display code for the code viewer.
 * This snippet uses a max×n grid (rows = height levels, columns = input index).
 * The on-screen trace uses an n×maxVal grid with the same placement/gravity logic up to transpose of axes.
 */
export const BEAD_SORT_CODE = `function beadSort(arr: number[]): number[] {
  const max = Math.max(...arr);
  const n = arr.length;

  const grid: number[][] = Array.from({ length: max }, () =>
    Array(n).fill(0),
  );

  for (let j = 0; j < n; j++) {
    for (let i = 0; i < arr[j]; i++) {
      grid[i][j] = 1;
    }
  }

  for (let i = 0; i < max; i++) {
    const count = grid[i].reduce((a, b) => a + b, 0);
    for (let j = 0; j < n; j++) {
      grid[i][j] = j >= n - count ? 1 : 0;
    }
  }

  return grid[0].map((_, j) =>
    grid.reduce((sum, row) => sum + row[j], 0),
  );
}`;
