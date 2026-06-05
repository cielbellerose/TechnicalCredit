import * as vscode from 'vscode';

interface Pending {
  id: string;
  uri: vscode.Uri;
  /** Range covering the inserted comment lines. */
  range: vscode.Range;
}

/**
 * Tracks in-flight TC annotation previews and surfaces Accept / Dismiss CodeLenses
 * above each one. Previewed comments are real inserted text marked as pending via a
 * dimmed decoration: Accept keeps the text and clears styling, Dismiss deletes the lines.
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
   * Inserts all comment texts above the given line in a single edit, stacking them
   * in order. Each annotation gets its own Accept / Dismiss CodeLens.
   */
  async previewAll(
    editor: vscode.TextEditor,
    texts: string[],
    insertLine: number,
  ): Promise<void> {
    if (this.pendingItems.length > 0) {
      await this.dismissAll();
    }

    await editor.edit((builder) => {
      builder.insert(
        new vscode.Position(insertLine, 0),
        texts.map((t) => `${t}\n`).join(''),
      );
    });

    let rangeStart = insertLine;
    for (const text of texts) {
      const lines = text.split('\n');
      const range = new vscode.Range(
        rangeStart,
        0,
        rangeStart + lines.length - 1,
        lines[lines.length - 1].length,
      );
      this.pendingItems.push({ id: crypto.randomUUID(), uri: editor.document.uri, range });
      rangeStart += lines.length;
    }

    this.refreshDecorations();
    this.changed.fire();
  }

  /** ACCEPT: Keeps the annotation text, removes the pending styling. */
  accept(id: string): void {
    this.pendingItems = this.pendingItems.filter((p) => p.id !== id);
    this.refreshDecorations();
    this.changed.fire();
  }

  /** DISMISS: Deletes the annotation text and updates ranges of subsequent items. */
  async dismiss(id: string): Promise<void> {
    const index = this.pendingItems.findIndex((p) => p.id === id);
    const item = this.pendingItems[index];
    if (!item) {
      return;
    }

    const deletedLineCount = item.range.end.line - item.range.start.line + 1;
    this.pendingItems.splice(index, 1);

    // Shift ranges of items that were below the deleted one
    for (let i = index; i < this.pendingItems.length; i++) {
      const p = this.pendingItems[i];
      this.pendingItems[i] = {
        ...p,
        range: new vscode.Range(
          p.range.start.line - deletedLineCount,
          p.range.start.character,
          p.range.end.line - deletedLineCount,
          p.range.end.character,
        ),
      };
    }

    this.refreshDecorations();
    this.changed.fire();

    const edit = new vscode.WorkspaceEdit();
    edit.delete(
      item.uri,
      new vscode.Range(
        new vscode.Position(item.range.start.line, 0),
        new vscode.Position(item.range.end.line + 1, 0),
      ),
    );
    await vscode.workspace.applyEdit(edit);
  }

  /** Discards all pending annotations. */
  async dismissAll(): Promise<void> {
    if (this.pendingItems.length === 0) {
      return;
    }

    const items = [...this.pendingItems].reverse();
    this.pendingItems = [];
    this.refreshDecorations();
    this.changed.fire();

    const edit = new vscode.WorkspaceEdit();
    for (const item of items) {
      edit.delete(
        item.uri,
        new vscode.Range(
          new vscode.Position(item.range.start.line, 0),
          new vscode.Position(item.range.end.line + 1, 0),
        ),
      );
    }
    await vscode.workspace.applyEdit(edit);
  }

  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    return this.pendingItems
      .map((p) => ({ p }))
      .filter(({ p }) => p.uri.toString() === document.uri.toString())
      .flatMap(({ p }) => {
        const anchor = new vscode.Range(p.range.start, p.range.start);
        return [
          new vscode.CodeLens(anchor, {
            title: '$(check) Accept',
            command: 'technicalcredit.acceptTCComment',
            arguments: [p.id],
          }),
          new vscode.CodeLens(anchor, {
            title: '$(x) Dismiss',
            command: 'technicalcredit.dismissTCComment',
            arguments: [p.id],
          }),
        ];
      });
  }

  private refreshDecorations(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      editor.setDecorations(
        this.decoration,
        this.pendingItems
          .filter((p) => p.uri.toString() === editor.document.uri.toString())
          .map((p) => p.range),
      );
    }
  }

  dispose(): void {
    this.decoration.dispose();
    this.changed.dispose();
  }
}
