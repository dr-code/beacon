---
name: format-javascript-files
description: Automatically format JavaScript/TypeScript files after any Edit operation using prettier
category: formatting
event: PostToolUse
matcher: Edit
language: bash
version: 1.0.0
examples:
  - "Fires after every Edit call on a JS or TS file, running prettier to enforce consistent code style"
  - "Triggers automatically when Claude edits a JavaScript or TypeScript file, formatting it in place with prettier"
  - "Set up format-javascript-files so all my JS and TS files are auto-formatted by prettier after every edit"
---

# format-javascript-files

Automatically format JavaScript/TypeScript files after any Edit operation using prettier

## Event Configuration

- **Event Type**: `PostToolUse`
- **Tool Matcher**: `Edit`
- **Category**: formatting

## Environment Variables

None required

## Requirements

- prettier (npm install -g prettier or npx prettier)

### Script

```bash
file_path=$(jq -r '.tool_input.file_path // empty')
if [[ "$file_path" =~ \.(js|jsx|ts|tsx|mjs|cjs)$ ]]; then
  npx prettier --write "$file_path" 2>/dev/null || true
fi
```
