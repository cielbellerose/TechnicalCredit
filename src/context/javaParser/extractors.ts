import { Node } from "web-tree-sitter";
import { ConstructMetrics, NestedDeclaration, NESTED_TYPE_MAP } from "./types";
import { getModifiers, getTypeNode, nodeAnnotations, fieldNodes, resolveInterfaceNames } from "./helpers";

// Extracts all structural metrics from a class declaration: superclass, implemented interfaces,
// fields (with names, types, and final flag), constructors (with parameter types and @Autowired flag),
// method count, and any nested class/interface/enum declarations.
export function extractClassMetrics(decl: Node, importLines: string[]): ConstructMetrics["classMetrics"] {
  const body = decl.childForFieldName("body");
  const superclass =
    decl.childForFieldName("superclass")?.namedChildren.find((c) => c.type === "type_identifier")
      ?.text ?? null;
  const implementedInterfaces = resolveInterfaceNames(decl, importLines);

  if (!body) {
    return { superclass, implementedInterfaces, fields: [], finalFieldTypes: [], constructors: [], methodCount: 0, nestedDeclarations: [] };
  }

  const fields = fieldNodes(body).map((f) => {
    const mods = getModifiers(f);
    const isFinal = mods?.children.some((m) => m.text === "final") ?? false;
    const declarator = f.namedChildren.find((c) => c.type === "variable_declarator");
    return {
      name: declarator?.childForFieldName("name")?.text ?? "",
      type: getTypeNode(f)?.text ?? "",
      isFinal,
      annotations: nodeAnnotations(f),
    };
  });

  const constructors = body.namedChildren
    .filter((c) => c.type === "constructor_declaration")
    .map((ctor) => {
      const params = ctor.childForFieldName("parameters");
      const paramNodes =
        params?.namedChildren.filter(
          (p) => p.type === "formal_parameter" || p.type === "spread_parameter",
        ) ?? [];
      const hasAutowired = nodeAnnotations(ctor).includes("Autowired");
      return {
        paramCount: paramNodes.length,
        paramTypes: paramNodes.map((p) => getTypeNode(p)?.text ?? ""),
        hasAutowired,
      };
    });

  const methodCount = body.namedChildren.filter((c) => c.type === "method_declaration").length;
  const finalFieldTypes = fields.filter((f) => f.isFinal).map((f) => f.type);
  const nestedDeclarations: NestedDeclaration[] = body.namedChildren
    .filter((c) => c.type in NESTED_TYPE_MAP)
    .map((c) => ({
      type: NESTED_TYPE_MAP[c.type],
      name: c.childForFieldName("name")?.text ?? "",
      implementedInterfaces: resolveInterfaceNames(c, []).map((i) => i.name),
      annotations: nodeAnnotations(c),
    }));

  return { superclass, implementedInterfaces, fields, finalFieldTypes, constructors, methodCount, nestedDeclarations };
}

// Extracts structural metrics from an interface declaration: field count,
// method count, and any interfaces this interface extends.
export function extractInterfaceMetrics(decl: Node): ConstructMetrics["interfaceMetrics"] {
  const body = decl.childForFieldName("body");
  const extendsNode =
    decl.childForFieldName("interfaces") ??
    decl.namedChildren.find((c) => c.type === "extends_interfaces");
  const extendedInterfaces = (extendsNode?.namedChildren ?? []).flatMap((c) =>
    c.type === "interface_type_list"
      ? c.namedChildren.filter((n) => n.type === "type_identifier").map((n) => n.text)
      : c.type === "type_identifier"
        ? [c.text]
        : [],
  );

  return {
    fieldCount: body ? fieldNodes(body).length : 0,
    methodCount: body ? body.namedChildren.filter((c) => c.type === "method_declaration").length : 0,
    extendedInterfaces,
  };
}
