export type AlgorithmStatus = 'live' | 'coming-soon';

export interface Algorithm {
  slug: string;
  name: string;
  category: string;
  description: string;
  complexity: { time: string; space: string };
  status: AlgorithmStatus;
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
    slug: 'merge-sort',
    name: 'Merge Sort',
    category: 'Sorting',
    description:
      'Divides the array in half recursively, then merges sorted halves.',
    complexity: { time: 'O(n · log n)', space: 'O(n)' },
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
      'Inserts values one by one, traversing left when smaller and right when larger to find each insertion point.',
    complexity: { time: 'O(h) per insert', space: 'O(n)' },
    status: 'live',
  },
  {
    slug: 'quick-sort',
    name: 'Quick Sort',
    category: 'Sorting',
    description:
      'Partitions around a pivot and recursively sorts each partition.',
    complexity: { time: 'O(n · log n) avg', space: 'O(log n)' },
    status: 'coming-soon',
  },
  {
    slug: 'binary-search',
    name: 'Binary Search',
    category: 'Searching',
    description:
      'Halves the search space on each step to find a target in O(log n).',
    complexity: { time: 'O(log n)', space: 'O(1)' },
    status: 'coming-soon',
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
