# Changelog

## 0.6.0 - 2026-08-20

### Added

- `upgrade` command (`collins-obasuyi-blueprint upgrade [path]`): reports template content changes since a project's recorded `blueprintVersion`. Report-only — nothing is modified.
- `scripts/template-changelog.js`: a structured record of template *content* changes (distinct from this file, which covers the whole project), backfilled with the one real entry so far (0.3.1's `SYSTEM_ARCHITECTURE.md` Technology choices section).
- `upgrade` example wired into the README, using real output verified against `examples/acmepay` (generated at 0.1.0).

### Changed

- `ROADMAP.md`'s v0.6 plan is revised from the original: it assumed diffing template snapshots across git tags, which doesn't work — published npm packages ship zero `.git` content, so a globally-installed or `npx`-run CLI has no git history at runtime. The actual design and the reasoning for it are recorded in `ROADMAP.md`.
- This closes out the original roadmap's command list (`init` → `check` → `review` → `assist` → `compliance` → `upgrade`). `--apply` for `upgrade` (safely merging a change into a project's own edited content) remains deliberately unbuilt — a real three-way-merge problem, correctly deferred until there's real usage to design around.

## 0.5.0 - 2026-08-20

### Added

- `compliance` command (`collins-obasuyi-blueprint compliance --standard=<standard> [path]`): maps existing blueprint evidence against a framework's expected shape, with zero LLM involvement. Ships with two standards: `iso27001`, `gdpr`.
- Framed strictly as evidence-readiness / coverage mapping — every run ends with an explicit "not a compliance certification" disclaimer, and there are no pass/fail exit-code semantics implying a gate.
- Framework areas map to either a whole document (reusing `check`'s existing per-document status) or a specific section within one, used for GDPR since it concentrates almost entirely in `PRIVACY_MODEL.md` — verified this matters: without section-level mapping every GDPR area would repeat one binary signal instead of reflecting real partial coverage.
- `compliance` example wired into the README, using real output verified against `examples/acmepay` (GDPR: 67%, correctly reflecting which privacy sections are actually written).

### Changed

- Refactored two duplicated helpers into shared modules ahead of a third consumer: `extractHeadingSection` moved out of `review-project.js` into `scripts/doc-utils.js`; the template-by-destination lookup moved out of `assist-project.js` into a single `templateByDestination` export from `generate-project.js`.

## 0.4.0 - 2026-08-20

### Added

- `assist` command (`collins-obasuyi-blueprint assist <document> [path]`): drafts one document at a time using an AI provider, grounded in the project's own existing documents rather than a blind prompt. Output always goes to a sibling `<document>.draft.md` file — never overwrites the tracked document.
- Provider-agnostic from day one: thin adapters for Anthropic and OpenAI (`scripts/providers/`) behind one `generate()` interface, selected via `BLUEPRINT_AI_PROVIDER`. Both call their REST API directly via native `fetch` — zero new dependencies. API keys (`ANTHROPIC_API_KEY` / `OPENAI_API_KEY`) are environment-only, never read from or written to `.blueprint.json`, generated docs, or any repo file.
- Supported documents: `THREAT_MODEL`, `PRIVACY_MODEL`, `TEST_STRATEGY`, `AI_GUARDRAILS`, and `PRODUCT_OVERVIEW` — the last reading an optional `IDEA.md` at the project root (a free-form idea dump) as its context, since it's the first document and nothing else exists yet to draw from.
- Safety confirmations before any API call: warns and asks before drafting over a document that already has real content; warns and asks if none of the context documents have real content yet (a draft from nothing would be mostly placeholder).
- Draft validation: after generation, the draft is checked against the template's own required section headings (`findMissingSections`) and the CLI warns if any are missing, rather than silently trusting the model's output.
- `assist` example wired into the README, using real output verified against a live API call (twice — the first live test caught two real defects, both fixed and re-verified live before release).

## 0.3.1 - 2026-08-19

### Added

- `## Technology choices` section in `SYSTEM_ARCHITECTURE.md` (language, frameworks, database, hosting, key libraries) — previously nothing in the blueprint captured this, despite `AGENTS.md` telling contributors to read the docs before implementing anything.

### Changed

- `examples/acmepay`'s completed `SYSTEM_ARCHITECTURE.md` filled in with a real Technology choices section, so the flagship example stays consistent with the current template.

## 0.3.0 - 2026-08-19

### Added

- `review` command (`collins-obasuyi-blueprint review [path]`): finds cross-document inconsistencies with zero LLM involvement.
- Field-linkage checks for `FR-XXX` blocks in `FUNCTIONAL_REQUIREMENTS.md`, `AC-XXX` in `ACCEPTANCE_CRITERIA.md`, and `TM-XXX` in `THREAT_MODEL.md` — flags a started-but-unlinked entry (its `Related product requirement`, `Acceptance criteria`, `Related requirement`, or `Mitigation` field still `TODO`), without flagging entries nobody has touched yet.
- Config/content consistency checks: sensitive-data keywords appearing in the docs despite `sensitiveData`/`regulated` both being `false`; real authentication content in `SYSTEM_ARCHITECTURE.md` despite `authentication: false`.
- `review` example wired into the README, using real (not mocked) output.

## 0.2.0 - 2026-08-19

### Added

- `check` command (`collins-obasuyi-blueprint check [path]`): scores every generated document as not started, has unresolved TODOs, or complete, with zero LLM dependency — each document's source template is re-rendered with the project's own `.blueprint.json` values and diffed against the real file.
- Per-category readiness reporting (Product, Requirements, Security, Quality, AI, ...) plus an overall readiness percentage.
- Blocker detection for a fixed set of release-critical documents (security baseline, threat model, release security/quality gates, privacy model); `check` exits non-zero when blockers exist.
- `check` example wired into the README, using real (not mocked) output verified against `examples/acmepay`.

### Changed

- Refactored `generate-project.js` to export its template manifests (`coreTemplates`, `baselineTemplates`, `checklistTemplates`, `conditionalTemplateGroups`) so `check` reuses the exact same source of truth `init` uses, instead of a second list that could drift.

## 0.1.0 - 2026-08-18

### Added

- Interactive project generator
- Product engineering baseline
- Conditional AI documentation
- Conditional privacy/governance documentation
- Security baseline and release gates
- Quality and testing templates
- Performance templates
- Product and requirements templates
- Operational documentation
- Project engineering checklists
- AGENTS.md generation
- .blueprint.json project configuration
- Node 20 and Node 22 CI
- Automated generator tests
