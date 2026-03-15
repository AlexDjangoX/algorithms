"use client";

interface VariablesPanelProps {
  variables?: Record<string, string | number | boolean>;
}

export function VariablesPanel({ variables }: VariablesPanelProps) {
  if (!variables || Object.keys(variables).length === 0) {
    return (
      <div className="rounded-xl bg-zinc-900/80 p-4 ring-1 ring-white/5">
        <div className="text-xs font-medium text-zinc-500">Variables</div>
        <div className="mt-2 text-sm text-zinc-600">—</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-zinc-900/80 p-4 ring-1 ring-white/5">
      <div className="text-xs font-medium text-zinc-500">Variables</div>
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(variables).map(([key, value]) => (
          <div
            key={key}
            className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2"
          >
            <span className="font-mono text-xs text-zinc-500">{key}</span>
            <span className="font-mono text-sm font-semibold text-emerald-400">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
