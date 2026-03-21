/**
 * Bubble sort — display code for the code viewer.
 * Comments sit on their own lines so the panel does not clip long end-of-line text.
 */
export const BUBBLE_SORT_CODE = `function bubbleSort(arr: number[]): void {
  const n = arr.length;

  // Outer pass i: after the inner loop, arr[n - 1 - i] is a maximum among arr[0..n - 1 - i].
  for (let i = 0; i < n - 1; i++) {
    // Inner j: compare adjacent pairs only in arr[0..n - 1 - i]; suffix arr[n - i..n-1] is already fixed.
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
}`;
