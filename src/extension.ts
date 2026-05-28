// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "technicalcredit" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('technicalcredit.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from TechnicalCredit!');
	});

	const analyseForTC = vscode.commands.registerCommand('technicalcredit.analyseForTC', () => {
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

	context.subscriptions.push(disposable, analyseForTC);
}

// This method is called when your extension is deactivated
export function deactivate() {}
