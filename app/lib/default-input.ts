/**
 * Shared default input for algorithm visualizations.
 * Deterministic shuffle of 1..60 so all algorithms use the same sequence.
 */
function seededShuffle(length: number, seed: number): number[] {
  const arr = Array.from({ length }, (_, i) => i + 1);
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export const DEFAULT_INPUT_LENGTH = 30;
export const DEFAULT_INPUT = seededShuffle(DEFAULT_INPUT_LENGTH, 42);
