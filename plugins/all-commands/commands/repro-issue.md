---
description: Reproduce a specific issue by creating a failing test case
category: code-analysis-testing
argument-hint: <issue_description>
allowed-tools: Read, Write, Edit
examples:
  - "/repro-issue login fails when email contains plus sign"
  - "/repro-issue checkout total rounds incorrectly when applying two coupons simultaneously — create a failing unit test isolating the discount calculation"
  - "/repro-issue #304 — session token not invalidated after password reset"
---

Repro issue $ARGUMENTS in a failing test