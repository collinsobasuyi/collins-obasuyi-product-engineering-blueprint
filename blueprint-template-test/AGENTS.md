# AGENTS.md

## Project

**blueprint-template-test**

This repository follows the Collins Obasuyi Product Engineering Blueprint.

Blueprint version: `0.1.0`

Generated: `2026-08-18`

## Product truth

Before implementing significant behaviour:

1. Read `docs/00-product/PRODUCT_OVERVIEW.md`.
2. Read the relevant domain, architecture, security and feature specifications.
3. Do not invent undocumented requirements.
4. Existing approved documentation overrides assumptions.
5. If documentation and implementation conflict, identify the conflict rather than silently choosing one.

## Engineering behaviour

- Inspect before editing.
- Prefer minimal, scoped changes.
- Avoid unrelated refactoring.
- Do not silently expand scope.
- Do not weaken security controls to make implementation easier.
- Do not hide failing tests.
- Never fabricate verification or test results.
- Explain important assumptions.

## Product rules

- Preserve documented product principles.
- Do not add functionality simply because it is technically possible.
- Respect MVP scope and out-of-scope decisions.
- Significant behaviour changes should update the relevant specification.

## Architecture

- Follow documented architecture.
- Keep domain logic separate from presentation logic.
- Significant architecture changes should be recorded as decisions.
- New dependencies should have a clear purpose.

## Security

Security requirements are product requirements.

- Never commit secrets.
- Authentication and authorisation changes require security consideration.
- Validate untrusted input.
- Apply least privilege.
- Do not bypass security controls to make tests pass.

## Privacy

- Collect only the data required for documented product behaviour.
- Follow documented retention and consent rules.
- Do not silently broaden the use of personal data.

## AI

If this project uses AI:

- AI output is not automatically trusted.
- Structured outputs must be validated.
- Deterministic rules should not be replaced with LLM guesses where documented rules exist.
- Maintain prompt injection and tool-use boundaries.
- Fail safely when AI output is invalid or unavailable.

## Quality

- New behaviour requires appropriate testing.
- Bug fixes should include regression coverage where practical.
- Accessibility is part of Definition of Done.
- Existing tests must continue to pass unless an approved requirement change makes them obsolete.

## Documentation

- Code and documentation should remain aligned.
- Do not rewrite historical evidence.
- Record important decisions.
- Update affected specifications when approved behaviour changes.

## Completion

A task is not complete merely because code has been written.

Completion requires appropriate evidence that:

- the requested behaviour works;
- relevant tests pass;
- security requirements are preserved;
- accessibility requirements are considered;
- documentation remains accurate.