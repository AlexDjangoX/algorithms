/**
 * Strip comments for the code viewer when "show comments" is off.
 * Comment-only lines are removed (no blank gaps). Trailing `//` on code lines is removed.
 * Block comments (slash-star blocks) are removed entirely.
 *
 * Returns a mapping so original `codeRange` line numbers can be translated to
 * the compacted display.
 */

export function stripCodeCommentsCompact(source: string): {
  code: string;
  /** stripped line i (1-based) ↔ original source line number (1-based) */
  strippedToOriginalLine: number[];
} {
  const withoutBlocks = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = withoutBlocks.split('\n');
  const out: string[] = [];
  const strippedToOriginalLine: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i]!;
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) continue;

    const idx = line.indexOf('//');
    const codePart =
      idx === -1 ? line : line.slice(0, idx).replace(/\s+$/u, '');
    if (codePart.trim() === '') continue;

    out.push(codePart);
    strippedToOriginalLine.push(lineNum);
  }

  return { code: out.join('\n'), strippedToOriginalLine };
}

/**
 * Map an original line range to the line numbers in the stripped view.
 */
export function mapHighlightRangeToStripped(
  strippedToOriginalLine: number[],
  rangeStart: number,
  rangeEnd: number,
): { start: number; end: number } {
  if (
    rangeStart < 1 ||
    rangeEnd < 1 ||
    strippedToOriginalLine.length === 0
  ) {
    return { start: 0, end: 0 };
  }

  const indices: number[] = [];
  for (let j = 0; j < strippedToOriginalLine.length; j++) {
    const orig = strippedToOriginalLine[j]!;
    if (orig >= rangeStart && orig <= rangeEnd) {
      indices.push(j + 1);
    }
  }

  if (indices.length === 0) {
    let best = 1;
    let bestDist = Infinity;
    for (let j = 0; j < strippedToOriginalLine.length; j++) {
      const orig = strippedToOriginalLine[j]!;
      const d = Math.min(
        Math.abs(orig - rangeStart),
        Math.abs(orig - rangeEnd),
      );
      if (d < bestDist) {
        bestDist = d;
        best = j + 1;
      }
    }
    return { start: best, end: best };
  }

  return { start: Math.min(...indices), end: Math.max(...indices) };
}
