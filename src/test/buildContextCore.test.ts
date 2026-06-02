import { buildContextFromSource } from '../context/buildContextCore';
import { loadMock } from './support/mockSource';

/**
 * Tests buildContextFromSource (buildContextCore.ts) — the pure, vscode-free
 * context assembler. The vscode selection resolution in buildContext.ts is
 * used by the extension, not tested here.
 *
 * Scope: HOW context is assembled (file windowing, package/import parsing,
 * selection passthrough). WHICH constructs are TC candidates is a heuristic
 * concern, covered in the per-heuristic fixture tests (e.g. h1.test.ts).
 */

const MOCK = loadMock('MockTest.java');

describe('buildContextFromSource — assembly against MockTest.java', () => {
  test('keeps the whole file (under threshold) and finds no package/imports', () => {
    const ctx = buildContextFromSource({
      fileContent: MOCK,
      fileName: 'MockTest.java',
      language: 'java',
      selectedCode: 'ignored',
      anchorLine: 0,
    });

    expect(ctx.fileContent).toBe(MOCK);
    expect(ctx.fileName).toBe('MockTest.java');
    expect(ctx.language).toBe('java');
    expect(ctx.packageDeclaration).toBeNull();
    expect(ctx.importLines).toEqual([]);
  });

  test('passes the selected construct through unchanged', () => {
    const selectedCode = 'interface Greetable {\n    void greet();\n}';
    const ctx = buildContextFromSource({
      fileContent: MOCK,
      fileName: 'MockTest.java',
      language: 'java',
      selectedCode,
      anchorLine: 0,
    });

    expect(ctx.selectedCode).toBe(selectedCode);
  });
});

describe('buildContextFromSource — windowing & parsing', () => {
  test('windows ±50 lines around the anchor for large files', () => {
    const lines = Array.from({ length: 400 }, (_, i) => `L${i}`);
    const ctx = buildContextFromSource({
      fileContent: lines.join('\n'),
      fileName: 'Big.java',
      language: 'java',
      selectedCode: 'L200',
      anchorLine: 200,
    });

    const window = ctx.fileContent.split('\n');
    expect(window).toHaveLength(100);
    expect(window[0]).toBe('L150');
    expect(window[window.length - 1]).toBe('L249');
  });

  test('extracts the package declaration and trims import lines', () => {
    const ctx = buildContextFromSource({
      fileContent: [
        'package com.example.app;',
        '',
        '  import java.util.List;',
        'import java.util.Map;',
        '',
        'class Foo {}',
      ].join('\n'),
      fileName: 'Foo.java',
      language: 'java',
      selectedCode: 'class Foo {}',
      anchorLine: 5,
    });

    expect(ctx.packageDeclaration).toBe('package com.example.app;');
    expect(ctx.importLines).toEqual([
      'import java.util.List;',
      'import java.util.Map;',
    ]);
  });
});
