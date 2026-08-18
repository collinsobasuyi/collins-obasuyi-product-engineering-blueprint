# acmepay — Test Strategy

## Objective

Provide confidence that acmepay behaves correctly, securely and accessibly — with particular weight on correctness of payment amounts and destinations, since defects here have direct financial and regulatory consequences, not just UX consequences.

## Test levels

### Unit

Business and domain logic is tested in isolation, with heavy coverage on: amount matching/tolerance rules, anomaly-flag rules (new bank details, out-of-range amount, duplicate invoice number), and approval-role authorization logic. Monetary math is tested exclusively in integer minor units — any test or code touching floating-point currency values is treated as a defect.

### Integration

Tests cover the ingestion → extraction → matching pipeline against a mocked AI provider response (both well-formed and malformed/schema-violating responses), and the payment service against a sandboxed banking-rail partner environment, including simulated failure and timeout responses.

### API

Every endpoint that can affect payment state (submit, flag, approve, initiate) is tested for authentication, role-based authorization (a preparer cannot approve; a user from tenant A cannot act on tenant B's data), and correct error responses for invalid or out-of-tolerance data.

### End-to-end

The core journey — invoice ingested, extracted, matched, flagged (or not), approved, paid, reconciled in QuickBooks — is tested end to end in a staging environment against sandboxed third-party integrations, covering both the clean path and the "new bank details requiring out-of-band verification" path from THREAT_MODEL.md TM-001.

### Accessibility

The approval queue and payment-review screens (the highest-stakes UI in the product) are tested for keyboard-only operation, screen-reader labeling of anomaly flags, and sufficient contrast on flag/warning states, per docs/03-design/ACCESSIBILITY_REQUIREMENTS.md.

### Security

Validates the documented security baseline and the specific threats in THREAT_MODEL.md — in particular, automated tests confirming that a changed-bank-details payment cannot be approved by a single approver and cannot bypass out-of-band verification, since that control is the primary mitigation for our highest-impact threat.

### Performance

Invoice extraction and matching latency is measured against the performance budget for the ingestion-to-review journey (see docs/11-performance/PERFORMANCE_BUDGET.md), since a slow review queue directly undermines the "24 hour cycle time" success criterion in PRODUCT_OVERVIEW.md.

## Regression strategy

Every production incident involving an incorrect amount, incorrect payee, or a missed anomaly flag gets a regression test added before the fix ships, not after — these are the failure modes the product exists to prevent.

## Environments

Local (mocked AI provider and banking rail), staging (sandboxed third-party integrations, synthetic invoice data only), production (live integrations, real customer data).

## Release criteria

A release should not proceed with unresolved critical failures. For AcmePay specifically, "critical" always includes any failure in amount matching, bank-detail-change verification, or role-based approval authorization, regardless of how minor the triggering change appears.
