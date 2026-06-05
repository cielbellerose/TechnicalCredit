import * as vscode from 'vscode';

import { buildContext } from '@/context/buildContext';
import { SYSTEM_PROMPT } from '@/prompts/systemPrompt';
import { callClaude } from '@/utils/claude';
import { formatTCComment, TCResult } from '@/comment/formatComment';
import { PendingAnnotation } from '@/comment/pendingAnnotation';
import { createUserPrompt } from './prompts/userPrompts';
import {
  createHeuristicPrompt,
  HEURISTIC_CATEGORIES,
} from './prompts/heuristicPrompts';

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
        const results: TCResult[] = [];

        // Create claude calls for all heuristics
        await Promise.all(
          HEURISTIC_CATEGORIES.map(async (heuristic) => {
            const heuristicPrompt = createHeuristicPrompt(heuristic);
            const result = await callClaude<TCResult>(
              SYSTEM_PROMPT + '\n\n' + heuristicPrompt,
              userPrompt,
            );
            results.push(result);
          }),
        );

        const candidates = results.filter((r) => r.is_tc_candidate);

        if (candidates.length > 0) {
          const comments = candidates.map((r) =>
            formatTCComment(r, context.insertIndent),
          );
          await controller.previewAll(editor, comments, context.insertLine);
        } else {
          vscode.window.showInformationMessage('No TC detected in this class.');
        }
      } catch (e) {
        vscode.window.showErrorMessage(`Analyse for TC failed: ${e}`);
      }
    },
  );
}
