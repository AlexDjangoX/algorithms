/**
 * Library Sort - Display code for the code viewer
 */
export const LIBRARY_SORT_CODE = `function librarySort(input: number[]): number[] {
  const EMPTY = Symbol('gap');
  const epsilon = 0.5;
  const n = input.length;
  const sLen = Math.ceil((1 + epsilon) * n);
  const S: (number | symbol)[] = Array(sLen).fill(EMPTY);

  let pos = 0;
  let goal = 1;
  let round = 0;

  while (pos < n) {
    round++;
    for (let i = 0; i < goal && pos < n; i++) {
      const val = input[pos];
      const len = Math.min(sLen, (round === 1 ? 1 : 2 ** (round - 1)) * 2);

      const insPos = findInsertPosition(val, S, len);

      if (S[insPos] !== EMPTY) {
        let j = insPos;
        while (j < sLen - 1 && S[j] !== EMPTY) {
          [S[j], S[j + 1]] = [S[j + 1], S[j]];
          j++;
        }
      }

      S[insPos] = val;
      pos++;
    }

    if (pos >= n) break;

    const prevLen = Math.min(sLen, goal * 2);
    const newLen = Math.min(sLen, goal * 4);
    let w = newLen - 1;
    const step = Math.floor(newLen / prevLen);

    for (let j = prevLen - 1; j >= 0; j--) {
      if (w < S.length) S[w] = S[j];
      if (w > 0) S[w - 1] = EMPTY;
      w -= step;
    }

    goal *= 2;
  }

  return S.filter((x): x is number => x !== EMPTY);
}

function findInsertPosition(val: number, S: (number | symbol)[], len: number): number {
  let pos = binarySearchPos(val, S, len);
  while (pos < len && S[pos] !== EMPTY) pos++;
  if (pos < len) return pos;
  pos = binarySearchPos(val, S, len) - 1;
  while (pos >= 0 && S[pos] !== EMPTY) pos--;
  return Math.max(0, pos);
}

function binarySearchPos(val: number, S: (number | symbol)[], len: number): number {
  let lo = 0, hi = len - 1;
  while (lo <= hi) {
    let mid = Math.floor((lo + hi) / 2);
    while (mid < len && S[mid] === EMPTY) mid++;
    if (mid >= len) { hi = mid - 1; continue; }
    if (S[mid] < val) lo = mid + 1;
    else hi = mid - 1;
  }
  return lo;
}`;
