export const prompt = `Look for:
- Class in a package named common, shared, core, or util that is imported across many modules — intentional shared infrastructure.
- Generic type parameters — designed to work across multiple domain types rather than one.
- Abstract class with default implementations inherited across multiple subclasses — shared algorithm or lifecycle.
- No framework imports — portable to any context, not tied to a specific runtime.
- Template Method pattern — reusable algorithm skeleton with customisable steps.

Not TC: utility class extracted for a single caller, or generic class whose type parameter is only ever instantiated with one concrete type.`;
