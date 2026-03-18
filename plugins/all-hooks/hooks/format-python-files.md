---
name: format-python-files
description: Automatically format Python files after any Edit operation using black formatter
category: formatting
event: PostToolUse
matcher: Edit
language: bash
version: 1.0.0
examples:
  - "Fires after every Edit call on a Python file, running black to standardize formatting"
  - "Triggers automatically when Claude edits a .py file, passing it through the black formatter immediately"
  - "Set up format-python-files so black runs on every Python file Claude touches"
---

# format-python-files

Automatically format Python files after any Edit operation using black formatter

## Event Configuration

- **Event Type**: `PostToolUse`
- **Tool Matcher**: `Edit`
- **Category**: formatting

## Environment Variables

None required

## Requirements

- black (pip install black)

### Script

```bash
file_path=$(jq -r '.tool_input.file_path // empty')
if [[ "$file_path" =~ \.py$ ]]; then
  python3 -m black "$file_path" 2>/dev/null || true
fi
```
