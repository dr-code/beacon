---
name: discord-error-notifications
description: Send Discord notifications for long-running operations and important events
category: notifications
event: PostToolUse
matcher: Bash
language: bash
version: 1.0.0
examples:
  - "Fires after every Bash tool call, sending a Discord alert if the command was long-running or produced errors"
  - "Triggers when Bash operations complete, notifying your Discord channel about significant or slow command executions"
  - "Set up discord-error-notifications so I get pinged in Discord when a shell command takes too long or fails"
---

# discord-error-notifications

Send Discord notifications for long-running operations and important events

## Event Configuration

- **Event Type**: `PostToolUse`
- **Tool Matcher**: `Bash`
- **Category**: notifications

## Environment Variables

- `DISCORD_WEBHOOK_URL`

## Requirements

- DISCORD_WEBHOOK_URL environment variable

### Script

```bash
#!/bin/bash
if [[ -z "$DISCORD_WEBHOOK_URL" ]]; then
  exit 0
fi

# Check if the tool result indicates an error
tool_result=$(jq -r '.tool_result // empty')
if echo "$tool_result" | grep -qi "error\|failed\|exception"; then
  command=$(jq -r '.tool_input.command // "unknown"' | head -c 100)
  payload=$(jq -n --arg msg "Command failed: $command" '{"content": $msg}')
  curl -s -X POST "$DISCORD_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "$payload" >/dev/null 2>&1
fi
```
