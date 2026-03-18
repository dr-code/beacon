---
name: smart-commit
description: Intelligent git commit creation with automatic message generation and validation
category: git
event: PostToolUse
matcher: Edit
language: bash
version: 1.0.0
examples:
  - "Fires after every Edit call, analyzing the staged diff to auto-generate a conventional commit message and validate it"
  - "Triggers after file modifications to intelligently group changes, draft a commit message, and optionally commit automatically"
  - "Set up smart-commit so Claude auto-generates meaningful git commit messages every time it edits my code"
---

# smart-commit

Intelligent git commit creation with automatic message generation and validation

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
# Stage the edited file first
file_path=$(jq -r '.tool_input.file_path // empty')
if [[ -n "$file_path" ]] && git rev-parse --git-dir >/dev/null 2>&1; then
  git add "$file_path" 2>/dev/null || true
  # Check if there are staged changes
  if git diff --cached --quiet 2>/dev/null; then
    exit 0
  fi
  echo "Changes staged for: $file_path"
fi
```
