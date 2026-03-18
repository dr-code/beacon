---
name: change-tracker
description: Track file changes in a simple log
category: development
event: PostToolUse
matcher: Edit|MultiEdit
language: bash
version: 1.0.0
examples:
  - "Fires after every Edit or MultiEdit tool call to append a log entry recording what changed"
  - "Fires whenever Claude edits or multi-edits a file, writing the change to a tracking log"
  - "Keep a running log of every file Claude touches so I can audit changes across the session"
---

# change-tracker

Track file changes in a simple log

## Event Configuration

- **Event Type**: `PostToolUse`
- **Tool Matcher**: `Edit|MultiEdit`
- **Category**: development

## Environment Variables

None required

## Requirements

None

### Script

```bash
file_path=$(jq -r '.tool_input.file_path // empty')
log_file=".claude/changes.log"
mkdir -p "$(dirname "$log_file")"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Modified: $file_path" >> "$log_file"
```
