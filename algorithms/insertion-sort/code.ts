/**
 * Insertion sort — display code for the code viewer.
 * Comments sit on their own lines so the panel does not clip long end-of-line text.
 */
export const INSERTION_SORT_CODE = `function insertionSort(arr: number[]): void {
  // Sort arr in place: smallest → largest, moving left to right.
  for (let i = 1; i < arr.length; i++) {
    // arr[0] through arr[i - 1] are already sorted. We insert arr[i] next.
    const key = arr[i];
    // Hold key aside; shifting may overwrite arr[i] before we write key back.
    let j = i - 1;
    // Start comparing with the cell immediately to the left of key's old slot.
    while (j >= 0 && arr[j] > key) {
      // arr[j] is larger than key — copy it one index to the right to open a gap.
      arr[j + 1] = arr[j];
      j--;
    }
    // j is -1, or arr[j] ≤ key. The gap is at j + 1; store key there.
    arr[j + 1] = key;
  }
}
`;
