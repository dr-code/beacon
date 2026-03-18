---
name: file-protection-hook
description: Protect critical files from accidental modification
category: security
event: PreToolUse
matcher: Edit|MultiEdit|Write
language: bash
version: 1.0.0
examples:
  - "Fires before Edit, MultiEdit, or Write calls to block changes to files on the protected list"
  - "Triggers before any modification attempt, intercepting and rejecting writes to critical config or production files"
  - "Set up file-protection-hook so Claude cannot accidentally overwrite my .env or production config files"
---

# file-protection-hook

Protect critical files from accidental modification

## Event Configuration

- **Event Type**: `PreToolUse`
- **Tool Matcher**: `Edit|MultiEdit|Write`
- **Category**: security

## Environment Variables

None required

## Requirements

None

### Script

```bash
file_path=$(jq -r '.tool_input.file_path // empty')
protected_patterns=('.env' 'package-lock.json' '.git/' 'node_modules/' 'secrets')
for pattern in "${protected_patterns[@]}"; do
  if [[ "$file_path" == *"$pattern"* ]]; then
    echo "Blocked: Cannot modify protected file: $file_path" >&2
    exit 2
  fi
done
exit 0
```
