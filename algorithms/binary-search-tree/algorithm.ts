import type { AlgorithmStep } from '@/app/lib/types';

export interface BSTNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
}

export interface BSTData {
  nodes: Record<number, BSTNode>;
  root: number | null;
  highlightId: number | null;
  pathIds: number[];
  insertingValue: number | null;
  newNodeId: number | null;
  /**
   * Sorted values of all nodes currently in the tree — consumed by the audio
   * engine for pitch-range normalisation (maps to data.array in StepData).
   */
  array: number[];
}

// Matches the image: 8 at root, perfectly balanced 4-level BST.
export const BST_DEFAULT_INPUT = [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15];

function createStep(
  id: string,
  data: BSTData,
  description: string,
  codeRange: { start: number; end: number },
  overrides?: Partial<AlgorithmStep<BSTData>>,
): AlgorithmStep<BSTData> {
  return { id, data, action: id, codeRange, description, ...overrides };
}

function cloneNodes(nodes: Record<number, BSTNode>): Record<number, BSTNode> {
  const out: Record<number, BSTNode> = {};
  for (const id in nodes) out[id] = { ...nodes[id]! };
  return out;
}

export function* bstInsertGenerator(
  input: number[] = BST_DEFAULT_INPUT,
): Generator<AlgorithmStep<BSTData>, void, unknown> {
  let nextId = 0;
  const nodes: Record<number, BSTNode> = {};
  let root: number | null = null;

  /** Snapshot the current tree state into a BSTData object. */
  const snap = (
    highlightId: number | null = null,
    pathIds: number[] = [],
    insertingValue: number | null = null,
    newNodeId: number | null = null,
  ): BSTData => ({
    nodes: cloneNodes(nodes),
    root,
    highlightId,
    pathIds: [...pathIds],
    insertingValue,
    newNodeId,
    array: Object.values(nodes)
      .map((n) => n.value)
      .sort((a, b) => a - b),
  });

  yield createStep(
    'init',
    snap(),
    `Insert ${input.length} values into a Binary Search Tree`,
    { start: 1, end: 3 },
  );

  for (const val of input) {
    yield createStep(
      'start_insert',
      snap(null, [], val),
      `Insert ${val}: create new node, begin at root`,
      { start: 2, end: 5 },
      { variables: { inserting: val } },
    );

    // Special case: tree is empty
    if (root === null) {
      const id = nextId++;
      nodes[id] = { id, value: val, left: null, right: null };
      root = id;
      yield createStep(
        'place',
        snap(id, [], val, id),
        `Tree is empty — ${val} becomes the root`,
        { start: 3, end: 3 },
        { variables: { inserting: val, placed: 'root' } },
      );
      continue;
    }

    let curr = root;
    const path: number[] = [];

    while (true) {
      const node = nodes[curr]!;

      yield createStep(
        'compare',
        snap(curr, path, val),
        `Compare ${val} with node ${node.value}`,
        { start: 7, end: 7 },
        { variables: { inserting: val, current: node.value } },
      );

      if (val < node.value) {
        if (node.left === null) {
          const id = nextId++;
          nodes[id] = { id, value: val, left: null, right: null };
          nodes[curr]!.left = id;
          yield createStep(
            'place_left',
            snap(id, [...path, curr], val, id),
            `${val} < ${node.value}: left is empty — insert ${val} here`,
            { start: 8, end: 10 },
            { variables: { inserting: val, parent: node.value } },
          );
          break;
        }
        // Go left
        yield createStep(
          'go_left',
          snap(curr, path, val),
          `${val} < ${node.value}: go left`,
          { start: 12, end: 12 },
          { variables: { inserting: val, current: node.value } },
        );
        path.push(curr);
        curr = node.left;
      } else if (val > node.value) {
        if (node.right === null) {
          const id = nextId++;
          nodes[id] = { id, value: val, left: null, right: null };
          nodes[curr]!.right = id;
          yield createStep(
            'place_right',
            snap(id, [...path, curr], val, id),
            `${val} > ${node.value}: right is empty — insert ${val} here`,
            { start: 14, end: 16 },
            { variables: { inserting: val, parent: node.value } },
          );
          break;
        }
        // Go right
        yield createStep(
          'go_right',
          snap(curr, path, val),
          `${val} > ${node.value}: go right`,
          { start: 18, end: 18 },
          { variables: { inserting: val, current: node.value } },
        );
        path.push(curr);
        curr = node.right;
      } else {
        break; // duplicate — skip
      }
    }
  }

  yield createStep(
    'done',
    snap(),
    'BST construction complete! ✓',
    { start: 23, end: 23 },
  );
}
