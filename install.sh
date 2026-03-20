#!/usr/bin/env bash
# Beacon — one-line installer
# Usage: curl -fsSL https://raw.githubusercontent.com/dr-code/beacon/main/install.sh | bash

set -euo pipefail

REPO="https://raw.githubusercontent.com/dr-code/beacon/main"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  ▸ Beacon${NC}  MCP context isolation for Claude Code"
echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Prerequisites ─────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo -e "  ${YELLOW}⚠${NC}  Node.js is required but not found."
  echo -e "     Install it from https://nodejs.org and re-run this script."
  echo ""
  exit 1
fi
echo -e "  ${GREEN}✓${NC} Node.js $(node --version)"

# ── Directories ───────────────────────────────────────────────────────────────
echo ""
echo -e "  Creating directories..."
mkdir -p \
  ~/.claude/commands \
  ~/.claude/beacon-tasks \
  ~/.claude/mcp-configs \
  ~/.local/bin \
  ~/.local/lib/beacon
echo -e "  ${GREEN}✓${NC} ~/.claude/{commands,beacon-tasks,mcp-configs}"
echo -e "  ${GREEN}✓${NC} ~/.local/{bin,lib/beacon}"

# ── Download core files ───────────────────────────────────────────────────────
echo ""
echo -e "  Downloading Beacon..."
curl -fsSL "$REPO/beacon"            -o ~/.local/bin/beacon
curl -fsSL "$REPO/marketplace.js"    -o ~/.local/lib/beacon/marketplace.js
curl -fsSL "$REPO/marketplace-ui.js" -o ~/.local/lib/beacon/marketplace-ui.js
chmod +x ~/.local/bin/beacon
echo -e "  ${GREEN}✓${NC} beacon"
echo -e "  ${GREEN}✓${NC} marketplace.js"
echo -e "  ${GREEN}✓${NC} marketplace-ui.js"

# ── Marketplace launcher ──────────────────────────────────────────────────────
cat > ~/.local/bin/beacon-marketplace <<'LAUNCHER'
#!/usr/bin/env bash
exec node "$HOME/.local/lib/beacon/marketplace.js" "$@"
LAUNCHER
chmod +x ~/.local/bin/beacon-marketplace
echo -e "  ${GREEN}✓${NC} beacon-marketplace"

# ── Starter slash command ─────────────────────────────────────────────────────
echo ""
echo -e "  Installing starter files..."
curl -fsSL "$REPO/commands/review.md"      -o ~/.claude/commands/review.md
curl -fsSL "$REPO/mcp-configs/review.json" -o ~/.claude/mcp-configs/review.json
echo -e "  ${GREEN}✓${NC} /review slash command"
echo -e "  ${GREEN}✓${NC} review legacy task config"

# ── PATH ─────────────────────────────────────────────────────────────────────
echo ""
SHELL_RC=""
if [[ "$SHELL" == *"zsh"* ]];  then SHELL_RC="$HOME/.zshrc"; fi
if [[ "$SHELL" == *"bash"* ]]; then SHELL_RC="$HOME/.bash_profile"; fi

if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
  echo -e "  ${YELLOW}⚠${NC}  Adding ~/.local/bin to PATH in $SHELL_RC..."
  if [[ -n "$SHELL_RC" ]]; then
    echo ''                                         >> "$SHELL_RC"
    echo '# Beacon'                                 >> "$SHELL_RC"
    echo 'export PATH="$HOME/.local/bin:$PATH"'    >> "$SHELL_RC"
    export PATH="$HOME/.local/bin:$PATH"
  fi
  echo -e "  ${GREEN}✓${NC} PATH updated"
else
  echo -e "  ${GREEN}✓${NC} PATH already includes ~/.local/bin"
fi

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}${BOLD}Beacon installed.${NC}"
echo ""
echo -e "  ${BOLD}Browse and install tasks:${NC}"
echo -e "  ${CYAN}beacon-marketplace${NC}"
echo ""
echo -e "  ${BOLD}Run a task:${NC}"
echo -e "  ${CYAN}beacon <task>     ${NC} headless"
echo -e "  ${CYAN}beacon <task> -i  ${NC} interactive session"
echo -e "  ${CYAN}beacon            ${NC} list installed tasks"
echo ""
echo -e "  ${BOLD}Quick start (before installing via marketplace):${NC}"
echo -e "  ${CYAN}/review${NC}   code review with isolated context"
echo ""
if [[ -n "$SHELL_RC" ]] && ! command -v beacon &>/dev/null 2>&1; then
  echo -e "  ${YELLOW}Reload shell first:${NC}  source $SHELL_RC"
  echo ""
fi
