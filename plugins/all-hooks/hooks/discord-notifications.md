---
name: discord-notifications
description: Send Discord notifications when Claude Code finishes working
category: notifications
event: Stop
matcher: "*"
language: bash
version: 1.0.0
examples:
  - "Fires when Claude Code stops working, sending a simple Discord message to let you know the session ended"
  - "Triggers on every Stop event to notify a Discord channel that Claude has finished its current task"
  - "Set up discord-notifications so my Discord server gets a ping whenever Claude wraps up"
---

# discord-notifications

Send Discord notifications when Claude Code finishes working

## Event Configuration

- **Event Type**: `Stop`
- **Tool Matcher**: `*`
- **Category**: notifications

## Environment Variables

- `DISCORD_WEBHOOK_URL`

## Requirements

- DISCORD_WEBHOOK_URL environment variable set to your Discord webhook URL

### Script

```bash
#!/bin/bash
# Send Discord notification when Claude Code finishes

if [[ -z "$DISCORD_WEBHOOK_URL" ]]; then
  exit 0
fi

message="Claude Code has finished working on your request."
payload=$(jq -n --arg msg "$message" '{"content": $msg}')

curl -s -X POST "$DISCORD_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$payload" >/dev/null 2>&1
```
