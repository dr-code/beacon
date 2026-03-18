---
name: auto-git-add
description: Automatically stage modified files with git add after editing
category: git
event: PostToolUse
matcher: Edit|MultiEdit|Write
language: bash
version: 1.0.0
examples:
  - "Fires after every Edit, MultiEdit, or Write tool call to automatically stage modified files"
  - "Fires whenever Claude writes or edits a file, running git add on the changed path"
  - "Automatically stage files after Claude edits them so I don't have to run git add manually"
---

# auto-git-add

Automatically stage modified files with git add after editing

## Event Configuration

- **Event Type**: `PostToolUse`
- **Tool Matcher**: `Edit|MultiEdit|Write`
- **Category**: git

## Environment Variables

None required

## Requirements

None

### Script

```bash
jq -r '.tool_input.file_path // empty' | while read -r file_path; do
  if [[ -n "$file_path" ]] && git rev-parse --git-dir >/dev/null 2>&1; then
    git add "$file_path" 2>/dev/null || true
  fi
done
```
