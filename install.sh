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

echo -e "  Creating directories..."
mkdir -p ~/.claude/mcp-configs ~/.claude/commands ~/.claude/scoped-prompts ~/.local/bin
echo -e "  ${GREEN}✓${NC} ~/.claude/{mcp-configs,commands,scoped-prompts}"
echo -e "  ${GREEN}✓${NC} ~/.local/bin"

echo ""
echo -e "  Downloading Beacon..."
curl -fsSL "$REPO/beacon"          -o ~/.local/bin/beacon
curl -fsSL "$REPO/marketplace.js"  -o ~/.local/bin/beacon-marketplace
chmod +x ~/.local/bin/beacon ~/.local/bin/beacon-marketplace
echo -e "  ${GREEN}✓${NC} beacon"
echo -e "  ${GREEN}✓${NC} beacon-marketplace"

echo ""
echo -e "  Installing starter task (review)..."
curl -fsSL "$REPO/commands/review.md"      -o ~/.claude/commands/review.md
curl -fsSL "$REPO/mcp-configs/review.json" -o ~/.claude/mcp-configs/review.json
echo -e "  ${GREEN}✓${NC} /review slash command"
echo -e "  ${GREEN}✓${NC} review MCP config"

echo ""
SHELL_RC=""
if [[ "$SHELL" == *"zsh"* ]];  then SHELL_RC="$HOME/.zshrc"; fi
if [[ "$SHELL" == *"bash"* ]]; then SHELL_RC="$HOME/.bash_profile"; fi

if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
  echo -e "  ${YELLOW}⚠${NC}  Adding ~/.local/bin to PATH in $SHELL_RC..."
  if [[ -n "$SHELL_RC" ]]; then
    echo '' >> "$SHELL_RC"
    echo '# Beacon' >> "$SHELL_RC"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_RC"
    export PATH="$HOME/.local/bin:$PATH"
  fi
  echo -e "  ${GREEN}✓${NC} PATH updated"
else
  echo -e "  ${GREEN}✓${NC} PATH already includes ~/.local/bin"
fi

echo ""
echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}${BOLD}Beacon installed.${NC}"
echo ""
echo -e "  ${BOLD}Open the plugin marketplace:${NC}"
echo -e "  ${CYAN}beacon-marketplace${NC}"
echo ""
echo -e "  ${BOLD}Or use directly in Claude Code:${NC}"
echo -e "  ${CYAN}/review${NC}      headless code review (starter task)"
echo -e "  ${CYAN}/review -i${NC}   interactive review session"
echo ""
if [[ -n "$SHELL_RC" ]] && ! command -v beacon &>/dev/null 2>&1; then
  echo -e "  ${YELLOW}Reload shell first:${NC}  source $SHELL_RC"
  echo ""
fi
