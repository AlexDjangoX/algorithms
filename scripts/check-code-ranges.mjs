#!/usr/bin/env node
/**
 * Verifies every numeric `{ start, end }` codeRange in algorithms/<slug>/algorithm.ts
 * lies within 1..lineCount of algorithms/<slug>/code.ts (1-based, inclusive).
 *
 * Run: node scripts/check-code-ranges.mjs
 *      npm run check:code-ranges
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

/** Must match live implementations under algorithms/ */
const SLUGS = [
  'library-sort',
  'bubble-sort',
  'insertion-sort',
  'bead-sort',
  'merge-sort',
  'quick-sort',
  'heap-sort',
  'binary-search',
  'binary-search-tree',
];

const RANGE_RE = /\{\s*start:\s*(\d+)\s*,\s*end:\s*(\d+)\s*\}/g;

function lineCount(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  if (raw.length === 0) return 0;
  let n = 1;
  for (let i = 0; i < raw.length; i++) {
    if (raw.charCodeAt(i) === 10) n++;
  }
  return n;
}

let errors = 0;

for (const slug of SLUGS) {
  const algoPath = path.join(ROOT, 'algorithms', slug, 'algorithm.ts');
  const codePath = path.join(ROOT, 'algorithms', slug, 'code.ts');

  if (!fs.existsSync(algoPath)) {
    console.error(`Missing ${algoPath}`);
    errors++;
    continue;
  }
  if (!fs.existsSync(codePath)) {
    console.error(`Missing ${codePath}`);
    errors++;
    continue;
  }

  const lines = lineCount(codePath);
  const src = fs.readFileSync(algoPath, 'utf8');
  let m;
  RANGE_RE.lastIndex = 0;
  while ((m = RANGE_RE.exec(src)) !== null) {
    const start = Number(m[1]);
    const end = Number(m[2]);
    const line = src.slice(0, m.index).split('\n').length;

    if (start < 1 || end < start) {
      console.error(
        `${slug}/algorithm.ts:${line} invalid range { start: ${start}, end: ${end} }`,
      );
      errors++;
      continue;
    }
    if (end > lines) {
      console.error(
        `${slug}/algorithm.ts:${line} codeRange { start: ${start}, end: ${end} } exceeds ${slug}/code.ts (${lines} lines)`,
      );
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`\ncheck-code-ranges: ${errors} problem(s).`);
  process.exit(1);
}

console.log(
  `check-code-ranges: OK (${SLUGS.length} algorithms, all codeRange spans fit code.ts).`,
);
