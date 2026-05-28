import * as vscode from 'vscode';
import { registerAnalyseForTC } from './commands/analyseForTC';

export function activate(context: vscode.ExtensionContext) {
	const helloWorld = vscode.commands.registerCommand('technicalcredit.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from TechnicalCredit!');
	});
	context.subscriptions.push(helloWorld);

	registerAnalyseForTC(context);
}

export function deactivate() {}
