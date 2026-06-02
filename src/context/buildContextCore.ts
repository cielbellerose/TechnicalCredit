/**
 * Pure context-assembly logic, with no vscode dependency.
 *
 * {@link file://./buildContext.ts buildContext.ts} executes at module load
 * for vscode commands. Tests import from here instead and feed plain data.
 */

const FILE_LINE_THRESHOLD = 300;
const SURROUNDING_LINES = 100;

export interface TCContext {
  selectedCode: string;
  fileName: string;
  language: string;
  fileContent: string;
  packageDeclaration: string | null;
  importLines: string[];
}

export interface ContextSource {
  fileContent: string;
  fileName: string;
  language: string;
  selectedCode: string;
  /** Line used to centre the surrounding-lines window for large files. */
  anchorLine: number;
}

/**
 * Build the context payload from plain source data.
 *
 * @param src - File text, identity, the resolved selection, and an anchor line.
 * @returns The context payload sent on for analysis.
 */
export function buildContextFromSource(src: ContextSource): TCContext {
  const allLines = src.fileContent.split("\n");
  const lineCount = allLines.length;

  // Identify selected lines and what surrounding context to include based on file length
  let fileContent: string;
  if (lineCount <= FILE_LINE_THRESHOLD) {
    fileContent = allLines.join("\n");
  } else {
    const start = Math.max(0, src.anchorLine - SURROUNDING_LINES / 2);
    const end = Math.min(lineCount, src.anchorLine + SURROUNDING_LINES / 2);
    fileContent = allLines.slice(start, end).join("\n");
  }

  const packageDeclaration =
    allLines.find((line) => /^\s*package\s+[\w.]+\s*;/.test(line))?.trim() ??
    null;

  const importLines = allLines
    .filter((line) => /^\s*import\s+/.test(line))
    .map((line) => line.trim());

  return {
    selectedCode: src.selectedCode,
    fileName: src.fileName,
    language: src.language,
    fileContent,
    packageDeclaration,
    importLines,
  };
}
