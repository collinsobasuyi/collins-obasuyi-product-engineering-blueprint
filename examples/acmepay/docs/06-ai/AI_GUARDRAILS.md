# acmepay — AI Guardrails

## Core rules

- Do not treat model output as inherently trustworthy.
- Validate structured output.
- Protect system instructions and tool boundaries.
- Do not expose secrets to the model.
- Restrict tool permissions.
- Fail safely.
- Do not make unsupported claims.

In practice for AcmePay: **AI-extracted data is a proposal, not a payment instruction.** Nothing the extraction or anomaly-explanation model returns can move money on its own — every AI output must pass through the deterministic matching and approval logic in the payment service before it affects a real transfer (see SYSTEM_ARCHITECTURE.md).

## Prompt injection

Invoice documents are untrusted input and are treated as such: document text is passed to the extraction model as data to be parsed, never as instructions the model should follow. The extraction prompt is fixed and does not incorporate free-text instructions found within the document. Extraction output is validated against a strict schema (expected field types, plausible amount ranges) before it is accepted; anything that fails schema validation is routed to manual entry rather than silently retried with the untrusted content.

## Tool use

The AI provider used for extraction and anomaly explanation has no tool access and no network egress of its own within our system — it is called as a stateless API for a single document, returns structured text, and has no ability to query our database, call the banking-rail API, or trigger a payment. It cannot see banking credentials, session tokens, or full vendor account numbers (only masked references, where account context is needed at all).

## Human oversight

- Every invoice with an anomaly flag (new/changed bank details, amount outside historical range, duplicate invoice number) requires human review before it can be approved — this cannot be bypassed by configuration.
- Any payment to a vendor's new or changed bank details requires a second, independent approver plus out-of-band verification, regardless of what the AI extraction returned.
- AI-generated anomaly explanations are shown to the human reviewer as supporting context, labeled as AI-generated, never as a final verdict.

## Evaluation

Extraction accuracy is measured against a held-out set of previously-processed, human-verified invoices before each model or prompt change ships, with a required minimum field-level accuracy threshold. Anomaly detection is evaluated separately for both false-negative rate (missed fraud/duplicates in the test set) and false-positive rate (legitimate invoices incorrectly flagged), since a system that flags everything is as useless as one that flags nothing. Any change that regresses either metric is blocked from release until reviewed.
