import { TCResult } from './tcResult';

/** Maximum rendered width of a single line before its text is soft-wrapped. */
const MAX_LINE_LENGTH = 80;

/** Wraps a value in single quotes, escaping any single quotes it contains. */
function quote(value: string): string {
  return `'${value.replace(/'/g, "\\'")}'`;
}

/**
 * Greedily soft-wraps `line` at word boundaries so no rendered line exceeds
 * MAX_LINE_LENGTH, prefixing the first line with `indent` and continuation lines
 * with a hanging indent. A word longer than the limit is left on its own line.
 */
function wrapLine(line: string, indent: string): string {
  const continuation = `${indent}  `;
  const words = line.split(' ');
  const lines: string[] = [];
  let current = `${indent}${words[0]}`;
  for (const word of words.slice(1)) {
    if (`${current} ${word}`.length > MAX_LINE_LENGTH) {
      lines.push(current);
      current = `${continuation}${word}`;
    } else {
      current += ` ${word}`;
    }
  }
  lines.push(current);
  return lines.join('\n');
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
    ...(result.adr ? [`adr: ${quote(result.adr)},`] : []),
  ];
  const body = fields.map((line) => wrapLine(line, indent)).join('\n');
  return `${indent}@TechnicalCredit({\n${body}\n${indent}})`;
}
