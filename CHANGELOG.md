# Changelog

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
