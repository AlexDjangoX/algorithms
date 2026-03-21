import type { AlgorithmStep } from '@/app/lib/types';

export interface BSTNode {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
}

export type BSTPhase = 'insert' | 'search';

export interface BSTData {
  nodes: Record<number, BSTNode>;
  root: number | null;
  highlightId: number | null;
  pathIds: number[];
  insertingValue: number | null;
  newNodeId: number | null;
  /**
   * Values to insert, in order — shown in the viz so you always see the raw input.
   */
  inputSequence: number[];
  /**
   * How many values from the start of `inputSequence` are already in the tree.
   * While inserting `inputSequence[completedInputCount]`, that index is "active".
   */
  completedInputCount: number;
  /** After construction: lookup phase uses the same viz with different highlights. */
  phase: BSTPhase;
  /** Value currently being searched for (search phase only). */
  searchTarget: number | null;
  /** Node id where the target was found (search phase). */
  searchResultNodeId: number | null;
  /** Last node compared when the target is not in the tree. */
  searchMissNodeId: number | null;
  /**
   * Sorted values of all nodes currently in the tree — consumed by the audio
   * engine for pitch-range normalisation (maps to data.array in StepData).
   */
  array: number[];
}

// Matches the image: 8 at root, perfectly balanced 4-level BST.
export const BST_DEFAULT_INPUT = [8, 4, 12, 2, 6, 10, 14, 1, 3, 5, 7, 9, 11, 13, 15];

/** Keys used in the lookup demo after the tree is built (exported for the viz roadmap). */
export const BST_SEARCH_DEMO_TARGETS: readonly number[] = [7, 20];

type SnapSearchFields = Partial<
  Pick<BSTData, 'phase' | 'searchTarget' | 'searchResultNodeId' | 'searchMissNodeId'>
>;

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

  const snap = (
    highlightId: number | null = null,
    pathIds: number[] = [],
    insertingValue: number | null = null,
    newNodeId: number | null = null,
    completedInputCount = 0,
    search: SnapSearchFields = {},
  ): BSTData => ({
    nodes: cloneNodes(nodes),
    root,
    highlightId,
    pathIds: [...pathIds],
    insertingValue,
    newNodeId,
    inputSequence: [...input],
    completedInputCount,
    phase: search.phase ?? 'insert',
    searchTarget: search.searchTarget ?? null,
    searchResultNodeId: search.searchResultNodeId ?? null,
    searchMissNodeId: search.searchMissNodeId ?? null,
    array: Object.values(nodes)
      .map((n) => n.value)
      .sort((a, b) => a - b),
  });

  yield createStep(
    'init',
    snap(null, [], null, null, 0),
    [
      `Insert in order: [${input.join(', ')}].`,
      '',
      `BST: left < node < right (strict); duplicates skipped.`,
    ].join('\n'),
    { start: 1, end: 7 },
  );

  for (let inputIndex = 0; inputIndex < input.length; inputIndex++) {
    const val = input[inputIndex]!;
    yield createStep(
      'start_insert',
      snap(null, [], val, null, inputIndex),
      [
        `Next key val = ${val}. Start at root; follow left if val < node.value, right if val > node.value, stop without insert if val equals an existing key.`,
      ].join('\n'),
      { start: 5, end: 8 },
      { variables: { inserting: val } },
    );

    if (root === null) {
      const id = nextId++;
      nodes[id] = { id, value: val, left: null, right: null };
      root = id;
      yield createStep(
        'place',
        snap(id, [], val, id, inputIndex),
        [
          `Empty tree: the single node with key ${val} is a BST.`,
        ].join('\n'),
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
        snap(curr, path, val, null, inputIndex),
        [
          `At node ${node.value}; compare with val = ${val}.`,
        ].join('\n'),
        { start: 8, end: 8 },
        { variables: { inserting: val, current: node.value } },
      );

      if (val < node.value) {
        if (node.left === null) {
          const id = nextId++;
          nodes[id] = { id, value: val, left: null, right: null };
          nodes[curr]!.left = id;
          yield createStep(
            'place_left',
            snap(id, [...path, curr], val, id, inputIndex),
            [
              `val < ${node.value}, no left child: attach leaf.`,
            ].join('\n'),
            { start: 9, end: 11 },
            { variables: { inserting: val, parent: node.value } },
          );
          break;
        }
        yield createStep(
          'go_left',
          snap(curr, path, val, null, inputIndex),
          [
            `val < ${node.value}: continue to left child.`,
          ].join('\n'),
          { start: 13, end: 13 },
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
            snap(id, [...path, curr], val, id, inputIndex),
            [
              `val > ${node.value}, no right child: attach leaf.`,
            ].join('\n'),
            { start: 15, end: 17 },
            { variables: { inserting: val, parent: node.value } },
          );
          break;
        }
        yield createStep(
          'go_right',
          snap(curr, path, val, null, inputIndex),
          [
            `val > ${node.value}: continue to right child.`,
          ].join('\n'),
          { start: 19, end: 19 },
          { variables: { inserting: val, current: node.value } },
        );
        path.push(curr);
        curr = node.right;
      } else {
        break;
      }
    }
  }

  yield createStep(
    'build_complete',
    snap(null, [], null, null, input.length),
    [
      `Tree built. Search uses the same comparisons as insert.`,
    ].join('\n'),
    { start: 26, end: 28 },
  );

  for (let t = 0; t < BST_SEARCH_DEMO_TARGETS.length; t++) {
    const target = BST_SEARCH_DEMO_TARGETS[t]!;

    yield createStep(
      'search_start',
      snap(null, [], null, null, input.length, {
        phase: 'search',
        searchTarget: target,
        searchResultNodeId: null,
        searchMissNodeId: null,
      }),
      [
        `Search for target = ${target}, starting at root.`,
      ].join('\n'),
      { start: 26, end: 29 },
      { variables: { target } },
    );

    if (root === null) break;

    let curr = root;
    const path: number[] = [];

    while (true) {
      const node = nodes[curr]!;

      yield createStep(
        'search_compare',
        snap(curr, path, null, null, input.length, {
          phase: 'search',
          searchTarget: target,
          searchResultNodeId: null,
          searchMissNodeId: null,
        }),
        [
          `Compare target ${target} with node key ${node.value}.`,
        ].join('\n'),
        { start: 29, end: 30 },
        { variables: { target, current: node.value } },
      );

      if (target === node.value) {
        yield createStep(
          'search_found',
          snap(curr, path, null, null, input.length, {
            phase: 'search',
            searchTarget: target,
            searchResultNodeId: curr,
            searchMissNodeId: null,
          }),
          [
            `Equality: target found at this node.`,
          ].join('\n'),
          { start: 30, end: 30 },
          { variables: { target, found: node.value } },
        );
        break;
      }

      if (target < node.value) {
        if (node.left === null) {
          yield createStep(
            'search_not_found',
            snap(curr, path, null, null, input.length, {
              phase: 'search',
              searchTarget: target,
              searchResultNodeId: null,
              searchMissNodeId: curr,
            }),
            [
              `Need left subtree for target < ${node.value}, but left is null — not in tree.`,
            ].join('\n'),
            { start: 32, end: 32 },
            { variables: { target, stoppedAt: node.value } },
          );
          break;
        }
        yield createStep(
          'search_go_left',
          snap(curr, path, null, null, input.length, {
            phase: 'search',
            searchTarget: target,
            searchResultNodeId: null,
            searchMissNodeId: null,
          }),
          [
            `target < ${node.value}: go left.`,
          ].join('\n'),
          { start: 32, end: 32 },
          { variables: { target, current: node.value } },
        );
        path.push(curr);
        curr = node.left;
      } else {
        if (node.right === null) {
          yield createStep(
            'search_not_found',
            snap(curr, path, null, null, input.length, {
              phase: 'search',
              searchTarget: target,
              searchResultNodeId: null,
              searchMissNodeId: curr,
            }),
            [
              `Need right subtree for target > ${node.value}, but right is null — not in tree.`,
            ].join('\n'),
            { start: 34, end: 34 },
            { variables: { target, stoppedAt: node.value } },
          );
          break;
        }
        yield createStep(
          'search_go_right',
          snap(curr, path, null, null, input.length, {
            phase: 'search',
            searchTarget: target,
            searchResultNodeId: null,
            searchMissNodeId: null,
          }),
          [
            `target > ${node.value}: go right.`,
          ].join('\n'),
          { start: 34, end: 34 },
          { variables: { target, current: node.value } },
        );
        path.push(curr);
        curr = node.right;
      }
    }
  }

  yield createStep(
    'done',
    snap(null, [], null, null, input.length, {
      phase: 'search',
      searchTarget: null,
      searchResultNodeId: null,
      searchMissNodeId: null,
    }),
    [
      'Demo complete.',
      '',
      '✓',
    ].join('\n'),
    { start: 37, end: 38 },
  );
}
