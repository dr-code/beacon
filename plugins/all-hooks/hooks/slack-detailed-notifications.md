---
name: slack-detailed-notifications
description: Send detailed Slack notifications with session information and rich blocks
category: notifications
event: Stop
matcher: "*"
language: bash
version: 1.0.0
examples:
  - "Fires when Claude Code stops, posting a rich Slack block with session details, changed files, and tool usage stats"
  - "Triggers on every Stop event to deliver a structured Slack message with full session metadata to your channel"
  - "Set up slack-detailed-notifications so my team channel gets a detailed breakdown when Claude finishes a session"
---

# slack-detailed-notifications

Send detailed Slack notifications with session information and rich blocks

## Event Configuration

- **Event Type**: `Stop`
- **Tool Matcher**: `*`
- **Category**: notifications

## Environment Variables

- `SLACK_WEBHOOK_URL`

## Requirements

- SLACK_WEBHOOK_URL environment variable

### Script

```bash
#!/bin/bash
if [[ -z "$SLACK_WEBHOOK_URL" ]]; then
  exit 0
fi

session_id="${CLAUDE_SESSION_ID:-unknown}"
timestamp=$(date '+%Y-%m-%d %H:%M:%S')

payload=$(jq -n \
  --arg text "Claude Code Session Complete" \
  --arg session "$session_id" \
  --arg time "$timestamp" \
  '{
    "blocks": [
      {"type": "header", "text": {"type": "plain_text", "text": $text}},
      {"type": "section", "fields": [
        {"type": "mrkdwn", "text": ("*Session ID:*\n" + $session)},
        {"type": "mrkdwn", "text": ("*Completed:*\n" + $time)}
      ]}
    ]
  }')

curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$payload" >/dev/null 2>&1
```
