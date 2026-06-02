import * as vscode from 'vscode';

import { buildContext } from '@/context/buildContext';
import { SYSTEM_PROMPT } from '@/context/systemPrompt';
import { claude } from '@/claude';
import { formatTCComment, TCResult } from '@/comment/formatComment';
import { PendingAnnotation } from '@/comment/pendingAnnotation';

export function registerAnalyseForTC(
  context: vscode.ExtensionContext,
  controller: PendingAnnotation,
) {
  const disposable = vscode.commands.registerCommand(
    'technicalcredit.analyseForTC',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('Analyse for TC: no active editor.');
        return;
      }

      const tc = buildContext(editor);

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
        `\nSelected code:\n${tc.selectedCode}`,
        `\nFull file context:\n${tc.fileContent}`,
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
            const response = await claude.messages.create({
              model: 'claude-sonnet-4-20250514',
              max_tokens: 1024,
              system: SYSTEM_PROMPT,
              messages: [
                { role: 'user', content: userMessage },
                { role: 'assistant', content: '{' },
              ],
            });

            const raw = response.content
              .filter((b) => b.type === 'text')
              .map((b) => b.text)
              .join('');

            const result = JSON.parse('{' + raw) as TCResult;
            if (result.is_tc_candidate) {
              const comment = formatTCComment(result, tc.insertIndent);
              await controller.preview(editor, comment, tc.insertLine);
            } else {
              vscode.window.showInformationMessage(
                `No TC detected: ${result.not_tc_reason}`,
              );
            }
          } catch (e) {
            vscode.window.showErrorMessage(`Analyse for TC failed: ${e}`);
          }
        },
      );
    },
  );

  context.subscriptions.push(disposable);
}
