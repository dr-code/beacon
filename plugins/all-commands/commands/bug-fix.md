---
description: Systematic workflow for fixing bugs including issue creation, branch management, and PR submission
category: version-control-git
argument-hint: <bug_description>
allowed-tools: Bash(git *), Bash(gh *)
examples:
  - "/bug-fix login fails with 401 when email contains uppercase letters"
  - "/bug-fix cart total shows NaN when a coupon with 100% discount is applied at checkout"
  - "/bug-fix users are logged out unexpectedly after 5 minutes even though the session token has a 24-hour TTL — investigate token refresh logic in AuthMiddleware"
---

Understand the bug: $ARGUMENTS

Before Starting:
- GITHUB: create an issue with a short descriptive title.
- GIT: checkout a branch and switch to it.

Fix the Bug

On Completion:
- GIT: commit with a descriptive message.
- GIT: push the branch to the remote repository.
- GITHUB: create a PR and link the issue.