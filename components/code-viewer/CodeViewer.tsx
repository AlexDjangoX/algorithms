'use client';

import { useEffect, useRef } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from '@/components/providers/ThemeProvider';

interface CodeViewerProps {
  code: string;
  highlightRange?: { start: number; end: number };
  language?: string;
  filename?: string;
}

export function CodeViewer({
  code,
  highlightRange,
  language = 'typescript',
  filename = 'algorithm.ts',
}: CodeViewerProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();
  const start = highlightRange?.start ?? 0;
  const end = highlightRange?.end ?? 0;

  useEffect(() => {
    if (start < 1 || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const lineEl = container.querySelector(
      `[data-line-number="${start}"]`,
    ) as HTMLElement | null;
    if (!lineEl) return;
    // Scroll only the code viewer container so the page (and viz) stay put
    const lineRect = lineEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const lineTopInContent =
      container.scrollTop + (lineRect.top - containerRect.top);
    const lineHeight = lineRect.height;
    const targetScroll =
      lineTopInContent - container.clientHeight / 2 + lineHeight / 2;
    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: 'smooth',
    });
  }, [start]);

  const ext = filename.split('.').pop()?.toUpperCase() ?? 'TS';
  const extColor =
    ext === 'JS' ? '#f7df1e' : ext === 'TS' ? '#3178c6' : '#9ca3af';
  const prismTheme = isDark ? themes.vsDark : themes.vsLight;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-secondary/80 ring-1 ring-border">
      {/* VS Code-style tab header */}
      <div className="flex items-end border-b border-border bg-background/50 px-2 pt-2">
        <div className="flex items-center gap-2 rounded-t-md border border-b-0 border-border bg-secondary/80 px-4 py-2">
          <span className="text-xs font-bold" style={{ color: extColor }}>
            {ext}
          </span>
          <span className="text-xs text-muted-foreground">{filename}</span>
          <span className="ml-2 cursor-default text-xs text-muted-foreground/60">
            ×
          </span>
        </div>
      </div>

      {/* Code content */}
      <div ref={scrollContainerRef} className="max-h-96 overflow-y-auto">
        <Highlight theme={prismTheme} code={code} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => {
            const raw = (style ?? {}) as React.CSSProperties & {
              background?: string;
            };
            const restStyle = Object.fromEntries(
              Object.entries(raw).filter(([key]) => key !== 'background'),
            ) as React.CSSProperties;
            return (
              <pre
                className={`${className} m-0 overflow-x-auto p-4 text-sm leading-relaxed`}
                style={{ ...restStyle, backgroundColor: 'transparent' }}
              >
                {tokens.map((line, i) => {
                  const lineNum = i + 1;
                  const isHighlighted =
                    highlightRange && lineNum >= start && lineNum <= end;

                  return (
                    <div
                      key={i}
                      {...getLineProps({ line })}
                      data-line-number={lineNum}
                      className={`relative flex transition-colors duration-150 ${
                        isHighlighted ? 'bg-primary/10 dark:bg-primary/25' : ''
                      }`}
                    >
                      <span
                        className={`w-10 shrink-0 select-none pr-4 text-right font-mono text-xs leading-relaxed ${
                          isHighlighted
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {lineNum}
                      </span>
                      {isHighlighted && (
                        <span className="absolute left-0 top-0 h-full w-0.75 rounded-r bg-primary" />
                      )}
                      <span className="flex-1 pl-2">
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                      </span>
                    </div>
                  );
                })}
              </pre>
            );
          }}
        </Highlight>
      </div>
    </div>
  );
}
