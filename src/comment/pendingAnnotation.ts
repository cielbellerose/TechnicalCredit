import * as vscode from "vscode";

interface Pending {
  uri: vscode.Uri;
  /** Range covering the inserted comment lines. */
  range: vscode.Range;
}

/**
 * Tracks a single in-flight TC annotation preview and surfaces an Accept /
 * Dismiss CodeLens above it. The previewed comment is real (inserted) text
 * visually marked as pending via a dimmed whole-line decoration: Accept keeps
 * the text and clears the styling, Dismiss deletes the inserted lines.
 */
export class PendingAnnotation
  implements vscode.CodeLensProvider, vscode.Disposable
{
  private pending: Pending | undefined;
  private readonly decoration: vscode.TextEditorDecorationType;
  private readonly changed = new vscode.EventEmitter<void>();

  readonly onDidChangeCodeLenses = this.changed.event;

  constructor() {
    this.decoration = vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      fontStyle: "italic",
      color: new vscode.ThemeColor("editorGhostText.foreground"),
      backgroundColor: new vscode.ThemeColor(
        "diffEditor.insertedTextBackground",
      ),
    });
  }

  /**
   * Inserts the given comment text above the analysed code and marks it
   * pending. Any previously pending preview is dismissed first.
   */
  async preview(
    editor: vscode.TextEditor,
    text: string,
    insertLine: number,
  ): Promise<void> {
    if (this.pending) {
      await this.dismiss();
    }

    await editor.edit((builder) => {
      builder.insert(new vscode.Position(insertLine, 0), `${text}\n`);
    });

    const lines = text.split("\n");
    const range = new vscode.Range(
      insertLine,
      0,
      insertLine + lines.length - 1,
      lines[lines.length - 1].length,
    );
    this.pending = { uri: editor.document.uri, range };
    editor.setDecorations(this.decoration, [range]);
    this.changed.fire();
  }

  /** ACCEPT: Finalizes the pending comment: removes the styling, keeps the text. */
  accept(): void {
    this.clearDecoration();
    this.pending = undefined;
    this.changed.fire();
  }

  /** DISMISS: Discards the pending comment by deleting pending lines. */
  async dismiss(): Promise<void> {
    const pending = this.pending;
    if (!pending) {
      return;
    }
    this.clearDecoration();
    this.pending = undefined;
    this.changed.fire();

    const edit = new vscode.WorkspaceEdit();
    edit.delete(
      pending.uri,
      new vscode.Range(
        new vscode.Position(pending.range.start.line, 0),
        new vscode.Position(pending.range.end.line + 1, 0),
      ),
    );
    await vscode.workspace.applyEdit(edit);
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const pending = this.pending;
    if (!pending || document.uri.toString() !== pending.uri.toString()) {
      return [];
    }
    const anchor = new vscode.Range(pending.range.start, pending.range.start);
    return [
      new vscode.CodeLens(anchor, {
        title: "$(check) Accept",
        command: "technicalcredit.acceptTCComment",
      }),
      new vscode.CodeLens(anchor, {
        title: "$(x) Dismiss",
        command: "technicalcredit.dismissTCComment",
      }),
    ];
  }

  private clearDecoration(): void {
    const pending = this.pending;
    if (!pending) {
      return;
    }
    for (const editor of vscode.window.visibleTextEditors) {
      if (editor.document.uri.toString() === pending.uri.toString()) {
        editor.setDecorations(this.decoration, []);
      }
    }
  }

  dispose(): void {
    this.decoration.dispose();
    this.changed.dispose();
  }
}

/**
 * Wires up the Accept/Dismiss commands and the CodeLens provider that drive the
 * inline TC annotation preview. Returns the controller so the analyse command
 * can push previews into it.
 */
export function registerTCCommentUI(
  context: vscode.ExtensionContext,
): PendingAnnotation {
  const controller = new PendingAnnotation();

  context.subscriptions.push(
    controller,
    vscode.languages.registerCodeLensProvider({ scheme: "file" }, controller),
    vscode.commands.registerCommand("technicalcredit.acceptTCComment", () => {
      controller.accept();
    }),
    vscode.commands.registerCommand(
      "technicalcredit.dismissTCComment",
      async () => {
        await controller.dismiss();
      },
    ),
  );

  return controller;
}
