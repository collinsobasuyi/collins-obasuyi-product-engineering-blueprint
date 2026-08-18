# acmepay — Threat Model

## Purpose

Identify important assets, trust boundaries, threat actors and plausible attack paths.

## Assets

- User data
- Authentication/session state
- Application secrets
- Business/domain data
- External integration credentials
- AI prompts/tools if applicable

## Trust boundaries

- User ↔ client
- Client ↔ backend
- Backend ↔ database
- Backend ↔ third-party services
- Backend ↔ AI provider

## Threat actors

- Unauthenticated attacker
- Authenticated malicious user
- Compromised account
- Malicious third party
- Insider
- Automated bot

## Threats

### TM-001

**Threat:** Business email compromise leads to a fraudulent invoice with altered bank details being submitted and approved as legitimate.

**Asset affected:** Payment funds; vendor trust records.

**Attack path:** Attacker compromises a vendor's email account, sends an invoice with new "updated" bank details from a legitimate-looking address. AcmePay extracts it normally since the document itself is well-formed.

**Impact:** Critical

**Mitigation:** Any invoice carrying bank details that differ from the vendor's on-file details is hard-blocked from auto-approval and requires a separate out-of-band verification (phone call to a known-good number, not one on the invoice) before the new details can be used. This is enforced in the payment service, not just flagged in the UI.

**Residual risk:** An approver who bypasses the verification step under time pressure can still authorise a fraudulent payment. Mitigated by requiring a second approver for any payment using newly-verified bank details, but not eliminated.

### TM-002

**Threat:** A malicious or careless prompt/document causes the AI extraction service to return manipulated structured data (e.g. an inflated amount) that is used without cross-checking.

**Asset affected:** Payment funds.

**Attack path:** Attacker embeds instructions or misleading text inside an invoice PDF designed to influence the AI extraction output (prompt injection via document content).

**Impact:** High

**Mitigation:** AI-extracted amounts are always cross-checked against the matched purchase order/vendor history band; anything outside that band is flagged for manual review rather than auto-approved. The AI provider's output is treated as a proposal, never a system-of-record write, until matched.

**Residual risk:** Novel invoice patterns without prior PO/vendor history have a weaker cross-check and rely more heavily on human review.

### TM-003

**Threat:** Compromised approver account is used to approve fraudulent or duplicate payments.

**Asset affected:** Payment funds; audit trail integrity.

**Attack path:** Credential stuffing or phishing against a user holding the approver role.

**Impact:** Critical

**Mitigation:** MFA is mandatory for the approver role; session tokens are short-lived; anomalous approval patterns (e.g. approval from a new device/location immediately followed by a payment to a new vendor) trigger a secondary alert to the account admin.

**Residual risk:** Session hijacking after successful MFA (e.g. token theft) is not fully eliminated by MFA alone; mitigated by short session lifetimes and device binding.

### TM-004

**Threat:** Third-party banking-rail or accounting-integration credentials are exposed, allowing an attacker to initiate payments or read financial data directly.

**Asset affected:** External integration credentials; payment funds.

**Attack path:** Credential leak via misconfigured logging, a compromised dependency, or an insider with excessive access to secrets storage.

**Impact:** Critical

**Mitigation:** Integration credentials are stored in a dedicated secrets manager, scoped per tenant, never logged, and rotated on a fixed schedule. Service accounts follow least privilege — the extraction service, for example, has no access to banking-rail credentials at all.

**Residual risk:** A sufficiently privileged insider with legitimate secrets-manager access remains a residual risk, addressed through access auditing rather than technical prevention alone.
