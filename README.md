# Collins Obasuyi Product Engineering Blueprint

Turn AI-assisted ideas into engineered products.

[![CI](https://github.com/collinsobasuyi/collins-obasuyi-product-engineering-blueprint/actions/workflows/ci.yml/badge.svg)](https://github.com/collinsobasuyi/collins-obasuyi-product-engineering-blueprint/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/collins-obasuyi-blueprint.svg)](https://www.npmjs.com/package/collins-obasuyi-blueprint)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## The problem

AI makes it incredibly easy to build software quickly.

It does not automatically give you:

- clear product scope
- traceable requirements
- threat modelling
- privacy thinking
- test strategy
- accessibility
- performance budgets
- release evidence

Those things don't emerge from a fast prototype. They have to be decided, written down, and revisited — and that's exactly the part that gets skipped when the code is easy to produce.

## What this does

Answer six questions.

The blueprint generates a project-specific engineering foundation: a `docs/` tree of scoped, project-named documents covering product definition through release evidence, a set of operational checklists, and a machine-readable `.blueprint.json` describing what was generated and why.

## Quick start

Requires Node.js 20 or later.

```bash
npx collins-obasuyi-blueprint init my-product
```

## Example

```text
$ npx collins-obasuyi-blueprint init acmepay

Collins Obasuyi Product Engineering Blueprint

Project: acmepay

? Is this an AI-enabled product? Yes
? Will it process sensitive or health-related data? Yes
? Does it require user authentication? Yes
? Does it use external APIs or third-party integrations? Yes
? Is it in a regulated or high-risk domain? Yes
? Will it support mobile or PWA? Yes

✓ Created project: acmepay
✓ Generated blueprint documentation

Blueprint project created successfully.

Next:
  cd acmepay
```

## What gets generated

```text
acmepay/
├── .blueprint.json
├── AGENTS.md
├── README.md
├── checklists/
│   ├── project-start.md
│   ├── feature-ready.md
│   ├── pre-release.md
│   └── production-readiness.md
└── docs/
    ├── 00-product/
    ├── 01-research/
    ├── 02-requirements/
    ├── 03-design/
    ├── 04-domain/
    ├── 05-architecture/
    ├── 06-ai/            (conditional — AI-enabled)
    ├── 07-data/
    ├── 08-security/
    ├── 09-privacy-governance/  (conditional — sensitive/regulated)
    ├── 10-quality/
    ├── 11-performance/
    ├── 12-planning/
    ├── 13-business/
    ├── 14-operations/
    └── 15-evidence/
```

Every document is pre-titled with your project name and pre-structured with the sections a reviewer would actually expect — ready to be filled in, not written from a blank page.

## Conditional modules

The six setup questions decide which modules get added on top of the baseline structure:

| Answer | Adds |
|---|---|
| AI-enabled | `docs/06-ai/` — AI architecture and AI guardrails |
| Sensitive data or regulated | `docs/09-privacy-governance/` — privacy model |
| Mobile / PWA | `docs/15-evidence/accessibility/` — accessibility evidence directory |
| Any of AI / sensitive / auth / integrations / regulated | Security evidence directory scaffolded alongside the always-on security baseline |

The baseline documentation — product, research, requirements, design, domain, architecture, data, security, quality, performance, planning, business, and operations — is generated for every project regardless of answers, because those are the categories a disciplined build always needs, not the exception.

## Why not just ask ChatGPT/Claude?

You can — and you should, to help you *fill in* the documents. But asking a model to invent your engineering standard from scratch on every new project means you get a different threat-model shape, a different definition of "done," and a different idea of what counts as a security baseline every single time you ask. There's nothing to compare against, nothing consistent to review against, and no guarantee the next project even remembers to ask.

**AI can help you complete the blueprint. It shouldn't have to reinvent your engineering standard every time.**

The blueprint is the fixed structure; the AI (or you) does the thinking that fills it in. That separation is the point.

## Example completed project

`init` generates a full structure of scoped starting points — most of them intentionally left as `TODO` for you to fill in. To show what a *filled-in* project actually looks like, [`examples/acmepay/`](examples/acmepay/) is a fictional regulated AI fintech generated with every module enabled, with eight of its documents completed to a standard you'd want reviewed before shipping:

- [`PRODUCT_OVERVIEW.md`](examples/acmepay/docs/00-product/PRODUCT_OVERVIEW.md)
- [`MVP_SCOPE.md`](examples/acmepay/docs/00-product/MVP_SCOPE.md)
- [`SYSTEM_ARCHITECTURE.md`](examples/acmepay/docs/05-architecture/SYSTEM_ARCHITECTURE.md)
- [`THREAT_MODEL.md`](examples/acmepay/docs/08-security/THREAT_MODEL.md)
- [`PRIVACY_MODEL.md`](examples/acmepay/docs/09-privacy-governance/PRIVACY_MODEL.md)
- [`AI_GUARDRAILS.md`](examples/acmepay/docs/06-ai/AI_GUARDRAILS.md)
- [`TEST_STRATEGY.md`](examples/acmepay/docs/10-quality/TEST_STRATEGY.md)
- [`RELEASE_SECURITY_GATE.md`](examples/acmepay/docs/08-security/RELEASE_SECURITY_GATE.md)

Everything else in that example is left as the generator produced it, so you can see the blank-template-to-completed-document contrast directly.

## Check your readiness

`init` generates the structure. `check` tells you how much of it is actually done — with no LLM involved. Every document's source template is re-rendered with your project's own values and diffed against the real file: untouched means not started, edited-but-still-has-`TODO`-text-or-unchecked-boxes means in progress, edited-clean means complete. That's it — no guessing at meaning, just an honest diff.

```text
$ npx collins-obasuyi-blueprint check examples/acmepay

Collins Obasuyi Product Engineering Blueprint

Project: acmepay

PRODUCT
✓ Product Overview
✓ MVP Scope
✗ Product Principles not started

...

ARCHITECTURE
✓ System Architecture

AI
✗ AI Architecture not started
✓ AI Guardrails

...

SECURITY
✗ Security Baseline not started
✓ Threat Model
✗ Security Test Plan not started
⚠ Release Security Gate contains 1 TODO

PRIVACY GOVERNANCE
✓ Privacy Model

...

READINESS: 12%

3 blockers
57 incomplete documents
1 unresolved TODO
```

That's the real output against [`examples/acmepay/`](examples/acmepay/) — the 8 completed documents show `✓`, the untouched majority correctly show `✗`, and `RELEASE_SECURITY_GATE.md`'s one intentionally-unchecked gate item shows up as a genuine unresolved item rather than being silently missed. A small fixed set of release-critical documents (security baseline, threat model, release gates, privacy model) count as **blockers** when incomplete, and `check` exits non-zero when any exist — so it can gate CI later, not just print a report.

## Find inconsistencies

`check` tells you what's filled in. `review` tells you whether what's filled in actually holds together — still with zero LLM involvement. It's structural, not semantic: does a functional requirement you've started writing still have a `TODO` where it should link to a product requirement or acceptance criteria? Does a threat you've documented have no mitigation? Does `SYSTEM_ARCHITECTURE.md` describe real login/session behaviour even though you answered "no authentication required" at `init`?

```text
$ npx collins-obasuyi-blueprint review

Collins Obasuyi Product Engineering Blueprint

Project: orderflow

REVIEW

⚠ FR-001 has no linked product requirement.
⚠ FR-001 has no linked acceptance criteria.
⚠ TM-001 has no documented mitigation.
⚠ .blueprint.json says authentication: false, but docs/05-architecture/SYSTEM_ARCHITECTURE.md's Authentication section describes real authentication behaviour ("password") — worth reconciling.

4 findings
```

That's real output too, from a small demo project set up to hit each rule deliberately — `review` only flags a linkage field once you've actually started that entry (an untouched template block is `check`'s job, not `review`'s, so a blank project produces zero findings, not a wall of noise). Run it clean and it just says `✓ No consistency issues found.` — which is exactly what it says against `examples/acmepay/`, since AcmePay's threat model already has every mitigation filled in.

## Draft with AI

`init`, `check`, and `review` never call an LLM. `assist` is the one command that does — and only when you ask, one document at a time, grounded in your project's own existing documents rather than a blind prompt. Provider-agnostic: pick Anthropic or OpenAI, whichever you already have credits for.

```bash
export BLUEPRINT_AI_PROVIDER=anthropic   # or openai
export ANTHROPIC_API_KEY=...             # stays local, never written to any file
npx collins-obasuyi-blueprint assist TEST_STRATEGY
```

Real output, against `examples/acmepay/` — `TEST_STRATEGY.md` already had content, so `assist` asked before spending an API call:

```text
docs/10-quality/TEST_STRATEGY.md already contains content.
? Generate a draft anyway? It will be written to TEST_STRATEGY.draft.md
  and will not touch the existing file. Yes

Drafting with AI — this calls an external API and may take a moment...

✓ Draft written to docs/10-quality/TEST_STRATEGY.draft.md
```

`assist` never overwrites anything — the draft always lands in a sibling `.draft.md` file. Its context for `TEST_STRATEGY` was AcmePay's own `PRODUCT_OVERVIEW.md`, `MVP_SCOPE.md`, `SYSTEM_ARCHITECTURE.md`, and `FUNCTIONAL_REQUIREMENTS.md`, and the draft it wrote back showed it: real references to QuickBooks and the banking-rail partner, the real 24-hour cycle-time goal, the real integer-minor-units constraint — and it honestly left `TODO` on the two things nothing in the project had specified yet (regulatory controls, environment strategy), rather than inventing them.

Currently supported: `THREAT_MODEL`, `PRIVACY_MODEL`, `TEST_STRATEGY`, `AI_GUARDRAILS`, and `PRODUCT_OVERVIEW` — which works differently, since it's the first document and there's nothing else yet to draw from. It reads an optional `IDEA.md` at your project root instead: a few rough sentences, not a structured document.

```text
$ cat IDEA.md
app where you snap a photo of what's in your fridge/cupboard and it tells
you what you can actually cook with it right now...

$ npx collins-obasuyi-blueprint assist PRODUCT_OVERVIEW

## Purpose

idea-live-test exists to turn a photo of whatever food you have on hand
into an immediate, actionable answer to "what can I cook right now?" ...

## Success criteria

- TODO: define target metrics (e.g., percentage of suggested recipes
  actually cooked, reduction in reported food waste, user retention)
```

Same behaviour: it turned an unpunctuated, three-sentence idea dump into a properly structured document, and left success metrics as `TODO` rather than invent numbers the idea never mentioned.

Two safety nets run before you ever see output: if a project doesn't have enough written yet for a draft to be worth anything, `assist` says so and asks before spending an API call, instead of quietly handing back another empty document; and every draft is checked against the template's own required sections before it's written — if the model drops one, `assist` tells you, rather than trusting the output blindly.

**AI drafts. The blueprint validates. You approve.**

## Map compliance evidence

`compliance` reports which parts of a framework already have supporting evidence in your project, and which don't — still zero LLM involvement, same category as `check`/`review`. It never says "compliant" or "certified"; that's not a claim this tool — or any tool — gets to make on your behalf. It says what exists and what's missing, and ends every run with that disclaimer explicitly.

```text
$ npx collins-obasuyi-blueprint compliance --standard=gdpr examples/acmepay

Collins Obasuyi Product Engineering Blueprint

Project: acmepay
Standard: GDPR

✗ Data inventory — docs/07-data/DATA_DICTIONARY.md (no evidence yet)
✗ Retention schedule — docs/07-data/DATA_RETENTION.md (no evidence yet)
✓ Lawful basis and consent — docs/09-privacy-governance/PRIVACY_MODEL.md § Consent and transparency
✓ Data minimisation — docs/09-privacy-governance/PRIVACY_MODEL.md § Minimisation
✓ Data subject deletion rights — docs/09-privacy-governance/PRIVACY_MODEL.md § Deletion
✓ Third-party processors — docs/09-privacy-governance/PRIVACY_MODEL.md § Third parties

COVERAGE: 67%

This is an evidence-readiness report, not a compliance certification.
```

Real output against `examples/acmepay/` — and it's more informative than it looks at first glance. A naive version of this command would map GDPR entirely onto `PRIVACY_MODEL.md` and just repeat one "is this document done" signal six times. Instead, each area maps to a specific *section* within it, so AcmePay's genuinely partial state shows through: the privacy sections it actually wrote are `✓`, and the two data-management documents it didn't touch are honestly `✗` — not rounded up because a related document happens to be finished.

Currently supported: `iso27001`, `gdpr`. More only once these two have real usage behind them — see [ROADMAP.md](ROADMAP.md) for why that discipline matters here specifically.

## Track template changes

The blueprint keeps changing after you generate a project — a new section gets added to a template, a new document category ships. `upgrade` tells you what changed since your project's recorded blueprint version, without touching anything.

```text
$ npx collins-obasuyi-blueprint upgrade

Collins Obasuyi Product Engineering Blueprint

Project: acmepay
Project blueprint: 0.1.0
Current blueprint: 0.6.0

Template changes since this project's version:

~ [0.3.1] docs/05-architecture/SYSTEM_ARCHITECTURE.md
  Added a "Technology choices" section (language, frameworks, database, hosting, key libraries) -- nothing previously captured this anywhere in the blueprint.

Nothing has been modified. This is based on your project's recorded
blueprint version, not its actual content -- you may have already
applied some of these by hand. Apply what's relevant yourself, the
same way you would any other documentation change.
```

Real output against `examples/acmepay/`, which was generated back at `0.1.0`. Report-only, deliberately: `upgrade` compares your project's *recorded* version, not its actual content — AcmePay's `SYSTEM_ARCHITECTURE.md` already has a hand-written Technology choices section from an earlier session, and `upgrade` still lists it as pending, because that's honestly all the tool can know without inspecting content it has no safe way to merge into. Automatically applying a change into a file you may have heavily customized is a real problem — a three-way merge between the original template, the new template, and your own edits — genuinely harder than anything else here, so it's not attempted yet.

## Philosophy

- Evidence over assumption. A claim like "it's secure" or "it's tested" should point at a document, not a feeling.
- Security and privacy are product features, decided at the start, not bolted on before an audit.
- Accessibility and performance have budgets, not vibes.
- AI output — including a filled-in blueprint document — is not automatically trusted. It gets reviewed like anything else that ends up in a release.
- A structure that's the same across every project is what makes it possible to actually compare projects, onboard someone quickly, or run a release gate that means something.

## Project layout

- `bin/` — CLI entry point
- `scripts/` — the generation, check, review, assist, compliance, and upgrade engines (`generateProject`, `createSlug`, `checkProject`, `reviewProject`, `loadAssistTarget`, `complianceProject`, `upgradeProject`), plus `scripts/providers/` (the thin Anthropic/OpenAI adapters `assist` calls), `scripts/doc-utils.js` (shared document-parsing helpers), and `scripts/template-changelog.js` (the structured record `upgrade` reads)
- `templates/` — the ~60 baseline document templates
- `checklists/` — the operational checklists copied into every generated project
- `examples/` — a completed example project (see above)
- `tests/` — automated generator tests (`npm test`)

## Roadmap

`init`, `check`, `review`, `assist`, and `compliance` are done and published. `upgrade` is built and tested on `main`, ahead of a v0.6 release — the last command on the original roadmap; see [ROADMAP.md](ROADMAP.md) for what each version means, and for why `upgrade`'s actual design ended up different from the original plan.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT — see [LICENSE](LICENSE).
