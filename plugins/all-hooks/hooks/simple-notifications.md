---
name: simple-notifications
description: Send simple desktop notifications when Claude Code operations complete
category: notifications
event: PostToolUse
matcher: "*"
language: bash
version: 1.0.0
examples:
  - "Fires after every tool call, sending a brief desktop notification confirming the operation completed"
  - "Triggers after each Claude operation to surface a lightweight system notification so you know something happened"
  - "Set up simple-notifications so I get a basic macOS notification whenever Claude finishes a tool call"
---

# simple-notifications

Send simple desktop notifications when Claude Code operations complete

## Event Configuration

- **Event Type**: `PostToolUse`
- **Tool Matcher**: `*`
- **Category**: notifications

## Environment Variables

- `CLAUDE_TOOL_NAME`

## Requirements

- macOS: Uses built-in osascript
- Linux: Uses notify-send (install with: sudo apt install libnotify-bin)

### Script

```bash
tool_name=$(jq -r '.tool_name // "unknown"')
if [[ "$OSTYPE" == "darwin"* ]]; then
  osascript -e "display notification \"Tool '$tool_name' completed\" with title \"Claude Code\""
else
  notify-send "Claude Code" "Tool '$tool_name' completed" 2>/dev/null || true
fi
```
