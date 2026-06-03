import { Node } from "web-tree-sitter";

// Returns the modifiers node (visibility, final, static, annotations) for any declaration.
// tree-sitter exposes it as a named field on most nodes but falls back to a named child.
export function getModifiers(node: Node): Node | undefined {
  return node.childForFieldName("modifiers") ?? node.namedChildren.find((c) => c.type === "modifiers");
}

// Returns the type node for a field or parameter — e.g. "DataSource", "List<String>".
// Tries the named "type" field first, then falls back to any child whose node type ends in "_type".
export function getTypeNode(node: Node): Node | undefined {
  return (
    node.childForFieldName("type") ??
    node.namedChildren.find((c) => c.type.endsWith("_type") || c.type === "type_identifier")
  );
}

// Returns the names of all annotations on a declaration node, e.g. ["Service", "Autowired"].
export function nodeAnnotations(node: Node): string[] {
  const modifiers = getModifiers(node);
  if (!modifiers) {
    return [];
  }
  return modifiers.namedChildren
    .filter((c) => c.type === "annotation" || c.type === "marker_annotation")
    .map((c) => c.childForFieldName("name")?.text ?? c.text)
    .filter(Boolean) as string[];
}

// Returns all field and constant declaration nodes from a class or interface body.
export function fieldNodes(body: Node): Node[] {
  return body.namedChildren.filter(
    (c) => c.type === "field_declaration" || c.type === "constant_declaration",
  );
}

// Returns the list of interfaces a class or interface declares it implements/extends,
// each paired with the full import line that resolves which package the interface comes from.
export function resolveInterfaceNames(
  node: Node,
  importLines: string[],
): { name: string; resolvedImport: string | null }[] {
  const interfacesNode = node.childForFieldName("interfaces");
  const typeList =
    interfacesNode?.namedChildren.find((c) => c.type === "interface_type_list") ?? interfacesNode;
  return (typeList?.namedChildren ?? [])
    .filter((c) => c.type === "type_identifier")
    .map((c) => {
      const name = c.text;
      const resolvedImport =
        importLines.find((imp) => imp.endsWith(`.${name}`) || imp.endsWith(`.${name};`)) ?? null;
      return { name, resolvedImport };
    });
}
