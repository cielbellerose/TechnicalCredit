import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 4096;
const TIMEOUT_MS = 30_000;

const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
        // Mid-conversation assistant turn (not a last-turn prefill) primes raw JSON responses
        { role: 'user', content: 'Respond only with a JSON object.' },
        { role: 'assistant', content: '{"ok": true}' },
        { role: 'user', content: userMessage },
      ],
    },
    { signal: AbortSignal.timeout(TIMEOUT_MS) },
  );

  const raw = response.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  return JSON.parse(raw) as T;
}
