import * as fs from 'fs';
import * as path from 'path';

export interface AdrSummary {
  id: string;
  title: string;
  summary: string;
}

const ADR_SEARCH_PATHS = [
  'docs/adr',
  'adr',
  'decisions',
  'doc/adr',
  'docs/decisions',
];

/**
 * Scans common ADR folder locations under `workspaceRoot` and returns a
 * summary (id, title, first paragraph) for each ADR found. Returns an empty
 * array if no ADR folder exists.
 *
 * Token budget: only the title + first non-empty paragraph of each file is
 * included, and the result is capped at 20 ADRs.
 */
export function findAdrs(workspaceRoot: string): AdrSummary[] {
  const adrDir = ADR_SEARCH_PATHS.map((p) => path.join(workspaceRoot, p)).find(
    (p) => fs.existsSync(p) && fs.statSync(p).isDirectory(),
  );

  if (!adrDir) {
    return [];
  }

  const files = fs
    .readdirSync(adrDir)
    .filter((f) => /\.(md|txt)$/i.test(f))
    .sort()
    .slice(0, 20);

  return files.flatMap((file) => {
    const summary = parseAdr(path.join(adrDir, file));
    return summary ? [summary] : [];
  });
}

function parseAdr(filePath: string): AdrSummary | null {
  let raw: string;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }

  const lines = raw.split('\n');

  // Extract title from the first heading line (# Title or ADR-nnn Title)
  const titleLine = lines.find(
    (l) => /^#/.test(l.trim()) || /^ADR-\d+/i.test(l.trim()),
  );
  const title =
    titleLine?.replace(/^#+\s*/, '').trim() ??
    path.basename(filePath, path.extname(filePath));

  // Extract ADR id from filename (e.g. 0007-some-title.md → ADR-0007) or title
  const fileId = path.basename(filePath).match(/^(\d+)/)?.[1];
  const titleId = title.match(/^ADR[-\s](\d+)/i)?.[1];
  const rawId = fileId ?? titleId;
  const id = rawId
    ? `ADR-${rawId.padStart(4, '0')}`
    : path.basename(filePath, path.extname(filePath));

  // First non-empty, non-heading paragraph (up to 500 chars)
  let summary = '';
  let inParagraph = false;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inParagraph) {
        break;
      }
      continue;
    }
    if (/^#/.test(trimmed)) {
      continue;
    }
    inParagraph = true;
    summary += (summary ? ' ' : '') + trimmed;
    if (summary.length >= 500) {
      break;
    }
  }

  return { id, title, summary: summary.slice(0, 500) };
}
