---
description: Update current git branch name based on analysis of changes made
category: version-control-git
allowed-tools: Bash(git *)
examples:
  - "/update-branch-name"
  - "/update-branch-name based on recent commits"
  - "/update-branch-name analyze all commits since branching from main and suggest a descriptive branch name following the feat/fix/chore convention"
---

# Update Branch Name

Follow these steps to update the current branch name:

1. Check differences between current branch and main branch HEAD using `git diff main...HEAD`
2. Analyze the changed files to understand what work is being done
3. Determine an appropriate descriptive branch name based on the changes
4. Update the current branch name using `git branch -m [new-branch-name]`
5. Verify the branch name was updated with `git branch`