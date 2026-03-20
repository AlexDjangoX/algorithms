/**
 * Bead Sort (Gravity Sort) — display code for the code viewer.
 * Beads are placed at the top, then each row's beads slide right (gravity).
 */
export const BEAD_SORT_CODE = `function beadSort(arr: number[]): number[] {
  const max = Math.max(...arr);
  const n = arr.length;

  // Grid: row 0 = top (ceiling), row max-1 = bottom (floor)
  const grid: number[][] = Array.from({ length: max }, () =>
    Array(n).fill(0),
  );

  // Place beads at top of each column
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < arr[j]; i++) {
      grid[i][j] = 1;
    }
  }

  // Gravity: each row's beads slide right (between columns)
  for (let i = 0; i < max; i++) {
    const count = grid[i].reduce((a, b) => a + b, 0);
    for (let j = 0; j < n; j++) {
      grid[i][j] = j >= n - count ? 1 : 0;
    }
  }

  // Read sorted values: bead count per column (ascending left→right)
  return grid[0].map((_, j) =>
    grid.reduce((sum, row) => sum + row[j], 0),
  );
}`;
