---
description: Load project context by reading key documentation files and exploring project structure
category: context-loading-priming
allowed-tools: Bash(eza *), Read
examples:
  - "/prime"
  - "/prime load README, ARCHITECTURE_SUMMARY, and recent git log before starting the refactor"
  - "/prime focus on server/ and docs/PROJECT_CONTEXT.md"
---

# Context Prime
> Follow the instructions to understand the context of the project.

## Run the following command

eza . --tree --git-ignore

## Read the following files
> Read the files below and nothing else.

README.md
.claude/commands/COMMANDS.md
ai_docs/AI_DOCS.md
specs/SPECS.md