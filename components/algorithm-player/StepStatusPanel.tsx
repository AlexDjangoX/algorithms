'use client';

/**
 * Current-step narrative + variable chips. Layout is stacked so long descriptions
 * don’t fight the chip row; description area uses min + max height + scroll to
 * limit vertical jump. Chip values use foreground (not primary) for dark-mode contrast.
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
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border bg-secondary/80">
      <div className="min-h-[5.25rem] max-h-36 overflow-y-auto px-4 py-3 sm:min-h-[4.75rem] sm:max-h-32">
        <p className="text-pretty text-sm leading-relaxed text-foreground">
          {description}
        </p>
      </div>

      <div
        className="flex min-h-[2.85rem] flex-wrap content-start gap-2 border-t border-border/70 bg-background/30 px-4 py-2.5 dark:bg-background/20"
        aria-label="Step variables"
      >
        {entries.length === 0 ? (
          <span className="sr-only">No variables for this step</span>
        ) : (
          entries.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-baseline gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1 shadow-sm dark:bg-secondary/90"
            >
              <span className="font-mono text-[11px] text-muted-foreground">
                {key}
              </span>
              <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                {String(value)}
              </span>
            </span>
          ))
        )}
      </div>
    </div>
  );
}
