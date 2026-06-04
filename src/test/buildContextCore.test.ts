import { buildContextFromSource } from '@/context/buildContext';
import { loadMock } from './support/mockSource';

/**
 * Tests buildContextFromSource — the pure, vscode-free context assembler.
 *
 * Scope: HOW context is assembled (file windowing, package/import parsing).
 * WHICH constructs are TC candidates is covered in per-heuristic fixture tests.
 */

const MOCK = loadMock('MockTest.java');

describe('buildContextFromSource — assembly against MockTest.java', () => {
  test('keeps the whole file (under threshold) and finds no package/imports', () => {
    const ctx = buildContextFromSource(MOCK, 0);

    expect(ctx.fileContent).toBe(MOCK);
    expect(ctx.packageDeclaration).toBeNull();
    expect(ctx.importLines).toEqual([]);
  });
});

describe('buildContextFromSource — windowing & parsing', () => {
  test('windows ±50 lines around the anchor for large files', () => {
    const lines = Array.from({ length: 400 }, (_, i) => `L${i}`);
    const ctx = buildContextFromSource(lines.join('\n'), 200);

    const window = ctx.fileContent.split('\n');
    expect(window).toHaveLength(100);
    expect(window[0]).toBe('L150');
    expect(window[window.length - 1]).toBe('L249');
  });

  test('extracts the package declaration and trims import lines', () => {
    const ctx = buildContextFromSource(
      [
        'package com.example.app;',
        '',
        '  import java.util.List;',
        'import java.util.Map;',
        '',
        'class Foo {}',
      ].join('\n'),
      5,
    );

    expect(ctx.packageDeclaration).toBe('package com.example.app;');
    expect(ctx.importLines).toEqual([
      'import java.util.List;',
      'import java.util.Map;',
    ]);
  });
});
