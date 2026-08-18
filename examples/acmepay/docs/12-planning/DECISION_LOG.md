# acmepay — Decision Log

## Decision format

### DEC-001 — Accept 24-hour approver session lifetime for the pilot cohort

**Date:** 2026-08-18

**Status:** Accepted

**Context:** The security baseline targets a 4-hour session lifetime for the approver role. The shorter lifetime causes noticeable re-authentication friction in the mobile-web approval flow, which the pilot cohort flagged during onboarding.

**Decision:** Ship the v0.9.0-beta pilot with a 24-hour approver session lifetime, restricted to the 5 contractually-bound design-partner customers, with MFA still mandatory for the approver role. Reducing this to 4 hours (or shipping device-bound refresh tokens as a better fix) is a hard requirement before the security gate can pass for general availability.

**Rationale:** The pilot cohort is small, known, and contractually bound, which materially lowers the blast radius of a stolen long-lived session token compared to an open GA rollout. Blocking the pilot entirely on a UX fix for the mobile approval flow was judged to cost more in lost learning than the residual risk it accepts.

**Consequences:** RELEASE_SECURITY_GATE.md for v0.9.0-beta records this as a formally risk-accepted High finding rather than a blocker. It must be resolved — not re-accepted — before the next release gate.
