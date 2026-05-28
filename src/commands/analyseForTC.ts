import * as vscode from 'vscode';


/**
 * Registers the "Analyse for TC" command in the editor context menu (on right-click).
 *
 * @param context - The extension context used to manage the command's lifecycle.
 */
export function registerAnalyseForTC(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('technicalcredit.analyseForTC', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('Analyse for TC: no active editor.');
			return;
		}

		// Placeholder values for "Analyze for TC" command
		const selection = editor.selection;
		const range = selection.isEmpty
			? editor.document.getWordRangeAtPosition(selection.active)
			: selection;
		const text = range ? editor.document.getText(range) : '';
		const language = editor.document.languageId; // e.g. 'javascript', 'python'

		// TODO: hand off to AI
		vscode.window.showInformationMessage(
			`Analyse for TC — ${editor.document.fileName} (${language}): ${text.length} chars selected`
		);
	});

	context.subscriptions.push(disposable);
}
