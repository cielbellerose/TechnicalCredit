import { buildContextFromSource } from '@/context/buildContext';

import { loadMock } from './support/mockSource';

/**
 * Tests buildContextFromSource — the pure, vscode-free context assembler.
 *
 * Scope: package/import extraction and merging.
 * WHICH constructs are TC candidates is covered in per-heuristic fixture tests.
 */

const MOCK = loadMock('MockTest.java');

describe('buildContextFromSource — assembly against MockTest.java', () => {
  test('finds no imports when file has none', () => {
    const ctx = buildContextFromSource(MOCK);
    expect(ctx.importLines).toEqual([]);
  });
});

describe('buildContextFromSource — package and import extraction', () => {
  test('merges package declaration as the first import line', () => {
    const ctx = buildContextFromSource(
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
    const ctx = buildContextFromSource('  import java.util.List;\nimport java.util.Map;');
    expect(ctx.importLines).toEqual(['import java.util.List;', 'import java.util.Map;']);
  });
});
