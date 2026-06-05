import { loadMock, extractType } from './mockSource';
import { SYSTEM_PROMPT } from '../../prompts/systemPrompt';
import { callClaude } from '../../utils/claude';
import { TCResult } from '../../comment/tcResult';

/**
 * Live Technical Credit analysis of a single MockTest.java construct.
 *
 * Pulls the named type out of MockTest.java (the exact slice a user would
 * highlight), sends it to Claude with the production SYSTEM_PROMPT, and returns
 * the parsed {@link TCResult}. This is the real prompt + JSON-parse path the
 * extension uses, so the heuristic tests exercise it end to end.
 *
 * Requires ANTHROPIC_API_KEY in the environment; calls hit the live API and
 * are therefore slow and non-deterministic — assert only stable fields.
 */

const MOCK = loadMock('MockTest.java');

/**
 * Sends the MockTest.java construct named `name` to Claude and returns its
 * parsed TC analysis.
 *
 * @param name - Type name exactly as declared in MockTest.java, e.g. "OrderMetrics".
 * @throws If no such construct exists in the mock file.
 */
export async function analyseConstruct(name: string): Promise<TCResult> {
  const code = extractType(MOCK, name);
  if (!code) {
    throw new Error(`MockTest.java has no construct named "${name}".`);
  }

  const userMessage = [
    'Analyse the following code construct for Technical Credit patterns.',
    'Language: java',
    `Class source:\n${code}`,
  ].join('\n');

  return callClaude<TCResult>(SYSTEM_PROMPT, userMessage);
}
