# Roadmap

## Product identity

> A repeatable product-engineering foundation that adapts to the risks of the product you're building.

Every feature on this roadmap is judged against that sentence. If a proposed feature turns the blueprint into a DevSecOps platform, a compliance certifier, or an AI-generation tool first and a scaffolder second, it doesn't belong here — or it belongs much later than it feels like it should.

## Governing principles

- **`init` is the foundation everything else stands on.** Every later command reads the structure `init` creates; none of them replace it.
- **Value before AI dependency.** `check` and `review` must work with zero LLM calls. AI is additive, never load-bearing for the core product.
- **AI drafts. The blueprint validates. Humans approve.** No command silently trusts model output into a document without a human reviewing it. This is the same "evidence over assumption" philosophy the generated documents already ask users to follow — the tool has to hold itself to it too.
- **Coverage mapping, not certification.** The `compliance` command (v0.5) reports what evidence exists and what's missing against a framework's shape. It never claims a project *is* compliant. Language matters here: "evidence readiness," not "ISO compliant."
- **No forced upgrades.** `upgrade` (v0.6) is diff-and-recommend by default. Nothing gets modified in a user's project without an explicit `--apply`.

## Version plan

### v0.1 — INIT ✓ Shipped

Generate a project-specific engineering foundation from six interactive questions.

- Interactive CLI (`init [project-name]`, `--help`, `--version`)
- ~60 baseline documents across product, research, requirements, design, domain, architecture, data, security, quality, performance, planning, business, operations
- Conditional modules: AI, privacy/governance, mobile accessibility evidence
- Operational checklists (project-start, feature-ready, pre-release, production-readiness)
- `.blueprint.json` project configuration
- Published to npm, CI on Node 20/22, automated generator tests, flagship AcmePay example

### v0.2 — CHECK ✓ Shipped

Answer the question every user has immediately after `init`: **"okay, what do I actually need to do now?"**

```
npx collins-obasuyi-blueprint check
```

- Walks every generated document and scores it: complete / has TODOs / missing entirely.
- Reports per-category status (Product, Requirements, Security, Quality, AI, ...) plus an overall readiness percentage.
- Surfaces a blocker count, incomplete-document count, and unresolved-TODO count.
- Zero LLM dependency — this is pattern-matching against the blueprint's own template structure (TODO markers, empty required sections, unchecked gate items), not a model call.
- This is the highest-leverage next feature: it turns the tool from a one-time generator into an ongoing engineering control, and it's the foundation `review` and `assist` build on.

### v0.3 — REVIEW ✓ Shipped

Go beyond "is this filled in" to "does this actually make sense together."

```
npx collins-obasuyi-blueprint review
```

- Cross-document consistency checks, e.g.:
  - Threat model lists authentication as an asset, but the architecture doc describes no authentication.
  - A functional requirement has no linked acceptance criteria.
  - The privacy model discusses health data, but `.blueprint.json` has `sensitiveData: false`.
- Still zero LLM dependency for the core checks — these are structural/cross-reference rules over the generated documents and `.blueprint.json`, the same category of validation as `check`, just relational instead of per-document.
- This is what makes `assist` (v0.4) safe to build: assisted drafts get checked against the same consistency rules as human-written ones.

### v0.4 — AI ASSIST ✓ Shipped

Draft individual documents from the project's own existing truth — never from nothing.

```
npx collins-obasuyi-blueprint assist threat-model
```

- Inputs are the project's own documents (`PRODUCT_OVERVIEW.md`, `SYSTEM_ARCHITECTURE.md`, `.blueprint.json`, `DATA_MODEL.md`, etc.), not a blind prompt.
- Output is a draft the user reviews and accepts/edits — never an auto-committed file.
- Every `assist`-generated draft is required to pass through `check`/`review` before it's treated as "done," same as a human-written one.
- Explicitly not `ai-generate my-product` (whole-project generation from a prompt). That inverts the tool's authority model — the blueprint should stay the source of structure, with AI filling gaps inside it, not the other way around.

### v0.5 — COMPLIANCE ✓ Shipped

Map existing blueprint evidence against a framework's expected shape.

```
npx collins-obasuyi-blueprint compliance --standard=iso27001
npx collins-obasuyi-blueprint compliance --standard=gdpr
```

- Reports which framework areas already have supporting evidence (e.g. `SECURITY_BASELINE.md` → security controls, `THREAT_MODEL.md` → risk assessment, `DATA_RETENTION.md` → information lifecycle) and which are missing.
- Framed strictly as **evidence readiness / coverage mapping** — never "compliant" or "certified." That claim isn't the tool's to make, and overstating it is a real credibility risk.
- Ships with a small set of frameworks to start (ISO 27001, GDPR are the two called out here); more only once real usage shows demand.

### v0.6 — EVOLVE

Give existing projects a path to catch up as the blueprint itself changes.

```
npx collins-obasuyi-blueprint upgrade
```

- Compares a project's recorded blueprint version (`.blueprint.json`) against the current one.
- Reports new recommended documents, updated documents, and anything superseded — as a diff, not a silent overwrite.
- Nothing is modified without an explicit `--apply`.
- Only becomes necessary once there are real `0.x` projects in the wild that need a defined upgrade story — don't build this speculatively before v0.2–v0.5 exist to actually version against.

### v1.0 — Stable methodology + organisational use

Not a feature release. The bar for v1.0 is that `init` → `check` → `review` → `assist` → `compliance` → `upgrade` function as one coherent workflow, validated by real projects (starting with dogfooding AcmePay-style examples), not a grab-bag of commands that each work in isolation.

## Deliberately deferred / not planned

These came up (via external review) as plausible future directions. Listed here so they're a conscious "not yet, and here's why" rather than something that quietly gets re-proposed without context:

- **API contract testing framework** — established tools already do this well (OpenAPI-based contract testing). Building our own would be pure scope creep away from the product identity.
- **CI/CD pipeline generation** — the blueprint could eventually *recommend* CI templates, but becoming a deployment framework is a different product.
- **Confluence/Notion export** — wait until users actually ask for it; no signal yet that it's needed.
- **Multi-project / cross-repo comparison** — only becomes useful once organisations are running this across multiple repos, which requires v0.2+ to exist first anyway.
- **Full architecture visualisation tooling** — Mermaid generation from the existing architecture docs is enough for now; a dedicated visualization product is a much bigger, separate bet.
- **Additional `compliance` standards (ISO/IEC 42001, EU AI Act, NIST AI RMF, NIS2, DORA)** — a real mapping pass was drafted for all five and then deliberately not shipped. The three AI-governance ones (ISO 42001, EU AI Act, NIST AI RMF) mapped cleanly onto `docs/06-ai/` documents; NIS2 and DORA were weaker — DORA in particular ended up 4-of-5 areas pointing at nearly the same evidence as NIS2, since this blueprint has no dedicated financial-sector documents. More importantly: `compliance` shipped with `iso27001`/`gdpr` and has had zero real usage to validate those two are even calibrated correctly. Adding five more before that validation happens is the exact breadth-before-depth mistake the roadmap was written to resist. Revisit once `compliance` has real usage and, ideally, once there's a specific project (AI-enabled and/or regulated) that would actually use one of these.

## Notes for future updates to this file

- Update the version this file marks "✓ Shipped" as each one actually ships — this file should always reflect where the project really is, not aspiration.
- If a version's scope changes significantly, record *why* (a line or two, like the reasoning above) rather than just editing the bullet list silently — the reasoning is what keeps future scope decisions consistent.
