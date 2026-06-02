/**
 * Renders the model's JSON output as a Javadoc-style block comment, indented to
 * align with the analysed code. The JSON itself is emitted verbatim — its
 * formatting is not altered.
 */
export function formatTCComment(json: string, indent: string): string {
  const body = json
    .split("\n")
    .map((line) => `${indent} * ${line}`)
    .join("\n");
  return `${indent}/**\n${body}\n${indent} */`;
}
