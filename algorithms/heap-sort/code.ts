/**
 * Heap sort (max-heap, in-place) — display code for the code viewer.
 * Comments sit on their own lines so the panel does not clip long end-of-line text.
 */
export const HEAP_SORT_CODE = `function heapSort(arr: number[]): void {
  const n = arr.length;
  // Build a binary max-heap on indices [0..n-1]: for each parent i, arr[i] ≥ arr[2i+1], arr[2i+2] when those indices exist.
  buildMaxHeap(arr, n);
  // Move the current maximum (root) to the sorted suffix [end+1..n-1], then restore heap on [0..end-1].
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    siftDown(arr, 0, end);
  }
}

function buildMaxHeap(arr: number[], n: number): void {
  // Nodes floor(n/2)..n-1 are leaves; sift down each non-leaf from bottom to top.
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i, n);
  }
}

function siftDown(arr: number[], i: number, heapSize: number): void {
  // heapSize: heap occupies indices [0..heapSize-1]. Compare with children using strict > for tie-break.
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
}`;
