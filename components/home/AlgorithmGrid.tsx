'use client';

import { useEffect, useRef, useState } from 'react';
import { AlgorithmCard } from '@/components/algorithm-card/AlgorithmCard';
import type { Algorithm } from '@/lib/data/algorithms';
import {
  ALGORITHMS_GRID,
  APPLICATIONS_GRID,
} from '@/lib/data/algorithms';

const STAGGER_MS = 60;

function StaggeredList({
  items,
  startIndex,
}: {
  items: Algorithm[];
  startIndex: number;
}) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      role="list"
    >
      {items.map((algorithm, i) => (
        <div
          key={algorithm.slug}
          className={visible ? 'animate-fade-up' : 'opacity-0'}
          style={{ animationDelay: `${(startIndex + i) * STAGGER_MS}ms` }}
          role="listitem"
        >
          <AlgorithmCard algorithm={algorithm} />
        </div>
      ))}
    </div>
  );
}

export function AlgorithmGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHeroVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (gridRef.current) observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="algorithms"
      className="relative py-16 sm:py-24 md:py-32 px-4 sm:px-6"
      aria-labelledby="algorithms-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div
          ref={gridRef}
          className={`mb-10 sm:mb-14 ${heroVisible ? 'animate-fade-up' : 'opacity-0'}`}
        >
          <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-primary mb-3 sm:mb-4">
            {`// algorithms`}
          </p>
          <h2
            id="algorithms-heading"
            className="font-display text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-3 sm:mb-4"
          >
            Pick an Algorithm.
            <br />
            <span className="text-muted-foreground">Watch It Think.</span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg">
            Every visualiser shows the full execution trace — code, bars,
            variables — in perfect sync.
          </p>
        </div>

        <div className="mb-12 sm:mb-16">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4 sm:mb-5">
            Sorting & structures
          </h3>
          <StaggeredList items={ALGORITHMS_GRID} startIndex={0} />
        </div>

        {APPLICATIONS_GRID.length > 0 && (
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-1">
              Applications
            </h3>
            <p className="text-sm text-muted-foreground mb-4 sm:mb-5 max-w-xl">
              Techniques you use <span className="text-foreground">after</span> data is ordered — e.g.
              binary search on a sorted array (compare with a BST, which stores order in the tree).
            </p>
            <StaggeredList
              items={APPLICATIONS_GRID}
              startIndex={ALGORITHMS_GRID.length}
            />
          </div>
        )}
      </div>
    </section>
  );
}
