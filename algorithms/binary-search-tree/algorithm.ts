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

  /** Snapshot the current tree state into a BSTData object. */
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
    `keys = [${input.join(', ')}]; for each key insert into BST (val < node.value ? left : right)`,
    { start: 1, end: 3 },
  );

  for (let inputIndex = 0; inputIndex < input.length; inputIndex++) {
    const val = input[inputIndex]!;
    yield createStep(
      'start_insert',
      snap(null, [], val, null, inputIndex),
      `val = ${val}; curr = root; walk while (curr) comparing val to node.value`,
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
        snap(id, [], val, id, inputIndex),
        `root === null → root = new Node(${val})`,
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
        `while (curr): compare val=${val} with curr.value=${node.value}`,
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
            snap(id, [...path, curr], val, id, inputIndex),
            `${val} < ${node.value}: left is empty — insert ${val} here`,
            { start: 8, end: 10 },
            { variables: { inserting: val, parent: node.value } },
          );
          break;
        }
        // Go left
        yield createStep(
          'go_left',
          snap(curr, path, val, null, inputIndex),
          `val < node.value → curr = node.left`,
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
            snap(id, [...path, curr], val, id, inputIndex),
            `val > node.value && node.right === null → node.right = new Node(${val})`,
            { start: 14, end: 16 },
            { variables: { inserting: val, parent: node.value } },
          );
          break;
        }
        // Go right
        yield createStep(
          'go_right',
          snap(curr, path, val, null, inputIndex),
          `val > node.value → curr = node.right`,
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
    'build_complete',
    snap(null, [], null, null, input.length),
    'insert phase done; search uses same rule: target < node.value ? node.left : node.right',
    { start: 26, end: 26 },
  );

  // ── Search phase: demonstrate O(h) lookup ─────────────────────────────
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
      `Search for ${target}: start at root, compare until we find it or hit a missing child`,
      { start: 28, end: 30 },
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
        `target === ${target} vs curr.value === ${node.value}`,
        { start: 30, end: 32 },
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
          `target === node.value /* ${target} */ → found at this node`,
          { start: 31, end: 31 },
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
            `${target} < ${node.value} but there is no left child — ${target} is not in the tree`,
            { start: 32, end: 33 },
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
          `target < node.value → curr = node.left`,
          { start: 32, end: 33 },
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
            `target > node.value && node.right === null → not in tree`,
            { start: 34, end: 35 },
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
          `${target} > ${node.value}: go right`,
          { start: 34, end: 35 },
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
    'done: insert + search demo complete',
    { start: 38, end: 39 },
  );
}
