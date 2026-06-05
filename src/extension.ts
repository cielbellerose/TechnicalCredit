import * as vscode from 'vscode';

import { setExtensionPath } from './context/javaParser';
import { register } from './registry';

export function activate(context: vscode.ExtensionContext) {
  setExtensionPath(context.extensionPath);
  register(context);
}

export function deactivate() {}
