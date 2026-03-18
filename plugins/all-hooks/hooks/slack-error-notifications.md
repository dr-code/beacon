---
name: slack-error-notifications
description: Send Slack notifications when Claude Code encounters long-running operations or when tools take significant time
category: notifications
event: Notification
matcher: "*"
language: bash
version: 1.0.0
examples:
  - "Fires on every Notification event, sending a Slack message when a tool call takes unusually long or triggers an alert"
  - "Triggers whenever Claude Code emits a notification, routing it to Slack so your team sees important operational events"
  - "Set up slack-error-notifications so my Slack workspace gets alerted when Claude operations run long or hit issues"
---

# slack-error-notifications

Send Slack notifications when Claude Code encounters long-running operations or when tools take significant time

## Event Configuration

- **Event Type**: `Notification`
- **Tool Matcher**: `*`
- **Category**: notifications

## Environment Variables

None required

## Requirements

- SLACK_WEBHOOK_URL environment variable

### Script

```bash
#!/bin/bash
if [[ -z "$SLACK_WEBHOOK_URL" ]]; then
  exit 0
fi

# Forward the notification message to Slack
message=$(jq -r '.message // "Claude Code notification"')
payload=$(jq -n --arg text "$message" '{"text": $text}')

curl -s -X POST "$SLACK_WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$payload" >/dev/null 2>&1
```
