/**
 * Heap sort (max-heap, in-place) — display code for the code viewer.
 */
export const HEAP_SORT_CODE = `function heapSort(arr: number[]): void {
  const n = arr.length;
  buildMaxHeap(arr, n);
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    siftDown(arr, 0, end);
  }
}

function buildMaxHeap(arr: number[], n: number): void {
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i, n);
  }
}

function siftDown(arr: number[], i: number, heapSize: number): void {
  while (true) {
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    let largest = i;
    if (l < heapSize && arr[l] > arr[largest]) largest = l;
    if (r < heapSize && arr[r] > arr[largest]) largest = r;
    if (largest === i) return;
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest;
  }
}
`;
