/** The structured Technical Credit analysis returned by the model. */
export interface TCResult {
  is_tc_candidate: boolean;
  confidence: number;
  category: string;
  benefit: string;
  conditions: string;
  signals: string[];
  not_tc_reason: string | null;
}

/** Wraps a value in single quotes, escaping any single quotes it contains. */
function quote(value: string): string {
  return `'${value.replace(/'/g, "\\'")}'`;
}

/**
 * Renders a TC result as a `@TechnicalCredit({ … })` annotation, indented to
 * align with the analysed code.
 */
export function formatTCComment(result: TCResult, indent: string): string {
  const fields = [
    `benefit: ${quote(result.benefit)},`,
    `category: ${quote(result.category)},`,
    `conditions: ${quote(result.conditions)},`,
    `signals: [${result.signals.map(quote).join(", ")}],`,
    `confidence: ${result.confidence},`,
    // Placeholder until ADR linking is implemented.
    `adr: 'ADR-000',`,
  ];
  const body = fields.map((line) => `${indent}${line}`).join("\n");
  return `${indent}@TechnicalCredit({\n${body}\n${indent}})`;
}
