import { TCResult } from './tcResult';

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
    `signals: [${result.signals.map(quote).join(', ')}],`,
    // Placeholder until ADR linking is implemented.
    `adr: 'ADR-000',`,
  ];
  const body = fields.map((line) => `${indent}${line}`).join('\n');
  return `${indent}@TechnicalCredit({\n${body}\n${indent}})`;
}
