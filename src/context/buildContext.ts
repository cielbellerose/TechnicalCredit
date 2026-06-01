import * as vscode from "vscode";

import {
  buildContextFromSource,
  type TCContext,
} from "@/context/buildContextCore";

export function buildContext(editor: vscode.TextEditor): TCContext {
  const document = editor.document;
  const selection = editor.selection;

  const range = selection.isEmpty
    ? document.getWordRangeAtPosition(selection.active)
    : selection;
  const selectedCode = range ? document.getText(range) : "";
  const anchorLine = selection.isEmpty
    ? selection.active.line
    : selection.anchor.line;

  return buildContextFromSource({
    fileContent: document.getText(),
    fileName: document.fileName,
    language: document.languageId,
    selectedCode,
    anchorLine,
  });
}
