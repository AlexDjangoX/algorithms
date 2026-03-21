/**
 * Merge sort (bottom-up iterative) — display code for the code viewer.
 * Comments sit on their own lines so the panel does not clip long end-of-line text.
 */
export const MERGE_SORT_CODE = `function mergeSort(arr: number[]): void {
  const n = arr.length;

  // size = length of sorted runs being merged; doubles each outer iteration.
  for (let size = 1; size < n; size *= 2) {
    // Merge adjacent runs of the current length size (last run may be shorter).
    for (let leftStart = 0; leftStart < n - size; leftStart += 2 * size) {
      const mid = leftStart + size - 1;
      const rightEnd = Math.min(leftStart + 2 * size - 1, n - 1);

      const left = arr.slice(leftStart, mid + 1);
      const right = arr.slice(mid + 1, rightEnd + 1);
      let i = 0, j = 0, k = leftStart;

      // Merge two non-decreasing sequences into arr[k..] in non-decreasing order.
      while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
          arr[k] = left[i];
          i++;
        } else {
          arr[k] = right[j];
          j++;
        }
        k++;
      }
      // At most one of these loops runs; it appends the remainder in order.
      while (i < left.length) arr[k++] = left[i++];
      while (j < right.length) arr[k++] = right[j++];
    }
  }
}`;
