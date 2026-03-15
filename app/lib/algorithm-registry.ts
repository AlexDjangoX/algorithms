/**
 * Single source of truth for live algorithm implementations.
 *
 * To add an algorithm:
 * 1. Add metadata to ALGORITHMS in lib/data/algorithms.ts (slug, name, description, complexity, status: 'live').
 * 2. Add algorithms/<slug>/algorithm.ts (generator yielding AlgorithmStep) and algorithms/<slug>/code.ts (code string).
 * 3. Add one entry below in IMPLEMENTATIONS (code, filename, createGenerator, optional Visualization + defaultVizData).
 * No new page or layout files needed — the dynamic route and AlgorithmPageContent handle the rest.
 */
import type { ComponentType } from 'react';
import type { AlgorithmStep } from '@/app/lib/types';
import type { Algorithm } from '@/lib/data/algorithms';
import { ALGORITHMS } from '@/lib/data/algorithms';
import { librarySortGenerator } from '@/algorithms/library-sort/algorithm';
import { LIBRARY_SORT_CODE } from '@/algorithms/library-sort/code';
import { BarViz } from '@/components/visualization/BarViz';
import { bubbleSortGenerator } from '@/algorithms/bubble-sort/algorithm';
import { BUBBLE_SORT_CODE } from '@/algorithms/bubble-sort/code';
import { mergeSortGenerator } from '@/algorithms/merge-sort/algorithm';
import { MERGE_SORT_CODE } from '@/algorithms/merge-sort/code';
import { BarArrayViz } from '@/components/visualization/BarArrayViz';

export interface AlgorithmConfig extends Algorithm {
  code: string;
  filename: string;
  createGenerator: () => Generator<AlgorithmStep<unknown>, void, unknown>;
  Visualization?: ComponentType<{ data: unknown }>;
  defaultVizData?: unknown;
}

const createLibrarySortGenerator = () => librarySortGenerator();
const createBubbleSortGenerator = () => bubbleSortGenerator();
const createMergeSortGenerator = () => mergeSortGenerator();

const IMPLEMENTATIONS: Record<
  string,
  Omit<AlgorithmConfig, keyof Algorithm>
> = {
  'library-sort': {
    code: LIBRARY_SORT_CODE,
    filename: 'librarySort.ts',
    createGenerator: createLibrarySortGenerator,
    Visualization: BarViz as ComponentType<{ data: unknown }>,
    defaultVizData: { array: [], input: [] },
  },
  'bubble-sort': {
    code: BUBBLE_SORT_CODE,
    filename: 'bubbleSort.ts',
    createGenerator: createBubbleSortGenerator,
    Visualization: BarArrayViz as ComponentType<{ data: unknown }>,
    defaultVizData: { array: [] },
  },
  'merge-sort': {
    code: MERGE_SORT_CODE,
    filename: 'mergeSort.ts',
    createGenerator: createMergeSortGenerator,
    Visualization: BarArrayViz as ComponentType<{ data: unknown }>,
    defaultVizData: { array: [] },
  },
};

export function getAlgorithmConfig(slug: string): AlgorithmConfig | null {
  const meta = ALGORITHMS.find((a) => a.slug === slug);
  if (!meta || meta.status !== 'live') return null;
  const impl = IMPLEMENTATIONS[slug];
  if (!impl) return null;
  return { ...meta, ...impl };
}

export function getLiveSlugs(): string[] {
  return ALGORITHMS.filter((a) => a.status === 'live').map((a) => a.slug);
}
