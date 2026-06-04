import * as vscode from 'vscode';

import { buildContext } from '@/context/buildContext';
import { SYSTEM_PROMPT } from '@/context/systemPrompt';
import { callClaude } from '@/utils/claude';
import { formatTCComment, TCResult } from '@/comment/formatComment';
import { PendingAnnotation } from '@/comment/pendingAnnotation';

/** Analyses the active editor selection for Technical Credit patterns and previews an annotation if found. */
export async function analyseForTC(
  editor: vscode.TextEditor,
  controller: PendingAnnotation,
): Promise<void> {
  const tc = await buildContext(editor);

  if (!tc.selectedCode.trim()) {
    vscode.window.showErrorMessage(
      'Analyse for TC: no code selected or no word at cursor.',
    );
    return;
  }

  const userMessage = [
    `Analyse the following code construct for Technical Credit patterns.`,
    `File: ${tc.fileName}  Language: ${tc.language}`,
    tc.packageDeclaration ? `Package: ${tc.packageDeclaration}` : null,
    tc.importLines.length > 0
      ? `Imports:\n${tc.importLines.join('\n')}`
      : null,
    tc.constructMetrics
      ? `Pre-extracted construct metrics (tree-sitter):\n${JSON.stringify(tc.constructMetrics, null, 2)}`
      : null,
    `Selected code:\n${tc.selectedCode}`,
    `Full file context:\n${tc.fileContent}`,
  ]
    .filter(Boolean)
    .join('\n');

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Analysing for TC…',
      cancellable: false,
    },
    async () => {
      try {
        const result = await callClaude<TCResult>(SYSTEM_PROMPT, userMessage);
        if (result.is_tc_candidate) {
          const comment = formatTCComment(result, tc.insertIndent);
          await controller.preview(editor, comment, tc.insertLine);
        } else {
          vscode.window.showInformationMessage(
            `No TC detected: ${result.not_tc_reason ?? 'no reason provided'}`,
          );
        }
      } catch (e) {
        vscode.window.showErrorMessage(`Analyse for TC failed: ${e}`);
      }
    },
  );
}
