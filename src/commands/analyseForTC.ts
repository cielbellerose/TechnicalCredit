import * as vscode from "vscode";

import { buildContext } from "@/context/buildContext";
import { SYSTEM_PROMPT } from "@/context/systemPrompt";
import { claude } from "@/claude";

const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 4096;
const TIMEOUT_MS = 30_000;

export function registerAnalyseForTC(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "technicalcredit.analyseForTC",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("Analyse for TC: no active editor.");
        return;
      }

      const tc = await buildContext(editor);

      if (!tc.selectedCode.trim()) {
        vscode.window.showErrorMessage(
          "Analyse for TC: no code selected or no word at cursor.",
        );
        return;
      }

      const userMessage = [
        `Analyse the following code construct for Technical Credit patterns.`,
        `File: ${tc.fileName}  Language: ${tc.language}`,
        tc.packageDeclaration ? `Package: ${tc.packageDeclaration}` : null,
        tc.importLines.length > 0
          ? `Imports:\n${tc.importLines.join("\n")}`
          : null,
        tc.constructMetrics
          ? `Pre-extracted construct metrics (tree-sitter):\n${JSON.stringify(tc.constructMetrics, null, 2)}`
          : null,
        `Selected code:\n${tc.selectedCode}`,
        `Full file context:\n${tc.fileContent}`,
      ]
        .filter(Boolean)
        .join("\n");

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Analysing for TC…",
          cancellable: false,
        },
        async () => {
          try {
            const response = await claude.messages.create({
              model: MODEL,
              max_tokens: MAX_TOKENS,
              system: SYSTEM_PROMPT,
              messages: [
                { role: "user", content: userMessage },
                { role: "assistant", content: "{" },
              ],
            }, { signal: AbortSignal.timeout(TIMEOUT_MS) });

            const raw = response.content
              .filter((b) => b.type === "text")
              .map((b) => b.text)
              .join("");

            const result = JSON.parse("{" + raw);

            if (result.is_tc_candidate) {
              vscode.window.showInformationMessage(
                `TC detected (${result.category}, confidence ${result.confidence}/5): ${result.benefit}`,
              );
            } else {
              vscode.window.showInformationMessage(
                `No TC detected: ${result.not_tc_reason ?? "no reason provided"}`,
              );
            }
          } catch (e) {
            vscode.window.showErrorMessage(`Analyse for TC failed: ${e}`);
          }
        },
      );
    },
  );

  context.subscriptions.push(disposable);
}
