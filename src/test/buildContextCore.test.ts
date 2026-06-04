import { extractImports } from '@/context/buildContext';
import { loadMock } from './support/mockSource';

/**
 * Tests extractImports — the pure, vscode-free context assembler.
 *
 * Scope: package/import extraction and merging.
 * WHICH constructs are TC candidates is covered in per-heuristic fixture tests.
 */

const MOCK = loadMock('MockTest.java');

describe('extractImports — assembly against MockTest.java', () => {
  test('finds no imports when file has none', () => {
    const ctx = extractImports(MOCK);
    expect(ctx.importLines).toEqual([]);
  });
});

describe('extractImports — package and import extraction', () => {
  test('merges package declaration as the first import line', () => {
    const ctx = extractImports(
      [
        'package com.example.app;',
        '',
        'import java.util.List;',
        'import java.util.Map;',
        '',
        'class Foo {}',
      ].join('\n'),
    );

    expect(ctx.importLines).toEqual([
      'package com.example.app;',
      'import java.util.List;',
      'import java.util.Map;',
    ]);
  });

  test('trims leading whitespace from import lines', () => {
    const ctx = extractImports('  import java.util.List;\nimport java.util.Map;');
    expect(ctx.importLines).toEqual(['import java.util.List;', 'import java.util.Map;']);
  });
});
