import * as vscode from "vscode";

import { registerAnalyseForTC } from "./commands/analyseForTC";
import { setExtensionPath } from "./context/javaParser";

export function activate(context: vscode.ExtensionContext) {
  setExtensionPath(context.extensionPath);
  
  registerAnalyseForTC(context);
}

export function deactivate() {}
