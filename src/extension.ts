import * as vscode from "vscode";
import { registerAnalyseForTC } from "./commands/analyseForTC";

export function activate(context: vscode.ExtensionContext) {
  registerAnalyseForTC(context);
}

export function deactivate() {}
