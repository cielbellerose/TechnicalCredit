import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MODEL = 'claude-sonnet-4-20250514';
const MAX_TOKENS = 4096;
const TIMEOUT_MS = 30_000;

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Sends a user message to Claude with a system prompt and a JSON prefill, returning the parsed JSON response.
 */
export async function callClaude<T>(
  systemPrompt: string,
  userMessage: string,
): Promise<T> {
  const response = await claude.messages.create(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage },
        // The `{` prefill encourages Claude to respond with a JSON object directly, improving parseability
        { role: 'assistant', content: '{' },
      ],
    },
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  );

  const raw = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('');

  return JSON.parse('{' + raw) as T;
}
