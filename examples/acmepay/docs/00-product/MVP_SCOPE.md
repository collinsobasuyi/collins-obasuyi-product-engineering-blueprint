# acmepay — MVP Scope

## MVP objective

Prove that AI-assisted invoice extraction plus a human-in-the-loop approval step produces faster, more accurate vendor payments than a manual process — for a single payment rail (ACH) and a single accounting integration (QuickBooks Online) — before expanding to more rails, integrations, and geographies.

## In scope

- Invoice ingestion via email forwarding and manual upload (PDF/image).
- AI extraction of vendor, amount, due date, and line items.
- Matching against QuickBooks Online vendor and purchase-order records.
- Anomaly flags for: new/changed bank details, amount outside historical range, duplicate invoice number.
- Two-role approval workflow (preparer submits, approver authorises).
- ACH payment initiation through a single banking-rail partner.
- Audit log covering every state change from ingestion to settlement.

## Out of scope

- Card payments and international wire transfers.
- Accounting integrations other than QuickBooks Online.
- Mobile app (mobile web approval only for MVP).
- Self-serve vendor onboarding portal (vendors are added by AcmePay customers manually).
- Multi-entity / multi-subsidiary business support.

## MVP exit criteria

The MVP is ready for validation when:

- Core user journey works end to end.
- Critical requirements are tested.
- Security baseline is met.
- Accessibility requirements are considered.
- No unresolved critical defects remain.
