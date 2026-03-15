'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import type { Algorithm } from '@/lib/data/algorithms';

const BAR_HEIGHTS = [60, 35, 80, 50, 95];

interface AlgorithmCardProps {
  algorithm: Algorithm;
}

export function AlgorithmCard({ algorithm }: AlgorithmCardProps) {
  const { isDark } = useTheme();
  const isLive = algorithm.status === 'live';

  const cardStyles = isDark
    ? 'bg-[hsl(240_12%_8%/0.6)] backdrop-blur-xs border-white/8 hover:bg-[hsl(240_12%_12%/0.8)] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10'
    : 'bg-[hsl(0_0%_100%/0.8)] backdrop-blur-xs border-border hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10';

  const card = (
    <div
      className={`group relative rounded-xl sm:rounded-2xl border p-4 sm:p-6 transition-all duration-300 ${cardStyles} ${isLive ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-50 cursor-default'}`}
    >
      {!isLive && (
        <span
          className="absolute top-4 right-4 font-mono text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
          aria-label="Coming soon"
        >
          Coming Soon
        </span>
      )}

      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-4">
        {`// ${algorithm.category.toLowerCase()}`}
      </p>

      <div className="flex items-end gap-1 mb-4 h-10" aria-hidden>
        {BAR_HEIGHTS.map((h) => (
          <div
            key={h}
            className="w-1.5 rounded-full bg-linear-to-t from-primary to-accent"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
        {algorithm.name}
      </h3>

      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        {algorithm.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="font-mono text-[11px] px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
          Time: {algorithm.complexity.time}
        </span>
        <span className="font-mono text-[11px] px-2.5 py-1 rounded-full border border-accent/20 bg-accent/10 text-accent">
          Space: {algorithm.complexity.space}
        </span>
      </div>

      {isLive && (
        <div className="flex items-center gap-1 text-sm text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          Explore <ArrowRight size={14} aria-hidden />
        </div>
      )}
    </div>
  );

  if (isLive) {
    return (
      <Link href={`/algorithms/${algorithm.slug}`} className="block">
        {card}
      </Link>
    );
  }

  return card;
}
