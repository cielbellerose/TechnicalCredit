import * as vscode from "vscode";
import { extractMetrics, ConstructMetrics } from "./javaParser";

const FILE_LINE_THRESHOLD = 300;
const SURROUNDING_LINES = 100;

export interface TcContext {
  selectedCode: string;
  fileName: string;
  language: string;
  fileContent: string;
  packageDeclaration: string | null;
  importLines: string[];
  constructMetrics: ConstructMetrics | null;
}

export async function buildContext(
  editor: vscode.TextEditor,
): Promise<TcContext> {
  const document = editor.document;
  const selection = editor.selection;

  const range = selection.isEmpty
    ? editor.document.getWordRangeAtPosition(selection.active)
    : selection;
  const selectedCode = range ? document.getText(range) : "";

  const fullSource = document.getText();
  const allLines = fullSource.split("\n");

  const anchorLine = selection.isEmpty
    ? selection.active.line
    : selection.anchor.line;
  const anchorCol = selection.isEmpty
    ? selection.active.character
    : selection.anchor.character;

  let fileContent: string;
  if (allLines.length <= FILE_LINE_THRESHOLD) {
    fileContent = fullSource;
  } else {
    const start = Math.max(0, anchorLine - SURROUNDING_LINES / 2);
    const end = Math.min(allLines.length, anchorLine + SURROUNDING_LINES / 2);
    fileContent = allLines.slice(start, end).join("\n");
  }

  const packageDeclaration =
    allLines.find((line) => /^\s*package\s+[\w.]+\s*;/.test(line))?.trim() ??
    null;

  const importLines = allLines
    .filter((line) => /^\s*import\s+/.test(line))
    .map((line) => line.trim());

  const constructMetrics =
    document.languageId === "java"
      ? await extractMetrics(fullSource, anchorLine, anchorCol, importLines)
      : null;

  return {
    selectedCode,
    fileName: document.fileName,
    language: document.languageId,
    fileContent,
    packageDeclaration,
    importLines,
    constructMetrics,
  };
}
