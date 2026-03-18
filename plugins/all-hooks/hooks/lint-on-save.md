---
name: lint-on-save
description: Automatically run linting tools after file modifications
category: development
event: PostToolUse
matcher: Edit|MultiEdit|Write
language: bash
version: 1.0.0
examples:
  - "Fires after Edit, MultiEdit, or Write calls, running the configured linter against the modified file"
  - "Triggers on every file save event to catch style violations and errors immediately after Claude makes changes"
  - "Set up lint-on-save so ESLint or flake8 runs automatically every time Claude modifies a file"
---

# lint-on-save

Automatically run linting tools after file modifications

## Event Configuration

- **Event Type**: `PostToolUse`
- **Tool Matcher**: `Edit|MultiEdit|Write`
- **Category**: development

## Environment Variables

- `CLAUDE_TOOL_FILE_PATH`

## Requirements

- ESLint for JavaScript/TypeScript files
- Or other linters based on file type

### Script

```bash
file_path=$(jq -r '.tool_input.file_path // empty')
if [[ "$file_path" =~ \.(js|jsx|ts|tsx)$ ]]; then
  npx eslint --fix "$file_path" 2>/dev/null || true
elif [[ "$file_path" =~ \.py$ ]]; then
  python3 -m black "$file_path" 2>/dev/null || true
fi
```
