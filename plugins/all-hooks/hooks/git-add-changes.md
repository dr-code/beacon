---
name: git-add-changes
description: Automatically stage changes in git after file modifications for easier commit workflow
category: git
event: PostToolUse
matcher: Edit
language: bash
version: 1.0.0
examples:
  - "Fires after every Edit call, automatically staging the modified file with git add"
  - "Triggers after each file modification to keep your git index up to date without manual staging"
  - "Set up git-add-changes so every file Claude edits is automatically staged and ready to commit"
---

# git-add-changes

Automatically stage changes in git after file modifications for easier commit workflow

## Event Configuration

- **Event Type**: `PostToolUse`
- **Tool Matcher**: `Edit`
- **Category**: git

## Environment Variables

None required

## Requirements

None

### Script

```bash
file_path=$(jq -r '.tool_input.file_path // empty')
if [[ -n "$file_path" ]] && git rev-parse --git-dir >/dev/null 2>&1; then
  git add "$file_path" 2>/dev/null || true
fi
```
