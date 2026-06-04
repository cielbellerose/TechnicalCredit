import * as vscode from 'vscode';

import { buildContext } from '@/context/buildContext';
import { SYSTEM_PROMPT } from '@/prompts/systemPrompt';
import { callClaude } from '@/utils/claude';
import { formatTCComment, TCResult } from '@/comment/formatComment';
import { PendingAnnotation } from '@/comment/pendingAnnotation';
import { createUserPrompt } from './prompts/userPrompts';

/** Analyses the active editor selection for Technical Credit patterns and previews an annotation if found. */
export async function analyseForTC(controller: PendingAnnotation) {
  // Check for active editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('Analyse for TC: no active editor.');
    return;
  }

  const context = await buildContext(editor);

  if (!context) {
    vscode.window.showErrorMessage(
      'Analyse for TC: cursor is not inside a class or interface.',
    );
    return;
  }

  const userPrompt = createUserPrompt(context);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Analysing for TC…',
      cancellable: false,
    },
    async () => {
      try {
        const result = await callClaude<TCResult>(SYSTEM_PROMPT, userPrompt);
        if (result.is_tc_candidate) {
          const comment = formatTCComment(result, context.insertIndent);
          await controller.preview(editor, comment, context.insertLine);
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
