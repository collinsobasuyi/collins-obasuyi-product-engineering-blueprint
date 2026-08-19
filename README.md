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

## Philosophy

- Evidence over assumption. A claim like "it's secure" or "it's tested" should point at a document, not a feeling.
- Security and privacy are product features, decided at the start, not bolted on before an audit.
- Accessibility and performance have budgets, not vibes.
- AI output — including a filled-in blueprint document — is not automatically trusted. It gets reviewed like anything else that ends up in a release.
- A structure that's the same across every project is what makes it possible to actually compare projects, onboard someone quickly, or run a release gate that means something.

## Project layout

- `bin/` — CLI entry point
- `scripts/` — the generation and check engines (`generateProject`, `createSlug`, `checkProject`)
- `templates/` — the ~60 baseline document templates
- `checklists/` — the operational checklists copied into every generated project
- `examples/` — a completed example project (see above)
- `tests/` — automated generator tests (`npm test`)

## Roadmap

`init` is done and published. `check` is built and tested on `main`, ahead of a v0.2 release. `review`, `assist`, `compliance`, and `evolve` are planned after it, in that order, deliberately — see [ROADMAP.md](ROADMAP.md) for what each version means and why they're sequenced this way.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT — see [LICENSE](LICENSE).
