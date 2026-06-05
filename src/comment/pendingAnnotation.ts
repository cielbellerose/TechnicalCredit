import * as vscode from 'vscode';

interface Pending {
  uri: vscode.Uri;
  /** Range covering the inserted comment lines. */
  range: vscode.Range;
}

/**
 * Tracks in-flight TC annotation previews and surfaces Accept / Dismiss CodeLenses
 * above each one. Previewed comments are real inserted text marked as pending via a
 * dimmed decoration: Accept keeps all text and clears styling, Dismiss deletes all
 * inserted lines.
 */
export class PendingAnnotation
  implements vscode.CodeLensProvider, vscode.Disposable
{
  private pendingItems: Pending[] = [];
  private readonly decoration: vscode.TextEditorDecorationType;
  private readonly changed = new vscode.EventEmitter<void>();

  readonly onDidChangeCodeLenses = this.changed.event;

  constructor() {
    this.decoration = vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      fontStyle: 'italic',
      color: new vscode.ThemeColor('editorGhostText.foreground'),
      backgroundColor: new vscode.ThemeColor(
        'diffEditor.insertedTextBackground',
      ),
    });
  }

  /**
   * Inserts the given comment text above the analysed code and marks it pending.
   * Successive calls stack annotations above the same line, tracking line offsets.
   */
  async preview(
    editor: vscode.TextEditor,
    text: string,
    insertLine: number,
  ): Promise<void> {
    const offset = this.pendingItems
      .filter((p) => p.uri.toString() === editor.document.uri.toString())
      .reduce((sum, p) => sum + p.range.end.line - p.range.start.line + 1, 0);

    const actualLine = insertLine + offset;

    await editor.edit((builder) => {
      builder.insert(new vscode.Position(actualLine, 0), `${text}\n`);
    });

    const lines = text.split('\n');
    const range = new vscode.Range(
      actualLine,
      0,
      actualLine + lines.length - 1,
      lines[lines.length - 1].length,
    );

    this.pendingItems.push({ uri: editor.document.uri, range });
    editor.setDecorations(
      this.decoration,
      this.pendingItems.map((p) => p.range),
    );
    this.changed.fire();
  }

  /** ACCEPT: Finalizes all pending comments — removes styling, keeps text. */
  accept(): void {
    this.clearDecoration();
    this.pendingItems = [];
    this.changed.fire();
  }

  /** DISMISS: Discards all pending comments by deleting their inserted lines. */
  async dismiss(): Promise<void> {
    if (this.pendingItems.length === 0) {
      return;
    }

    this.clearDecoration();
    const items = [...this.pendingItems];
    this.pendingItems = [];
    this.changed.fire();

    // Delete in reverse order so earlier ranges aren't shifted by later deletions
    const edit = new vscode.WorkspaceEdit();
    for (const pending of items.reverse()) {
      edit.delete(
        pending.uri,
        new vscode.Range(
          new vscode.Position(pending.range.start.line, 0),
          new vscode.Position(pending.range.end.line + 1, 0),
        ),
      );
    }
    await vscode.workspace.applyEdit(edit);
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    return this.pendingItems
      .filter((p) => p.uri.toString() === document.uri.toString())
      .flatMap((p) => {
        const anchor = new vscode.Range(p.range.start, p.range.start);
        return [
          new vscode.CodeLens(anchor, {
            title: '$(check) Accept',
            command: 'technicalcredit.acceptTCComment',
          }),
          new vscode.CodeLens(anchor, {
            title: '$(x) Dismiss',
            command: 'technicalcredit.dismissTCComment',
          }),
        ];
      });
  }

  private clearDecoration(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      editor.setDecorations(this.decoration, []);
    }
  }

  dispose(): void {
    this.decoration.dispose();
    this.changed.dispose();
  }
}
