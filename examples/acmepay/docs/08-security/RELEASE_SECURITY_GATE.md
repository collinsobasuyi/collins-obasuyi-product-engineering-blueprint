# acmepay — Release Security Gate

## Release

v0.9.0-beta — first pilot cohort (5 design-partner customers)

## Date

2026-08-18

## Gate checks

- [x] Security baseline reviewed
- [x] Threat model current
- [x] Authentication controls tested where applicable
- [x] Authorisation controls tested where applicable
- [x] OWASP-relevant risks assessed
- [x] Dependency scan reviewed
- [x] No exposed secrets
- [x] No unresolved Critical findings
- [ ] High findings resolved or formally risk accepted
- [x] Security evidence stored

## Decision

CONDITIONAL GO

## Notes

One High finding remains open: session tokens for the approver role are currently valid for 24 hours rather than the target 4-hour lifetime defined in the security baseline, because the shorter-lived token causes noticeable friction in the mobile-web approval flow. Risk-accepted for the pilot cohort only (5 known, contractually bound customers, MFA still mandatory for approvers) with a hard requirement to fix before the security gate can pass for general availability. Tracked in docs/12-planning/DECISION_LOG.md as DEC-001.

All threats in THREAT_MODEL.md have a documented mitigation in place and covered by an automated test per TEST_STRATEGY.md; TM-001 (fraudulent bank-detail change) and TM-003 (compromised approver account) were the focus of this review given their Critical impact rating.
