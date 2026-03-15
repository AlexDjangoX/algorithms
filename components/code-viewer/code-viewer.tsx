"use client";

import { Highlight, themes } from "prism-react-renderer";

interface CodeViewerProps {
  code: string;
  highlightRange?: { start: number; end: number };
  language?: string;
  filename?: string;
}

export function CodeViewer({
  code,
  highlightRange,
  language = "typescript",
  filename = "algorithm.ts",
}: CodeViewerProps) {
  const start = highlightRange?.start ?? 0;
  const end = highlightRange?.end ?? 0;

  const ext = filename.split(".").pop()?.toUpperCase() ?? "TS";
  const extColor =
    ext === "JS" ? "#f7df1e" : ext === "TS" ? "#3178c6" : "#9ca3af";

  return (
    <div
      className="overflow-hidden rounded-2xl ring-1 ring-white/5"
      style={{ background: "#0d1117" }}
    >
      {/* VS Code-style tab header */}
      <div
        className="flex items-end border-b border-white/5 px-2 pt-2"
        style={{ background: "#010409" }}
      >
        <div
          className="flex items-center gap-2 rounded-t-md border-t border-l border-r border-white/10 px-4 py-2"
          style={{ background: "#0d1117" }}
        >
          <span
            className="text-xs font-bold"
            style={{ color: extColor }}
          >
            {ext}
          </span>
          <span className="text-xs text-zinc-300">{filename}</span>
          <span className="ml-2 cursor-default text-xs text-zinc-600">×</span>
        </div>
      </div>

      {/* Code content */}
      <div className="max-h-96 overflow-y-auto">
        <Highlight theme={themes.vsDark} code={code} language={language}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} m-0 overflow-x-auto p-4 text-sm leading-relaxed`}
              style={{ ...style, background: "transparent" }}
            >
              {tokens.map((line, i) => {
                const lineNum = i + 1;
                const isHighlighted =
                  highlightRange && lineNum >= start && lineNum <= end;

                return (
                  <div
                    key={i}
                    {...getLineProps({ line })}
                    className={`relative flex transition-colors duration-150 ${
                      isHighlighted ? "bg-rose-500/10" : ""
                    }`}
                  >
                    <span
                      className={`w-10 shrink-0 select-none pr-4 text-right font-mono text-xs leading-relaxed ${
                        isHighlighted ? "text-rose-400" : "text-zinc-600"
                      }`}
                    >
                      {lineNum}
                    </span>
                    {isHighlighted && (
                      <span className="absolute left-0 top-0 h-full w-[3px] rounded-r bg-rose-500" />
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
          )}
        </Highlight>
      </div>
    </div>
  );
}
