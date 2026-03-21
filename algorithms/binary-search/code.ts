/**
 * Application: insertion sort to order the array, then binary search for a target.
 * Comments sit on their own lines so the panel does not clip long end-of-line text.
 */
export const BINARY_SEARCH_CODE = `function insertionSort(arr: number[]): void {
  // Same as standalone insertion sort: after the loop, arr is in non-decreasing order.
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}

function binarySearch(arr: number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;

  // Invariant: if target appears in arr, its index lies in [lo..hi] (inclusive).
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`;
