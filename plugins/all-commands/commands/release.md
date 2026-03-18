---
description: Prepare a new release by updating changelog, version, and documentation
category: ci-deployment
allowed-tools: Edit, Read, Bash(git *)
examples:
  - "/release v1.5.0"
  - "/release v2.0.0 — bump version, update CHANGELOG with all commits since v1.9.0, tag and update docs"
  - "/release patch v1.4.3 hotfix"
---

Update CHANGELOG.md with changes since the last version increase. Check our README.md for any necessary changes. Check the scope of changes since the last release and increase our version number as appropriate.