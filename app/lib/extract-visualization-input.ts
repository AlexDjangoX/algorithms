/**
 * Read `inputSequence` / `input` from visualization step data for the global
 * “starting input” strip. Skips BST — that viz uses its own colored insertion strip.
 */
export function extractInputSequenceFromVizData(data: unknown): number[] {
  if (!data || typeof data !== 'object') return [];
  const d = data as Record<string, unknown>;

  const nodes = d.nodes;
  if (
    nodes !== undefined &&
    typeof nodes === 'object' &&
    nodes !== null &&
    !Array.isArray(nodes)
  ) {
    return [];
  }

  const seq = d.inputSequence;
  if (Array.isArray(seq) && seq.every((n) => typeof n === 'number')) {
    return seq as number[];
  }
  const inp = d.input;
  if (Array.isArray(inp) && inp.every((n) => typeof n === 'number')) {
    return inp as number[];
  }
  return [];
}
