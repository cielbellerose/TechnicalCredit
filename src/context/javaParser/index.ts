import { Parser, Language, Node } from "web-tree-sitter";
import * as path from "path";
import { ConstructMetrics, DECLARATION_TYPES } from "./types";
import { nodeAnnotations } from "./helpers";
import { extractClassMetrics, extractInterfaceMetrics } from "./extractors";

export type { ConstructMetrics } from "./types";

// Memoize the init promise so concurrent callers share the same initialisation.
let _parserPromise: Promise<Parser> | null = null;

function getParser(): Promise<Parser> {
  if (!_parserPromise) {
    _parserPromise = (async () => {
      await Parser.init({
        locateFile: (_name: string) => path.join(__dirname, "web-tree-sitter.wasm"),
      });
      const Java = await Language.load(path.join(__dirname, "tree-sitter-java.wasm"));
      const p = new Parser();
      p.setLanguage(Java);
      return p;
    })();
  }
  return _parserPromise;
}

const CONSTRUCT_TYPE_MAP: Record<string, ConstructMetrics["constructType"]> = {
  class_declaration: "class",
  interface_declaration: "interface",
  enum_declaration: "enum",
  method_declaration: "method",
  field_declaration: "field",
};

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

    return {
      constructType: CONSTRUCT_TYPE_MAP[node.type] ?? "unknown",
      name: node.childForFieldName("name")?.text ?? null,
      annotations: nodeAnnotations(node),
      classMetrics: node.type === "class_declaration" ? extractClassMetrics(node, importLines) : null,
      interfaceMetrics: node.type === "interface_declaration" ? extractInterfaceMetrics(node) : null,
    };
  } catch {
    return null;
  }
}
