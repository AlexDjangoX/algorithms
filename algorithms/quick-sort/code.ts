/**
 * Quick sort (Lomuto partition) — display code for the code viewer.
 */
export const QUICK_SORT_CODE = `function quickSort(arr: number[]): void {
  sort(arr, 0, arr.length - 1);
}

function sort(arr: number[], lo: number, hi: number): void {
  if (lo >= hi) {
    return;
  }
  const p = partition(arr, lo, hi);
  sort(arr, lo, p - 1);
  sort(arr, p + 1, hi);
}

function partition(arr: number[], lo: number, hi: number): number {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}
`;
