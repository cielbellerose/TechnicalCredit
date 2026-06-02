import * as vscode from "vscode";

const FILE_LINE_THRESHOLD = 300;
const SURROUNDING_LINES = 100;

export function buildContext(editor: vscode.TextEditor): {
  selectedCode: string;
  fileName: string;
  language: string;
  fileContent: string;
  packageDeclaration: string | null;
  importLines: string[];
  insertLine: number;
  insertIndent: string;
} {
  const document = editor.document;
  const selection = editor.selection;

  const range = selection.isEmpty
    ? editor.document.getWordRangeAtPosition(selection.active)
    : selection;
  const selectedCode = range ? document.getText(range) : "";

  // Where an accepted TC comment should be inserted: the line above the
  // selection (or word at cursor), matching that line's indentation.
  const insertLine = range ? range.start.line : selection.active.line;
  const insertIndent = /^\s*/.exec(document.lineAt(insertLine).text)?.[0] ?? "";

  const allLines = document.getText().split("\n");
  const lineCount = allLines.length;

  // Identify selected lines and what surrounding context to include based on file length
  let fileContent: string;
  if (lineCount <= FILE_LINE_THRESHOLD) {
    fileContent = allLines.join("\n");
  } else {
    const anchorLine = selection.isEmpty
      ? selection.active.line
      : selection.anchor.line;
    const start = Math.max(0, anchorLine - SURROUNDING_LINES / 2);
    const end = Math.min(lineCount, anchorLine + SURROUNDING_LINES / 2);
    fileContent = allLines.slice(start, end).join("\n");
  }

  const packageDeclaration =
    allLines.find((line) => /^\s*package\s+[\w.]+\s*;/.test(line))?.trim() ??
    null;

  const importLines = allLines
    .filter((line) => /^\s*import\s+/.test(line))
    .map((line) => line.trim());

  return {
    selectedCode,
    fileName: document.fileName,
    language: document.languageId,
    fileContent,
    packageDeclaration,
    importLines,
    insertLine,
    insertIndent,
  };
}
