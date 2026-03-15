'use client';

import { ExternalLink } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? 'https://github.com';

export function Footer() {
  const { isDark } = useTheme();
  const borderClass = isDark ? 'border-white/8' : 'border-border';

  return (
    <footer
      className={`border-t px-4 py-5 sm:px-6 sm:py-6 ${borderClass}`}
      role="contentinfo"
    >
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3">
        <p className="font-mono text-[11px] sm:text-xs text-muted-foreground text-center sm:text-left">
          AlgoViz &nbsp;·&nbsp; Open Source Algorithm Visualiser
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          GitHub <ExternalLink size={13} aria-hidden />
        </a>
      </div>
    </footer>
  );
}
