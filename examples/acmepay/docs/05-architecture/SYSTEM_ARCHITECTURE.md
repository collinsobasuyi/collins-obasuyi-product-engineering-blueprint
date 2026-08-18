# acmepay — System Architecture

## Overview

AcmePay is a multi-tenant web application with a document-processing pipeline at its core. Invoices land in an ingestion queue, pass through an AI extraction/matching stage, and surface in a review-and-approval UI before a payment execution service hands them to a banking-rail partner. Every state transition is written to an append-only audit log.

## Components

### Frontend

A server-rendered web application (desktop + mobile web) for invoice review, approval queues, and vendor/audit history. No native mobile app in the MVP; mobile web covers the "approve from your phone" journey.

### Backend

A set of services behind an API gateway:

- **Ingestion service** — accepts emailed/uploaded invoices, stores the original file, enqueues it for extraction.
- **Extraction & matching service** — calls the AI provider for document extraction, matches results against vendor/PO records, computes anomaly flags.
- **Approval service** — owns workflow state (submitted → flagged → approved → paid), enforces role-based approval rules.
- **Payment service** — talks to the banking-rail partner API to initiate and track ACH transfers.
- **Audit service** — append-only event log consumed by all other services; source of truth for "what happened and when."

### Database

A primary relational database (PostgreSQL) holding tenants, users, vendors, invoices, payments, and approval state, with row-level tenant isolation. The audit log is stored append-only in a separate table/store so it can't be mutated by application bugs.

### Authentication

Business users authenticate via email + password with mandatory MFA for any user holding the "approver" role. Session tokens are short-lived and scoped to a single tenant; role (preparer / approver / admin) is enforced server-side on every payment-affecting action.

### External integrations

- **Accounting system** (QuickBooks Online) — vendor records, purchase orders, and payment reconciliation, via OAuth2.
- **Banking rail partner** — ACH initiation and settlement status, via a dedicated payments API with its own credential scope.
- **Email ingestion** — a dedicated inbound-email address per tenant, parsed and handed to the ingestion service.

### AI services

A third-party document-extraction/LLM provider is used for two narrow tasks: (1) structured field extraction from invoice documents, and (2) anomaly explanation in plain language. The AI provider never has direct access to banking credentials, and its output is never used to initiate a payment without matching against system-of-record data first (see AI_GUARDRAILS.md).

## Data flow

Invoice file → ingestion service (stores original, enqueues job) → extraction & matching service (calls AI provider, writes structured invoice record + anomaly flags) → approval service (surfaces to preparer/approver, records decision) → payment service (initiates ACH transfer, polls settlement status) → accounting integration (writes payment back to QuickBooks) → audit service (records every step).

## Trust boundaries

- users ↔ client (web/mobile browser);
- client ↔ backend (API gateway, authenticated + tenant-scoped);
- backend ↔ database (service accounts, least-privilege per service);
- backend ↔ third-party services (QuickBooks, banking rail — each with its own scoped, revocable credentials);
- backend ↔ AI provider (document content leaves the system boundary; no banking credentials or full account numbers are ever included in a prompt).

## Architecture constraints

- The payment service must never accept AI-extracted bank details as the sole source for where money is sent — new/changed vendor bank details always require a separate, out-of-band verification step before first use.
- All monetary amounts are stored as integer minor units (cents), never floating point.
- The audit log is append-only at the database level (no UPDATE/DELETE grants on that table for the application role).

## Open decisions

- Whether card payments (MVP+1) require a separate PCI-scoped service boundary or can extend the existing payment service.
- Whether extraction moves to a self-hosted model once volume justifies the infrastructure cost versus the current third-party API.
