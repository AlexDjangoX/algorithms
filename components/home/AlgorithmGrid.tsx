'use client';

import { useEffect, useRef, useState } from 'react';
import { AlgorithmCard } from '@/components/algorithm-card/AlgorithmCard';
import { ALGORITHMS } from '@/lib/data/algorithms';

const STAGGER_MS = 60;

export function AlgorithmGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
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
        <div className="mb-10 sm:mb-14">
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

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          role="list"
        >
          {ALGORITHMS.map((algorithm, i) => (
            <div
              key={algorithm.slug}
              className={visible ? 'animate-fade-up' : 'opacity-0'}
              style={{ animationDelay: `${i * STAGGER_MS}ms` }}
              role="listitem"
            >
              <AlgorithmCard algorithm={algorithm} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
