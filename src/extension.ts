import * as vscode from "vscode";

import { registerAnalyseForTC } from "./commands/analyseForTC";
import { registerTCCommentUI } from "./comment/pendingAnnotation";

export function activate(context: vscode.ExtensionContext) {
  const controller = registerTCCommentUI(context);
  registerAnalyseForTC(context, controller);
}

export function deactivate() {}
