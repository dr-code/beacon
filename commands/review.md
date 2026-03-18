---
description: "Review current git diff or staged changes with isolated MCP context. Appending -i opens an interactive terminal session instead."
allowed-tools: Bash
---

Run a scoped code review with isolated MCP context (no global plugin token overhead).

**Headless** (default — runs review, prints report, exits):
```
!beacon review "$ARGUMENTS"
```

**Interactive** (pass `-i` flag — opens a new terminal with review MCPs loaded):
```
!beacon review -i
```

Parse the $ARGUMENTS variable:
- If it contains `-i` or `--interactive`, run in interactive mode
- Otherwise run headless, passing any remaining text as a prompt override

Execute:
```bash
!beacon review $ARGUMENTS
```
