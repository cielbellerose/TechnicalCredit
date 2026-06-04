import * as vscode from 'vscode';

import { extractMetrics, type ConstructMetrics } from '@/context/javaParser';

/** Full context passed to the analyse command. */
export interface TcContext {
  fileName: string;
  language: string;
  importLines: string[];
  constructMetrics: ConstructMetrics | null;
  insertLine: number;
  insertIndent: string;
}

/** Builds the full TC context from the active editor state, including Java construct metrics. */
export async function buildContext(editor: vscode.TextEditor): Promise<TcContext> {
  const { anchorLine, anchorCol } = resolveAnchor(editor);
  const fullSource = editor.document.getText();

  const importLines = extractImports(fullSource);

  const constructMetrics =
    editor.document.languageId === 'java'
      ? await extractMetrics(fullSource, anchorLine, anchorCol, importLines)
      : null;

  // Calculate line and indent to insert technical credit comment
  const insertLine = resolveInsertLine(constructMetrics, anchorLine);
  const insertIndent = editor.document.lineAt(insertLine).text.match(/^\s*/)?.[0] ?? '';

  return {
    importLines,
    fileName: editor.document.fileName,
    language: editor.document.languageId,
    constructMetrics,
    insertLine,
    insertIndent,
  };
}

/** Returns the cursor anchor position from the editor selection. */
function resolveAnchor(editor: vscode.TextEditor) {
  const { selection } = editor;
  return {
    anchorLine: selection.isEmpty ? selection.active.line : selection.anchor.line,
    anchorCol: selection.isEmpty ? selection.active.character : selection.anchor.character,
  };
}

/** Extracts import lines (including the package declaration) from raw source. */
export function extractImports(fileContent: string): string[] {
  const allLines = fileContent.split('\n');
  const pkg = extractPackageDeclaration(allLines);
  const imports = extractImportLines(allLines);
  return pkg ? [pkg, ...imports] : imports;
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

/**
 * Returns the line above which the TC annotation should be inserted.
 * For class/interface constructs uses their own declaration line; for methods and
 * fields uses the enclosing class line. Falls back to the cursor anchor line for non-Java files.
 */
function resolveInsertLine(
  constructMetrics: ConstructMetrics | null,
  anchorLine: number,
): number {
  if (!constructMetrics) {
    return anchorLine;
  }

  const { constructType, startRow, enclosingClassStartRow } = constructMetrics;

  return constructType === 'class' || constructType === 'interface'
    ? startRow
    : enclosingClassStartRow!;
}
