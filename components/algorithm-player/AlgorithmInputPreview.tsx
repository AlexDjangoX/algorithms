'use client';

import { useRef } from 'react';
import { extractInputSequenceFromVizData } from '@/app/lib/extract-visualization-input';

const DEFAULT_HEADING =
  'Starting input — original order (stays fixed here while the visualization below updates).';

/**
 * Shown under the title / complexity row so the viz card height stays stable
 * and the input never flickers when a step omits optional fields.
 */
export function AlgorithmInputPreview({
  vizData,
  heading = DEFAULT_HEADING,
}: {
  vizData: unknown;
  /** Override per algorithm (e.g. binary-search unsorted slice). */
  heading?: string;
}) {
  const raw = extractInputSequenceFromVizData(vizData);
  const latchedRef = useRef<number[]>([]);
  if (raw.length > 0) {
    latchedRef.current = raw;
  }
  const values = raw.length > 0 ? raw : latchedRef.current;

  if (values.length === 0) {
    return null;
  }

  return (
    <div className="mb-5 w-full rounded-xl border border-border bg-muted/20 px-3 py-3 sm:px-4 sm:py-3.5">
      <p className="mb-2.5 text-center text-xs leading-snug text-muted-foreground sm:text-left lg:max-w-3xl">
        {heading}
      </p>
      <div className="flex min-h-[2.75rem] max-h-28 flex-wrap content-start justify-center gap-1.5 overflow-y-auto sm:justify-start">
        {values.map((v, idx) => (
          <span
            key={`${idx}-${v}`}
            className="inline-flex min-w-8 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/70 px-2 py-1 font-mono text-xs font-semibold tabular-nums text-foreground shadow-sm"
            title={`Position ${idx} in the starting sequence`}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
}
