'use client';

/**
 * Step narrative + variables. On large screens the parent places this beside the
 * chart with h-full — the story uses flex-1 so text breathes in that column;
 * variables stay a compact footer (no tall empty chip pit). On small screens the
 * card is width-full with a viewport-capped narrative region.
 */
export function StepStatusPanel({
  description,
  variables,
}: {
  description: string;
  variables?: Record<string, string | number | boolean> | null;
}) {
  const entries =
    variables && Object.keys(variables).length > 0
      ? Object.entries(variables)
      : [];

  return (
    <div
      className={
        'flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-card/50 shadow-sm ring-1 ring-black/4 dark:bg-card/40 dark:ring-white/6 ' +
        'max-h-[min(20rem,46svh)] min-h-0 lg:max-h-none lg:h-full lg:min-h-0'
      }
    >
      <header className="shrink-0 border-b border-border/60 bg-muted/20 px-4 py-2.5 dark:bg-muted/10">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {"What's happening"}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <p className="whitespace-pre-line text-pretty text-sm leading-[1.65] text-foreground/95 sm:text-[0.9375rem]">
          {description}
        </p>
      </div>

      {entries.length > 0 ? (
        <footer className="shrink-0 border-t border-border/70 bg-muted/25 px-4 py-3 dark:bg-muted/15">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Values at this step
          </p>
          <div className="flex flex-wrap gap-2">
            {entries.map(([key, value]) => (
              <span
                key={key}
                className="inline-flex items-baseline gap-1.5 rounded-lg border border-border/90 bg-background/80 px-2.5 py-1.5 shadow-sm dark:bg-background/50"
              >
                <span className="font-mono text-[11px] text-muted-foreground">
                  {key}
                </span>
                <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                  {String(value)}
                </span>
              </span>
            ))}
          </div>
        </footer>
      ) : null}
    </div>
  );
}
