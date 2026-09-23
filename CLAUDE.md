# CLAUDE.md

VS Code extension that analyses Java source code for **Technical Credit** via the
Claude API. Written in TypeScript, bundled with esbuild.

See [README.md](README.md) for architecture, the Technical Credit categories, and
setup instructions. This file covers conventions only.

## Commands

- `npm run compile` — type-check, lint, then bundle
- `npm run watch` — `tsc` and esbuild in parallel
- `npm run tsc:check` — type-check only
- `npm run lint:check` / `npm run lint:fix` — ESLint, zero warnings tolerated
- `npm run format` / `npm run format:check` — Prettier
- `npm test` — Jest
- `npm run opro` — regenerate heuristic prompts via OPRO

`tsc:check`, `lint:check` and `format:check` are fast and free; run them freely to
verify work. **Do not run `npm test` unless asked** — the live heuristic tests hit
the real Claude API, so every run is billed and takes minutes.

## Git workflow

- Branch from `main`, named `tc-<num>-<kebab-desc>` — e.g. `tc-32-add-claude-md`
- Commit messages are `TC-<num> lowercase description` — e.g.
  `TC-32 add claude.md with repo conventions`
- Commit frequently, in well-sized chunks. One coherent change per commit,
  landed as the work progresses — not a single large dump at the end
- **Never push, and never open a PR, unless asked.** Never force-push, and never
  commit directly to `main`
- Leave `dependabot/*` branches and dependency bumps alone unless asked

## Pull requests

- Title the PR in Title Case, prefixed with the ticket — e.g.
  `TC-32 Add CLAUDE.md With Repo Conventions`. Note the contrast with commit
  messages, whose descriptions stay lowercase
- Assign the PR to yourself when opening it
- Fill in every section of `.github/pull_request_template.md`
- The title's `TC-<num>` prefix is the only ticket reference needed — Linear
  links the PR through the branch name. Don't add a `Closes` line
- Run `npm run format` before pushing — Prettier covers markdown and JSON, not
  just `src/`
- All three checks must pass before review: `tsc-check`, `lint-check`,
  `format-check`
- At least one teammate approves before merge. No self-merging.

## Code style

- Prettier and ESLint are authoritative. Don't hand-format, and never add an
  `eslint-disable` comment — fix the underlying code instead
- Import through the `@/` alias (`@/context/buildContext`) rather than deep
  relative paths
- `strict` is on: no `any`, no non-null assertions (`!`). Model the type properly
- Keep core logic importable without `vscode`. Context building, prompt
  construction and parsing must stay testable outside the extension host; VS Code
  API access belongs in the command and registry layer
- Comment sparingly, and explain _why_ something non-obvious is done rather than
  what the code does
- Follow the existing naming and enum patterns before introducing new ones

## Guardrails

- `src/prompts/categories/` is tuned by OPRO. Propose prompt changes and wait —
  hand edits silently regress detection quality
- Never commit `.env`, and never print `ANTHROPIC_API_KEY` into output or logs
- Ask before adding any npm dependency; the dependency list stays tight
- Don't create spec, plan, or summary markdown files unless asked
