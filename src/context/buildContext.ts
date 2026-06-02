import * as vscode from "vscode";

import { buildContextFromSource, type TCContext } from "@/context/buildContextCore";
import { extractMetrics, type ConstructMetrics } from "@/context/javaParser";

export type { TCContext };

export interface TcContext extends TCContext {
  constructMetrics: ConstructMetrics | null;
}

export async function buildContext(editor: vscode.TextEditor): Promise<TcContext> {
  const document = editor.document;
  const selection = editor.selection;

  const range = selection.isEmpty
    ? document.getWordRangeAtPosition(selection.active)
    : selection;
  const selectedCode = range ? document.getText(range) : "";

  const anchorLine = selection.isEmpty ? selection.active.line : selection.anchor.line;
  const anchorCol = selection.isEmpty ? selection.active.character : selection.anchor.character;

  const fullSource = document.getText();

  const ctx = buildContextFromSource({
    fileContent: fullSource,
    fileName: document.fileName,
    language: document.languageId,
    selectedCode,
    anchorLine,
  });

  const constructMetrics =
    document.languageId === "java"
      ? await extractMetrics(fullSource, anchorLine, anchorCol, ctx.importLines)
      : null;

  return { ...ctx, constructMetrics };
}
