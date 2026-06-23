# TechnicalCredit

A VS Code extension that analyses Java code for **Technical Credit** - the positive
counterpart to technical debt. Where technical _debt_ flags shortcuts that cost you
later, technical _credit_ identifies strategic design decisions (abstractions,
modular boundaries, instrumentation, documentation, etc.) that create long-term
value for a system's evolution.

Select a Java construct (class, interface, method, or field) and run **Analyse for
TC**. The extension uses Claude to evaluate the selected code against each Technical
Credit category. If the code exhibits Technical Credit, it suggests a `@TechnicalCredit` annotation
describing the benefit, the conditions under which it holds, and the signals that justify it.
No detectable Technical Credit yields no suggestions. When suggestions are produced, you preview
each one inline and are able to **Accept** or **Dismiss** them individually.

## Project Context

This is the **TC Annotation Project** for Advanced Software Development, by Dharna,
Kinsey, Benedikt, and Rowan. The extension is written in **TypeScript** and analyses
**Java** source code.

### Motivation — why we are doing this

The software development community has long focused on **Technical _Debt_** but rarely
on **Technical _Credit_**: the good design decisions that quietly create long-term value
yet remain effectively invisible. These choices are seldom tracked, acknowledged, or
annotated, so the strategic thinking behind them goes unrecognised. We want to change
that by building an annotation tool that calls an AI API to detect Technical Credit and
mark up code blocks with the evidence supporting it. The goal is to make good design
**visible to engineers in the moment they are actually working in the code**.

### Starting Point — what we are building from

We began with the small body of existing work on Technical Credit, primarily by Ian
Gorton:

- ["Technical Credit"](https://cacm.acm.org/opinion/technical-credit/) (CACM)
- ["A Research Agenda for Technical Credit"](https://medium.com/@i.gorton/a-research-agenda-for-technical-credit-giving-software-quality-a-language-e9ad62a0cbf9)
- [Giving Software Quality a Language](https://dl.acm.org/doi/epdf/10.1145/3690043) (ACM)

Additional references inform specific parts of the work:

- [OPRO: Large Language Models as Optimizers](https://arxiv.org/pdf/2309.03409) — basis
  for Dharna's prompt-optimization work.
- [A bot for recognising Technical Debt](https://arxiv.org/abs/2605.29869) — provided by
  Ian as prior art on automated detection.

From there we built on a blank
[VS Code extension](https://code.visualstudio.com/api/references/vscode-api#languages),
the [Anthropic Claude API](https://www.anthropic.com/api), and the project reference
sheet defining eight Technical Credit detection categories along with their signals,
pattern-detection tables, and example annotations:

| Categories |
| ---------- |
| Abstraction · Modularity · API-Stability · Automation · Compliance-Readiness · Observability · Configurability · Reusability |

### Aims & Research Questions

Our aims for the project are:

- **Detect Technical Credit in Java files** — right-click a chunk of code, choose
  **Analyse for TC**, and classify whether a TC pattern is present by sending the
  construct to the AI API.
- **Turn detections into actionable annotations** — take the AI's detections and
  surface them as annotations the engineer can **Accept** or **Dismiss**, pre-filled
  with the category, benefit, conditions, signals, confidence score, and (if reached)
  an ADR link.
- **Trace decisions back to ADRs** — work with the partner group to link each
  annotation to the Architecture Decision Record that motivated the design decision,
  creating a traceable chain from **design decision → ADR → annotated code chunk**.

**Core research question:** _Can a VS Code extension combining prompt engineering,
structural heuristics, and the Anthropic API reliably detect and annotate Technical
Credit in Java source code?_

## Links

- 📄 **Documentation (Overleaf):** https://www.overleaf.com/read/gwfmbbtnpgnt#db500d 
- 🖥️ **Presentation / Demo (Google Slides):** https://docs.google.com/presentation/d/1WZ43UPL2MukiH-vXycmLBrYOlTSiQpsbuTnpMLBEbaI/edit?slide=id.g3e88f8db96b_0_5#slide=id.g3e88f8db96b_0_5

## How It Works

1. **Context building** — When you trigger analysis, a [Tree-sitter](https://tree-sitter.github.io/)
   Java parser walks the AST from your cursor up to the nearest declaration and
   extracts structural metrics (fields, methods, imports, nested types).
2. **Multi-heuristic analysis** — Eight specialised Claude agents run **in parallel**,
   one per Technical Credit category:
   _abstraction, modularity, API stability, automation, compliance readiness,
   configurability, observability,_ and _reusability._
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

| Script               | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| `npm run compile`    | Type-check, lint, and bundle with esbuild                    |
| `npm run watch`      | Watch mode — runs `tsc` and esbuild in parallel              |
| `npm run package`    | Production build (minified, no sourcemaps)                   |
| `npm test`           | Run the Jest test suite                                      |
| `npm run lint:check` | Lint with zero-warning enforcement                           |
| `npm run lint:fix`   | Auto-fix lint issues                                         |
| `npm run tsc:check`  | Type-check only                                              |
| `npm run format`     | Format the codebase with Prettier                            |
| `npm run opro`       | Run the OPRO script to optimize heuristic detection criteria |

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

The suite has two layers:

- **Context unit tests** (`buildContextCore.test.ts`) — verify the pure, vscode-free
  context assembly (e.g. package/import extraction) against the
  `src/test/mockCode/MockTest.java` fixture. These run offline.
- **Live heuristic tests** (`priorityHeuristicTests/h1, h2, h4, h5`) — send fixture
  constructs through the full production path (`buildContextFromSource` →
  `createUserPrompt` → `callClaude`) via the `support/analyseLive.ts` helper, then
  assert on the parsed `TCResult` JSON (positive and negative cases per heuristic).
  These make real Claude API calls, so they **require `ANTHROPIC_API_KEY`** and use a
  60s per-test timeout.

Remaining heuristics do not yet have dedicated live fixture coverage.

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

### Current Limitations

- **Java only.** Analysis depends on the Tree-sitter Java grammar; other languages are
  not yet supported.
- **ADR matching requires a `docs/` folder.** ADRs are discovered only from markdown
  files under `docs/` in the first workspace folder; annotations link to an ADR only
  when one is present and clearly matches.
- **Requires network access and a valid API key.** Each analysis makes eight live
  Claude API calls (one per heuristic, 30s timeout each), plus one additional call
  per detected candidate when ADRs are present. Analysis fails without
  `ANTHROPIC_API_KEY` set.
- **No caching or deduplication.** The same construct analyzed twice fires the full
  set of API calls again and may insert a second annotation. Responses should be
  cached by file hash and analyzed constructs tracked to prevent re-insertion.
- **Only 5 of 9 heuristics implemented (H1–H5).** Automation, Compliance-Readiness, Knowledge Preservation
  and Configurability patterns are not yet detected (in progress).

### Future Ideas

- **Multi-language support.** Extend Tree-sitter parsing to other languages using the same heuristic logic.
- **Whole-codebase analysis.** Add a batch crawl layer to walk an entire repository
  and produce a project-wide TC inventory, rather than one construct at a time.
- **Heuristic pre-filtering.** Run lightweight heuristics before firing API calls.
  Only call Claude for categories where a signal is already detected to reduce cost
  and latency significantly.
- **Engineer feedback loop.** Every Accept/Dismiss on a suggested annotation is a
  free human label. Capturing these would build a real prompt tuning dataset.
- **Cost controls.** Let users select which heuristics to run and set a per-session
  API call budget to prevent runaway costs on large files.
