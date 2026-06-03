import * as vscode from 'vscode';

import { registerAnalyseForTC } from "./commands/analyseForTC";
import { setExtensionPath } from "./context/javaParser";
import { registerTCCommentUI } from "./comment/pendingAnnotation";

export function activate(context: vscode.ExtensionContext) {
  setExtensionPath(context.extensionPath);
  
  const controller = registerTCCommentUI(context);
  registerAnalyseForTC(context, controller);
}

export function deactivate() {}
