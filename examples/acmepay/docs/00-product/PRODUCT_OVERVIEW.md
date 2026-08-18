# acmepay — Product Overview

## Purpose

AcmePay exists to remove the manual, error-prone work of paying business vendors. It takes an incoming invoice — PDF, email attachment, or photo — and turns it into a matched, fraud-checked, approved payment without a human re-typing a single line item.

## Problem

Small and mid-sized businesses pay vendors through a mix of email, spreadsheets, and their bank's website. Someone manually reads each invoice, keys it into accounting software, checks it against a purchase order (often from memory), and then logs into a separate banking portal to send the payment. Each of those handoffs is a place where amounts get mistyped, duplicate invoices get paid twice, and fraudulent invoices — a vendor's email account is compromised, banking details are swapped — slip through because nobody is systematically checking for it.

## Target users

- **AP clerks / bookkeepers** at businesses with 20–500 employees who process 50–2,000 vendor invoices a month.
- **Finance managers / controllers** who approve payment runs and are accountable for the accuracy of what goes out the door.
- **Owners of smaller businesses** who do their own books and want fewer places where a mistake becomes a wire-fraud incident.

## Value proposition

AcmePay reads the invoice for you, checks it against what was actually ordered and received, flags anything that looks like fraud or duplication *before* money moves, and routes it through an approval chain that a human still controls. It replaces four disconnected tools (inbox, spreadsheet, accounting software, bank portal) with one auditable flow.

## Core experience

1. An invoice arrives (email forward, upload, or mobile photo).
2. AcmePay extracts vendor, amount, line items, and due date, and matches it to a purchase order or prior vendor history.
3. Anomalies are flagged (new bank details, amount outside historical range, duplicate invoice number) with a plain-language reason.
4. A designated approver reviews the flagged items and the payment batch, and approves from desktop or mobile.
5. Payment is initiated via ACH or card through the connected banking rail, and the accounting system is updated automatically.

## Key capabilities

- AI-assisted invoice data extraction and PO/receipt matching
- Fraud and anomaly detection on vendor and payment details
- Multi-user, role-based approval workflows
- Direct integration with banking rails and accounting software
- Full audit trail from invoice receipt to payment settlement

## Success criteria

- Invoice-to-payment cycle time drops from days to under 24 hours for standard invoices.
- Manual data-entry error rate on processed invoices approaches zero.
- At least one plausible fraud/duplicate-payment attempt is caught pre-payment per 1,000 invoices in the first year of use, validating the anomaly detection is doing real work rather than just adding friction.

## Current stage

MVP
