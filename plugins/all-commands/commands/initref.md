---
description: Build reference documentation by creating markdown files and updating CLAUDE.md
category: context-loading-priming
allowed-tools: Read, Write, LS, Glob
examples:
  - "/initref"
  - "/initref generate docs for the auth module"
  - "/initref build full reference docs for server/services, create markdown files per service, and update CLAUDE.md with the new structure"
---

Build the reference docs. Run /summarize on files to get summaries, don't read too many file contents to avoid burning usage. Read important files directly.

Create reference markdown files in `/ref` directory.

Update `CLAUDE.md` file with pointers to important documentation files.