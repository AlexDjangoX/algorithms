/**
 * Insertion sort — display code for the code viewer.
 * Comments sit on their own lines so the panel does not clip long end-of-line text.
 */
export const INSERTION_SORT_CODE = `function insertionSort(arr: number[]): void {
  // Rearrange arr in place into non-decreasing order (duplicates allowed).
  for (let i = 1; i < arr.length; i++) {
    // Invariant at this line: arr[0..i-1] is sorted in non-decreasing order.
    const key = arr[i];
    // key is the element to insert; later shifts may overwrite arr[i] before key is written back.
    let j = i - 1;
    // Compare key against arr[j], arr[j-1], ... until arr[j] <= key or j = -1.
    while (j >= 0 && arr[j] > key) {
      // arr[j] belongs to the right of key in sorted order; shift it one slot right.
      arr[j + 1] = arr[j];
      j--;
    }
    // Now j = -1 or arr[j] <= key; insert key at index j+1.
    arr[j + 1] = key;
  }
}
`;
