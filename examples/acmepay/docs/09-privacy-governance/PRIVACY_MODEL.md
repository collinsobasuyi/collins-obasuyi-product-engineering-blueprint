# acmepay — Privacy Model

## Personal data

- Names, work email addresses, and phone numbers of business users (preparers, approvers, admins).
- Names and banking details (account/routing numbers) of vendor contacts associated with a business.
- Device/session metadata (IP address, login timestamps) used for security monitoring.

AcmePay is a B2B product; it does not knowingly process consumer personal data beyond the business contacts above.

## Purpose

- User contact details are required to authenticate users, route approvals, and send notifications about invoices awaiting action.
- Vendor banking details are required to execute the payment the customer has instructed us to make — this is the core function of the product.
- Session/device metadata is used to detect anomalous access patterns (see THREAT_MODEL.md, TM-003) and to satisfy audit requirements from banking-rail partners.

## Minimisation

Vendor banking details are stored only for vendors with at least one active or pending payment; vendors with no payment history for 24 months are archived and their bank details removed, retaining only the non-sensitive vendor record for historical reporting. We do not collect vendor tax ID or personal identification beyond what the banking rail partner requires to execute a transfer.

## Sensitive data

Vendor bank account and routing numbers are treated as sensitive financial data requiring encryption at rest and in transit, and are never included in AI prompts, logs, or analytics events — only a masked reference (last 4 digits) is used outside the payment service itself.

## Storage

All data is stored in the primary database within a single cloud region per customer's contracted jurisdiction. Bank account numbers are encrypted at the column level with a key managed by a dedicated key-management service, separate from the general application database credentials.

## Retention

- Active vendor and payment records: retained for the life of the customer account plus 7 years, to satisfy standard financial record-keeping requirements.
- User account data: retained for the life of the account; removed within 90 days of account closure, except where audit/financial regulations require longer retention of transaction-linked records.
- Session/device metadata: retained 12 months for security investigation purposes, then purged.

## Deletion

A business admin can request deletion of a user account (subject to retaining transaction-linked audit records as required by financial regulation) or full account closure via support. Vendor bank details are deleted immediately upon vendor archival past the minimisation window described above, independent of a deletion request.

## Third parties

- **Banking-rail partner** — receives vendor bank details and payment instructions necessary to execute ACH transfers.
- **Accounting integration (QuickBooks Online)** — receives invoice and payment records necessary for reconciliation, under the customer's own OAuth authorization.
- **AI extraction provider** — receives invoice document content (not banking credentials or full account numbers) for field extraction; contractually bound not to train on customer data.

## Consent and transparency

Business customers agree to AcmePay's data processing terms at signup, which explicitly cover what vendor and user data is collected and why. Vendors themselves are not AcmePay users; our contractual relationship is with the business customer, who is responsible for their own disclosures to vendors under applicable law.
