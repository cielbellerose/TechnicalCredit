import * as vscode from 'vscode';

import { extractMetrics, type ConstructMetrics } from '@/context/javaParser';

const FILE_LINE_THRESHOLD = 300;
const SURROUNDING_LINES = 100;

/** The computed fields derived from raw file source. */
export interface SourceContext {
  fileContent: string;
  packageDeclaration: string | null;
  importLines: string[];
  insertLine: number;
  insertIndent: string;
}

/** Full context passed to the analyse command. */
export interface TcContext extends SourceContext {
  selectedCode: string;
  fileName: string;
  language: string;
  constructMetrics: ConstructMetrics | null;
}

/** Trims the file to a ±50-line window around the anchor for files over the line threshold. */
export function resolveFileContent(allLines: string[], anchorLine: number): string {
  if (allLines.length <= FILE_LINE_THRESHOLD) {
    return allLines.join('\n');
  }
  const start = Math.max(0, anchorLine - SURROUNDING_LINES / 2);
  const end = Math.min(allLines.length, anchorLine + SURROUNDING_LINES / 2);
  return allLines.slice(start, end).join('\n');
}

/** Finds the package declaration line in the file, or returns null if absent. */
export function extractPackageDeclaration(allLines: string[]): string | null {
  return allLines.find((line) => /^\s*package\s+[\w.]+\s*;/.test(line))?.trim() ?? null;
}

/** Returns all import statement lines, trimmed of leading whitespace. */
export function extractImportLines(allLines: string[]): string[] {
  return allLines
    .filter((line) => /^\s*import\s+/.test(line))
    .map((line) => line.trim());
}

/** Extracts selected code and anchor position from the editor selection or cursor word. */
function resolveSelection(editor: vscode.TextEditor) {
  const { document, selection } = editor;

  if (selection.isEmpty) {
    const range = document.getWordRangeAtPosition(selection.active);
    return {
      selectedCode: range ? document.getText(range) : '',
      anchorLine: selection.active.line,
      anchorCol: selection.active.character,
    };
  }

  return {
    selectedCode: document.getText(selection),
    anchorLine: selection.anchor.line,
    anchorCol: selection.anchor.character,
  };
}

/**
 * Returns the line above which the TC annotation should be inserted.
 * For class/interface constructs uses their own declaration line; for methods and
 * fields uses the enclosing class line. Falls back to the cursor anchor line.
 */
function resolveInsertLine(
  constructMetrics: ConstructMetrics | null,
  anchorLine: number,
): number {
  if (!constructMetrics) {
    return anchorLine;
  }

  const { constructType, startRow, enclosingClassStartRow } = constructMetrics;

  if (constructType === 'class' || constructType === 'interface') {
    return startRow;
  }

  return enclosingClassStartRow ?? anchorLine;
}

/** Derives file content, package declaration, import lines, and insert position from raw source. */
export function buildContextFromSource(
  fileContent: string,
  anchorLine: number,
  insertLine?: number,
): SourceContext {
  const allLines = fileContent.split('\n');
  const resolvedInsertLine = insertLine ?? anchorLine;

  return {
    fileContent: resolveFileContent(allLines, anchorLine),
    packageDeclaration: extractPackageDeclaration(allLines),
    importLines: extractImportLines(allLines),
    insertLine: resolvedInsertLine,
    insertIndent: /^\s*/.exec(allLines[resolvedInsertLine] ?? '')?.[0] ?? '',
  };
}

/** Builds the full TC context from the active editor state, including Java construct metrics. */
export async function buildContext(editor: vscode.TextEditor): Promise<TcContext> {
  const { selectedCode, anchorLine, anchorCol } = resolveSelection(editor);
  const fullSource = editor.document.getText();

  const sourceCtx = buildContextFromSource(fullSource, anchorLine);

  const constructMetrics =
    editor.document.languageId === 'java'
      ? await extractMetrics(fullSource, anchorLine, anchorCol, sourceCtx.importLines)
      : null;

  const insertLine = resolveInsertLine(constructMetrics, anchorLine);
  const insertIndent = editor.document.lineAt(insertLine).text.match(/^\s*/)?.[0] ?? '';

  return {
    ...sourceCtx,
    selectedCode,
    fileName: editor.document.fileName,
    language: editor.document.languageId,
    constructMetrics,
    insertLine,
    insertIndent,
  };
}
