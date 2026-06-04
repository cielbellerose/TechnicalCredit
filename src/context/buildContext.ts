import * as vscode from 'vscode';

import {
  buildContextFromSource,
  type TCContext,
} from '@/context/buildContextCore';
import { extractMetrics, type ConstructMetrics } from '@/context/javaParser';

export type { TCContext };

export interface TcContext extends TCContext {
  constructMetrics: ConstructMetrics | null;
  insertLine: number;
  insertIndent: string;
}

/** Builds the full TC context from the active editor state, including Java construct metrics. */
export async function buildContext(
  editor: vscode.TextEditor,
): Promise<TcContext> {
  const document = editor.document;
  const { selectedCode, anchorLine, anchorCol } = resolveSelection(editor);
  const fullSource = document.getText();

  const ctx = buildContextFromSource({
    fileContent: fullSource,
    fileName: document.fileName,
    language: document.languageId,
    selectedCode,
    anchorLine,
  });

  const constructMetrics =
    document.languageId === 'java'
      ? await extractMetrics(fullSource, anchorLine, anchorCol, ctx.importLines)
      : null;

  const insertLine = resolveInsertLine(constructMetrics, anchorLine);
  const insertIndent =
    document.lineAt(insertLine).text.match(/^\s*/)?.[0] ?? '';

  return { ...ctx, constructMetrics, insertLine, insertIndent };
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
