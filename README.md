# TechnicalCredit

A VS Code extension that analyses Java code for **Technical Credit** — the positive
counterpart to technical debt. Where technical *debt* flags shortcuts that cost you
later, technical *credit* identifies strategic design decisions (abstractions,
modular boundaries, instrumentation, documentation, etc.) that create long-term
value for a system's evolution.

Select a Java construct (class, interface, method, or field) and run **Analyse for
TC**. The extension uses Claude to evaluate the selected code against each Technical
Credit category. If — and only if — the code actually exhibits Technical Credit, it
suggests a `@TechnicalCredit` annotation describing the benefit, the conditions under
which it holds, and the signals that justify it. Selecting a construct does not guarantee any
annotation: code with no detectable Technical Credit yields no suggestions. When
suggestions are produced, you preview each one inline and **Accept** or **Dismiss** it
with a single click.

## Links

- 📄 **Documentation (Overleaf):** https://www.overleaf.com/project/6a20d30ab0e8e4cadb31ab99
- 🖥️ **Presentation / Demo (Google Slides):** https://docs.google.com/presentation/d/1WZ43UPL2MukiH-vXycmLBrYOlTSiQpsbuTnpMLBEbaI/edit?slide=id.g3e88f8db96b_0_5#slide=id.g3e88f8db96b_0_5

## How It Works

1. **Context building** — When you trigger analysis, a [Tree-sitter](https://tree-sitter.github.io/)
   Java parser walks the AST from your cursor up to the nearest declaration and
   extracts structural metrics (fields, methods, imports, nested types).
2. **Multi-heuristic analysis** — Eight specialised Claude agents run **in parallel**,
   one per Technical Credit category:
   *abstraction, modularity, API stability, automation, compliance readiness,
   configurability, observability,* and *reusability.*
   Each agent shares a common system prompt defining the TC schema but applies its
   own category-specific detection rules.
3. **ADR matching** — If the workspace contains Architecture Decision Records
   (markdown files under `docs/`), each detected candidate is matched against them
   in a follow-up Claude call. A clear match links the annotation to that ADR's id
   (e.g. `ADR-0007`); otherwise no `adr` field is emitted.
4. **Preview & decide** — Only categories that actually detect Technical Credit
   produce a candidate; so a construct may yield several annotations, one, or none at all. 
   Any candidates are inserted as dimmed previews with **Accept** / **Dismiss** CodeLenses above.
   Accepting keeps the annotation; dismissing removes it.

## Requirements

- [VS Code](https://code.visualstudio.com/) `^1.120.0`
- [Node.js](https://nodejs.org/) 18+
- [Anthropic API key](https://console.anthropic.com/) (the extension calls the
  Claude API at analysis time)

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/cielbellerose/TechnicalCredit.git
cd TechnicalCredit

# 2. Install dependencies
npm install

# 3. Provide your Anthropic API key
#    Create a .env file in the repository root:
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# 4. Build the extension
npm run compile
```
### Available scripts

| Script | Description |
| --- | --- |
| `npm run compile` | Type-check, lint, and bundle with esbuild |
| `npm run watch` | Watch mode — runs `tsc` and esbuild in parallel |
| `npm run package` | Production build (minified, no sourcemaps) |
| `npm test` | Run the Jest test suite |
| `npm run lint:check` | Lint with zero-warning enforcement |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run tsc:check` | Type-check only |
| `npm run format` | Format the codebase with Prettier |
| `npm run opro` | Run the OPRO script to optimize heuristic detection criteria |

## Running the Extension

1. Open the project in VS Code.
2. Press **F5** (or run the **Run Extension** launch configuration). This builds the
   extension and opens a new **Extension Development Host** window.
3. In that window, open a Java file and place your cursor inside a class, interface,
   method, or field.
4. Right-click and choose **Analyse for TC** (also available from the editor context
   menu).
5. If the analysed code exhibits Technical Credit, review the previewed
   `@TechnicalCredit` annotation(s) and click **Accept** or **Dismiss** on the
   CodeLens above each one. If no Technical Credit is detected, no annotation
   appears.

The watch task recompiles automatically as you edit the extension's source.

## Testing

Tests are written with [Jest](https://jestjs.io/) (via `ts-jest`) and live alongside
the source under `src/test/`. Test files match `src/**/*.test.ts`.

```bash
npm test
```

Current tests cover context-building utilities and load Java fixtures
(`src/test/mockCode/MockTest.java`) to exercise individual heuristics. They verify
that the expected constructs are extracted from the AST; wiring the fixtures up to
live Claude calls and asserting on the JSON output is still in progress (see
**Known Issues**).

## Project Structure

```
src/
├── extension.ts              # Entry point: init parser + register commands
├── registry.ts               # Wires up commands and CodeLens providers
├── analyse.ts                # Orchestrator: runs all heuristics in parallel
├── context/                  # Cursor → AST → construct metrics
│   ├── buildContext.ts
│   ├── findAdrs.ts           # Scans docs/ for ADR markdown + tc-* frontmatter
│   └── javaParser/           # Tree-sitter init + metric extraction
├── comment/
│   ├── tcResult.ts           # TCResult interface (model output → comment)
│   ├── formatComment.ts      # TC JSON → @TechnicalCredit annotation
│   └── pendingAnnotation.ts  # Preview decorations + Accept/Dismiss CodeLenses
├── prompts/
│   ├── systemPrompt.ts       # Shared TC schema / response format
│   ├── userPrompts.ts        # Builds the user message from context
│   ├── adrPrompt.ts          # Prompt for matching a candidate to an ADR
│   └── heuristics/           # 8 category-specific prompts
├── utils/
│   └── claude.ts             # Claude API client (model, timeout, JSON prefill)
└── test/                     # Jest tests + Java fixtures
```

## Next Steps

- **Java only.** Analysis depends on the Tree-sitter Java grammar; other languages are
  not yet supported.
- **ADR matching requires a `docs/` folder.** ADRs are discovered only from markdown
  files under `docs/` in the first workspace folder; annotations link to an ADR only
  when one is present and clearly matches.
- **Requires network access and a valid API key.** Each analysis makes eight live
  Claude API calls (one per heuristic, 30s timeout each), plus one additional call
  per detected candidate when ADRs are present. Analysis fails without
  `ANTHROPIC_API_KEY` set.