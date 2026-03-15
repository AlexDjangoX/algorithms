/**
 * Merge Sort (bottom-up) - Display code for the code viewer
 */
export const MERGE_SORT_CODE = `function mergeSort(arr: number[]): void {
  const n = arr.length;

  for (let size = 1; size < n; size *= 2) {
    for (let leftStart = 0; leftStart < n - size; leftStart += 2 * size) {
      const mid = leftStart + size - 1;
      const rightEnd = Math.min(leftStart + 2 * size - 1, n - 1);

      const left = arr.slice(leftStart, mid + 1);
      const right = arr.slice(mid + 1, rightEnd + 1);
      let i = 0, j = 0, k = leftStart;

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
      while (i < left.length) arr[k++] = left[i++];
      while (j < right.length) arr[k++] = right[j++];
    }
  }
}`;
