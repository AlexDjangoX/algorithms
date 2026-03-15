'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { AlgorithmPlayer } from '@/components/algorithm-player/AlogorithmPlayer';
import { getAlgorithmConfig } from '@/app/lib/algorithm-registry';

interface AlgorithmPageContentProps {
  slug: string;
}

export function AlgorithmPageContent({ slug }: AlgorithmPageContentProps) {
  const config = useMemo(() => getAlgorithmConfig(slug), [slug]);
  if (!config) return null;

  const {
    name,
    description,
    complexity,
    code,
    filename,
    createGenerator,
    Visualization,
    defaultVizData,
  } = config;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-8">
        <Link
          href="/"
          className="text-sm text-muted-foreground transition-all duration-150 hover:text-foreground hover:scale-105 active:scale-95"
        >
          ← AlgoViz
        </Link>
        <span className="text-[10px] sm:text-xs text-muted-foreground text-right max-w-35 sm:max-w-none">
          Space: Play/Pause · ← →: Step
        </span>
      </div>

      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 pb-12 sm:pb-16 lg:max-w-7xl lg:px-8">
        <AlgorithmPlayer
          layout="split"
          createGenerator={createGenerator}
          code={code}
          filename={filename}
          Visualization={Visualization}
          defaultVizData={defaultVizData}
        >
          <div className="mb-4 text-center lg:text-left">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {name}
            </h1>
            <p className="mx-auto mt-1.5 max-w-2xl text-sm sm:text-base leading-snug text-muted-foreground px-0 lg:mx-0">
              {description}
            </p>

            <div className="mx-auto mt-2.5 flex max-w-120 flex-wrap items-center justify-center gap-3 sm:gap-6 rounded-lg border border-border bg-secondary/50 px-3 py-2 sm:px-5 sm:py-2.5 font-mono text-xs sm:text-sm lg:mx-0 lg:max-w-none lg:justify-start">
              <span>
                <span className="text-primary">Time: </span>
                <span className="text-foreground">{complexity.time}</span>
              </span>
              <span>
                <span className="text-primary">Space: </span>
                <span className="text-foreground">{complexity.space}</span>
              </span>
            </div>
          </div>
        </AlgorithmPlayer>
      </div>
    </div>
  );
}
