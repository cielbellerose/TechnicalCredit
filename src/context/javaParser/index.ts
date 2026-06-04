import { Parser, Language, Node } from 'web-tree-sitter';
import * as path from 'path';
import * as fs from 'fs';
import { ConstructMetrics, DECLARATION_TYPES } from './types';
import { nodeAnnotations } from './helpers';
import { extractClassMetrics, extractInterfaceMetrics } from './extractors';

export type { ConstructMetrics } from './types';

let _parserPromise: Promise<Parser> | null = null;

/** Initializes the Java parser from the extension's bundled wasm files; must be called once from `activate()` before any analysis runs. */
export function setExtensionPath(extensionPath: string): void {
  if (_parserPromise) {
    return;
  }
  const wasmDir = path.join(extensionPath, 'dist');
  _parserPromise = initParser(wasmDir);
}

/** Loads and configures the tree-sitter parser with the Java grammar, wiring the wasm instantiation callback manually to support the bundled environment. */
async function initParser(wasmDir: string): Promise<Parser> {
  const treeSitterBytes = fs.readFileSync(
    path.join(wasmDir, 'web-tree-sitter.wasm'),
  );
  const javaBytes = fs.readFileSync(
    path.join(wasmDir, 'tree-sitter-java.wasm'),
  );

  await Parser.init({
    instantiateWasm(
      imports: WebAssembly.Imports,
      receive: (
        instance: WebAssembly.Instance,
        module: WebAssembly.Module,
      ) => void,
    ) {
      WebAssembly.instantiate(treeSitterBytes, imports).then((result) =>
        receive(result.instance, result.module),
      );
      return {};
    },
  });

  const Java = await Language.load(new Uint8Array(javaBytes));
  const parser = new Parser();
  parser.setLanguage(Java);
  return parser;
}

/** Returns the initialized parser promise, throwing if `setExtensionPath` was never called. */
function getParser(): Promise<Parser> {
  if (!_parserPromise) {
    throw new Error(
      'Java parser not initialized — call setExtensionPath first',
    );
  }
  return _parserPromise;
}

const CONSTRUCT_TYPE_MAP: Record<string, ConstructMetrics['constructType']> = {
  class_declaration: 'class',
  interface_declaration: 'interface',
  enum_declaration: 'enum',
  method_declaration: 'method',
  field_declaration: 'field',
};

/** Parses the Java source, walks the AST from the cursor position to the nearest declaration, and returns structural metrics for that construct and its enclosing class. */
export async function extractMetrics(
  source: string,
  selectionRow: number,
  selectionCol: number,
  importLines: string[],
): Promise<ConstructMetrics | null> {
  try {
    const parser = await getParser();
    const tree = parser.parse(source);
    if (!tree) {
      return null;
    }

    let node: Node | null = tree.rootNode.descendantForPosition({
      row: selectionRow,
      column: selectionCol,
    });
    while (node && !DECLARATION_TYPES.has(node.type)) {
      node = node.parent;
    }

    if (!node) {
      return null;
    }

    let enclosingClass: Node | null = node.parent;
    while (
      enclosingClass &&
      enclosingClass.type !== 'class_declaration' &&
      enclosingClass.type !== 'interface_declaration'
    ) {
      enclosingClass = enclosingClass.parent;
    }

    const isClassOrInterface =
      node.type === 'class_declaration' || node.type === 'interface_declaration';
    const classNode = isClassOrInterface ? node : enclosingClass;

    if (!classNode) {
      return null;
    }

    return {
      constructType: CONSTRUCT_TYPE_MAP[node.type] ?? 'unknown',
      name: node.childForFieldName('name')?.text ?? null,
      annotations: nodeAnnotations(node),
      startRow: node.startPosition.row,
      enclosingClassStartRow: enclosingClass?.startPosition.row ?? null,
      classSource: classNode.text,
      classMetrics:
        node.type === 'class_declaration'
          ? extractClassMetrics(node, importLines)
          : null,
      interfaceMetrics:
        node.type === 'interface_declaration'
          ? extractInterfaceMetrics(node)
          : null,
    };
  } catch (e) {
    console.error('extractMetrics failed:', e);
    return null;
  }
}
