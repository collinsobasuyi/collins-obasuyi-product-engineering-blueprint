# blueprint-template-test — AI Guardrails

## Core rules

- Do not treat model output as inherently trustworthy.
- Validate structured output.
- Protect system instructions and tool boundaries.
- Do not expose secrets to the model.
- Restrict tool permissions.
- Fail safely.
- Do not make unsupported claims.

## Prompt injection

Document direct and indirect prompt injection controls.

## Tool use

Tools should receive the minimum permissions necessary.

## Human oversight

Document where user confirmation or human review is required.

## Evaluation

Define how unsafe, incorrect and unreliable behaviour is tested.
