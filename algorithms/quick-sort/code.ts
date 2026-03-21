/**
 * Quick sort (Lomuto partition) — display code for the code viewer.
 * Comments sit on their own lines so the panel does not clip long end-of-line text.
 */
export const QUICK_SORT_CODE = `function quickSort(arr: number[]): void {
  sort(arr, 0, arr.length - 1);
}

function sort(arr: number[], lo: number, hi: number): void {
  // Base: subarray arr[lo..hi] has at most one element.
  if (lo >= hi) {
    return;
  }
  // Lomuto partition with pivot = arr[hi]; returns p with arr[p] in final place for this subarray.
  const p = partition(arr, lo, hi);
  sort(arr, lo, p - 1);
  sort(arr, p + 1, hi);
}

function partition(arr: number[], lo: number, hi: number): number {
  const pivot = arr[hi];
  let i = lo;
  // Maintain: arr[lo..i-1] ≤ pivot, arr[i..j-1] > pivot (vacuously true at start).
  for (let j = lo; j < hi; j++) {
    if (arr[j] <= pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i;
}`;
