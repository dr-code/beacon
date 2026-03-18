---
description: Interview to flesh out a plan/spec
category: interview
argument-hint: "<plan-file>"
allowed-tools: AskUserQuestion, Read, Glob, Grep, Write, Edit
examples:
  - "/big-features-interview docs/features/notifications.md"
  - "/big-features-interview docs/specs/payment-overhaul.md"
  - "/big-features-interview docs/plans/user-dashboard-redesign.md — focus the interview on data requirements, edge cases, and rollback strategy"
---

Here's the current plan:

@$ARGUMENTS

Interview me in detail using the AskUserQuestion tool about literally anything: technical implementation, UI & UX, concerns, tradeoffs, etc. but make sure the questions are not obvious.

Be very in-depth and continue interviewing me continually until it's complete, then write the spec back to `$ARGUMENTS`.
