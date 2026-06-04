import * as vscode from 'vscode';

import { analyseForTC } from '@/commands/analyseForTC';
import { PendingAnnotation } from '@/comment/pendingAnnotation';

/** Registers all commands, providers, and subscriptions for the extension. */
export function register(context: vscode.ExtensionContext): void {
  const controller = new PendingAnnotation();

  context.subscriptions.push(
    // Disposes the pending annotation decoration and event emitter on deactivation.
    controller,

    // Surfaces Accept / Dismiss CodeLenses above any in-flight annotation preview.
    vscode.languages.registerCodeLensProvider({ scheme: 'file' }, controller),

    // Finalizes the pending annotation: removes the styling and keeps the inserted text.
    vscode.commands.registerCommand('technicalcredit.acceptTCComment', () => {
      controller.accept();
    }),

    // Discards the pending annotation by deleting the inserted lines.
    vscode.commands.registerCommand(
      'technicalcredit.dismissTCComment',
      async () => {
        await controller.dismiss();
      },
    ),

    // Analyses the active editor selection for Technical Credit patterns.
    vscode.commands.registerCommand(
      'technicalcredit.analyseForTC',
      async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showErrorMessage('Analyse for TC: no active editor.');
          return;
        }
        await analyseForTC(editor, controller);
      },
    ),
  );
}
