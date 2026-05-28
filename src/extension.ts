import * as vscode from 'vscode';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function activate(_context: vscode.ExtensionContext) {
	console.log('hi');
  try {
	const response = await client.messages.create({
	  model: 'claude-sonnet-4-20250514',
	  max_tokens: 1000,
	  messages: [{ role: 'user', content: "what's up?" }],
	});

	const text = response.content
	  .filter(b => b.type === 'text')
	  .map(b => b.text)
	  .join('');

	console.log(text);
  } catch (e) {
	console.error('Claude error:', e);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
