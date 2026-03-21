export type AlgorithmStatus = 'live' | 'coming-soon';

/** Home grid: classic single-algorithm cards vs. composite “application” cards. */
export type AlgorithmCardKind = 'algorithm' | 'application';

export interface Algorithm {
  slug: string;
  name: string;
  category: string;
  description: string;
  complexity: { time: string; space: string };
  status: AlgorithmStatus;
  /** When `application`, the home card uses a distinct layout (technique, not one named algorithm). */
  cardKind?: AlgorithmCardKind;
}

export const ALGORITHMS: Algorithm[] = [
  {
    slug: 'library-sort',
    name: 'Library Sort',
    category: 'Sorting',
    description:
      "Gapped insertion sort that binary-searches for each element's position.",
    complexity: { time: 'O(n · log n)', space: 'O(n)' },
    status: 'live',
  },
  {
    slug: 'bubble-sort',
    name: 'Bubble Sort',
    category: 'Sorting',
    description:
      'Repeatedly swaps adjacent elements until the array is sorted.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    status: 'live',
  },
  {
    slug: 'insertion-sort',
    name: 'Insertion Sort',
    category: 'Sorting',
    description:
      'Grows a sorted prefix from the left; each new element is shifted into place.',
    complexity: { time: 'O(n²)', space: 'O(1)' },
    status: 'live',
  },
  {
    slug: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    description:
      'Divides the array in half recursively, then merges sorted halves.',
    complexity: { time: 'O(n · log n)', space: 'O(n)' },
    status: 'live',
  },
  {
    slug: 'heap-sort',
    name: 'Heap Sort',
    category: 'Sorting',
    description:
      'Builds a max-heap, then repeatedly extracts the root into the sorted suffix.',
    complexity: { time: 'O(n · log n)', space: 'O(1)' },
    status: 'live',
  },
  {
    slug: 'bead-sort',
    name: 'Bead Sort',
    category: 'Sorting',
    description:
      'Simulates gravity: beads placed at the top of each column fall down to produce sorted order.',
    complexity: { time: 'O(n · S)', space: 'O(n · S)' },
    status: 'live',
  },
  {
    slug: 'binary-search-tree',
    name: 'Binary Search Tree',
    category: 'Trees',
    description:
      'Build the tree by inserting in order, then look up keys by walking from the root — same comparisons, O(h) per search when balanced.',
    complexity: { time: 'O(h) insert & search', space: 'O(n)' },
    status: 'live',
  },
  {
    slug: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    description:
      'Partitions around a pivot and recursively sorts each partition.',
    complexity: { time: 'O(n · log n) avg', space: 'O(log n)' },
    status: 'live',
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    category: 'Applications',
    description:
      'Full trace: insertion sort the array, then binary search for a target — sort + halving search in one flow.',
    complexity: { time: 'O(n²) sort + O(log n) search', space: 'O(1)' },
    status: 'live',
    cardKind: 'application',
  },
  {
    slug: 'a-star',
    name: 'A* Pathfinding',
    category: 'Graph',
    description:
      'Finds the shortest path using a heuristic to guide the search.',
    complexity: { time: 'O(E · log V)', space: 'O(V)' },
    status: 'coming-soon',
  },
];

export const ALGORITHMS_GRID = ALGORITHMS.filter((a) => a.cardKind !== 'application');
export const APPLICATIONS_GRID = ALGORITHMS.filter((a) => a.cardKind === 'application');
