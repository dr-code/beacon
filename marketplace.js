#!/usr/bin/env node
// beacon-marketplace — localhost MCP browser for Beacon
// Runs at http://localhost:4747
// No npm install needed — uses only Node.js built-ins

const http = require('http');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const PORT          = 4747;
const HOME          = os.homedir();
const CONFIGS_DIR   = path.join(HOME, '.claude', 'mcp-configs');
const COMMANDS_DIR  = path.join(HOME, '.claude', 'commands');
const PROMPTS_DIR   = path.join(HOME, '.claude', 'scoped-prompts');

// ── MCP Catalog ──────────────────────────────────────────────────────────────
const CATALOG = [
  // ── Code & Version Control ─────────────────────────────────────────────────
  {
    id: 'github',
    name: 'GitHub',
    publisher: 'Anthropic',
    official: true,
    category: 'code',
    emoji: '🐙',
    description: 'Read and write to GitHub repos, manage PRs, issues, branches, and releases.',
    tags: ['git', 'pr', 'issues', 'ci'],
    package: '@modelcontextprotocol/server-github',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    envVars: [{ key: 'GITHUB_PERSONAL_ACCESS_TOKEN', label: 'GitHub Personal Access Token', required: true, hint: 'github.com → Settings → Developer settings → Tokens' }],
    defaultPrompt: 'Help me with GitHub tasks: reviewing PRs, checking issues, managing branches, and summarizing repository activity. Focus on the current repository context.',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    publisher: 'Anthropic',
    official: true,
    category: 'code',
    emoji: '🦊',
    description: 'Interact with GitLab repos, merge requests, issues, and pipelines.',
    tags: ['git', 'mr', 'ci/cd'],
    package: '@modelcontextprotocol/server-gitlab',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-gitlab'],
    envVars: [
      { key: 'GITLAB_PERSONAL_ACCESS_TOKEN', label: 'GitLab Personal Access Token', required: true, hint: 'GitLab → User Settings → Access Tokens' },
      { key: 'GITLAB_API_URL', label: 'GitLab API URL', required: false, hint: 'Leave blank for gitlab.com. Self-hosted: https://gitlab.example.com/api/v4' },
    ],
    defaultPrompt: 'Help me with GitLab tasks: reviewing merge requests, triaging issues, checking pipeline status, and managing repository branches.',
  },

  // ── Browser & Testing ──────────────────────────────────────────────────────
  {
    id: 'playwright',
    name: 'Playwright',
    publisher: 'Microsoft',
    official: true,
    category: 'browser',
    emoji: '🎭',
    description: 'Full browser automation via Playwright — navigate, click, screenshot, test web apps.',
    tags: ['browser', 'e2e', 'testing', 'scraping'],
    package: '@playwright/mcp',
    command: 'npx',
    args: ['-y', '@playwright/mcp'],
    envVars: [],
    defaultPrompt: 'Help me automate browser tasks: navigating pages, filling forms, taking screenshots, running end-to-end tests, and extracting web content.',
  },
  {
    id: 'puppeteer',
    name: 'Puppeteer',
    publisher: 'Anthropic',
    official: true,
    category: 'browser',
    emoji: '🤖',
    description: 'Chrome/Chromium automation via Puppeteer — screenshots, PDFs, web scraping.',
    tags: ['browser', 'chrome', 'pdf', 'scraping'],
    package: '@modelcontextprotocol/server-puppeteer',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    envVars: [],
    defaultPrompt: 'Help me automate Chrome browser tasks: taking screenshots, generating PDFs, scraping web content, and navigating pages programmatically.',
  },

  // ── Database ───────────────────────────────────────────────────────────────
  {
    id: 'postgres',
    name: 'PostgreSQL',
    publisher: 'Anthropic',
    official: true,
    category: 'database',
    emoji: '🐘',
    description: 'Query and inspect PostgreSQL databases — run SQL, explore schemas, analyze data.',
    tags: ['sql', 'postgres', 'database'],
    package: '@modelcontextprotocol/server-postgres',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    envVars: [{ key: 'POSTGRES_CONNECTION_STRING', label: 'Connection String', required: true, hint: 'postgresql://user:password@localhost:5432/dbname' }],
    customArgs: true,
    defaultPrompt: 'Help me work with this PostgreSQL database: querying data, inspecting schemas, writing migrations, and analyzing table relationships.',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    publisher: 'Supabase',
    official: false,
    category: 'database',
    emoji: '⚡',
    description: 'Manage Supabase projects — query data, manage tables, handle auth, and storage.',
    tags: ['postgres', 'auth', 'storage', 'realtime'],
    package: '@supabase/mcp-server-supabase@latest',
    command: 'npx',
    args: ['-y', '@supabase/mcp-server-supabase@latest'],
    envVars: [{ key: 'SUPABASE_ACCESS_TOKEN', label: 'Supabase Access Token', required: true, hint: 'supabase.com → Account → Access Tokens' }],
    defaultPrompt: 'Help me manage this Supabase project: querying tables, writing RLS policies, managing auth users, inspecting storage buckets, and reviewing edge functions.',
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    publisher: 'Anthropic',
    official: true,
    category: 'database',
    emoji: '🗄️',
    description: 'Read and query local SQLite database files.',
    tags: ['sql', 'sqlite', 'local'],
    package: '@modelcontextprotocol/server-sqlite',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite'],
    envVars: [{ key: 'SQLITE_DB_PATH', label: 'SQLite Database Path', required: true, hint: '/path/to/your/database.db' }],
    defaultPrompt: 'Help me explore and query this SQLite database: inspecting tables, running queries, analyzing data patterns, and explaining the schema.',
  },

  // ── DevOps & Monitoring ────────────────────────────────────────────────────
  {
    id: 'sentry',
    name: 'Sentry',
    publisher: 'Sentry',
    official: false,
    category: 'devops',
    emoji: '🚨',
    description: 'Pull Sentry errors, analyze stack traces, correlate issues with releases.',
    tags: ['errors', 'monitoring', 'debugging'],
    package: '@sentry/mcp-server',
    command: 'npx',
    args: ['-y', '@sentry/mcp-server'],
    envVars: [
      { key: 'SENTRY_AUTH_TOKEN', label: 'Sentry Auth Token', required: true, hint: 'sentry.io → Settings → Auth Tokens' },
      { key: 'SENTRY_ORG', label: 'Organization Slug', required: true, hint: 'Found in your Sentry org URL' },
    ],
    defaultPrompt: 'Help me investigate Sentry errors: pull recent issues, analyze stack traces, identify error patterns, and suggest fixes based on the code context.',
  },
  {
    id: 'linear',
    name: 'Linear',
    publisher: 'Linear',
    official: false,
    category: 'devops',
    emoji: '📐',
    description: 'Manage Linear issues, cycles, and projects — create, update, and triage tickets.',
    tags: ['issues', 'project management', 'sprint'],
    package: '@linear/mcp-server',
    command: 'npx',
    args: ['-y', '@linear/mcp-server'],
    envVars: [{ key: 'LINEAR_API_KEY', label: 'Linear API Key', required: true, hint: 'linear.app → Settings → API → Personal API Keys' }],
    defaultPrompt: 'Help me manage Linear: create issues from code TODOs, update ticket statuses, summarize current cycle progress, and triage the backlog.',
  },
  {
    id: 'filesystem',
    name: 'Filesystem',
    publisher: 'Anthropic',
    official: true,
    category: 'devops',
    emoji: '📁',
    description: 'Read and write files with configurable directory access controls.',
    tags: ['files', 'read', 'write', 'local'],
    package: '@modelcontextprotocol/server-filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem'],
    envVars: [{ key: 'ALLOWED_PATHS', label: 'Allowed Directories (space-separated)', required: true, hint: '/Users/you/projects /Users/you/Documents' }],
    defaultPrompt: 'Help me work with files in the configured directories: reading, writing, organizing, and analyzing file contents.',
  },

  // ── Search & Research ──────────────────────────────────────────────────────
  {
    id: 'brave-search',
    name: 'Brave Search',
    publisher: 'Anthropic',
    official: true,
    category: 'search',
    emoji: '🔍',
    description: 'Web search via Brave Search API — privacy-respecting, no tracking.',
    tags: ['web', 'search', 'research'],
    package: '@modelcontextprotocol/server-brave-search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    envVars: [{ key: 'BRAVE_API_KEY', label: 'Brave Search API Key', required: true, hint: 'brave.com/search/api → Get API Key' }],
    defaultPrompt: 'Help me research topics using web search. Find current information, summarize findings, and cross-reference sources.',
  },
  {
    id: 'fetch',
    name: 'Fetch',
    publisher: 'Anthropic',
    official: true,
    category: 'search',
    emoji: '🌐',
    description: 'Fetch and convert web pages to markdown — read docs, articles, and websites.',
    tags: ['web', 'fetch', 'docs', 'scraping'],
    package: '@modelcontextprotocol/server-fetch',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch'],
    envVars: [],
    defaultPrompt: 'Help me fetch and analyze web content: read documentation pages, extract key information from articles, and summarize online resources.',
  },
  {
    id: 'context7',
    name: 'Context7',
    publisher: 'Upstash',
    official: false,
    category: 'search',
    emoji: '📚',
    description: 'Pull up-to-date library documentation directly into context — always current, never hallucinated.',
    tags: ['docs', 'libraries', 'api reference'],
    package: '@upstash/context7-mcp',
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp'],
    envVars: [],
    defaultPrompt: 'Help me find accurate documentation for libraries and frameworks. Pull the latest API references and usage examples to inform the code I\'m writing.',
  },

  // ── Productivity & Communication ───────────────────────────────────────────
  {
    id: 'slack',
    name: 'Slack',
    publisher: 'Anthropic',
    official: true,
    category: 'productivity',
    emoji: '💬',
    description: 'Read channels, send messages, search conversations, and manage Slack workspaces.',
    tags: ['messaging', 'teams', 'communication'],
    package: '@modelcontextprotocol/server-slack',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    envVars: [
      { key: 'SLACK_BOT_TOKEN', label: 'Slack Bot Token', required: true, hint: 'api.slack.com → Your App → OAuth & Permissions → Bot Token' },
      { key: 'SLACK_TEAM_ID', label: 'Workspace Team ID', required: true, hint: 'Found in Slack workspace URL' },
    ],
    defaultPrompt: 'Help me manage Slack: summarize unread messages, draft responses, find relevant conversations, and coordinate team communication.',
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    publisher: 'Anthropic',
    official: true,
    category: 'productivity',
    emoji: '🗺️',
    description: 'Geocoding, directions, place search, and distance calculations via Google Maps.',
    tags: ['maps', 'location', 'geocoding'],
    package: '@modelcontextprotocol/server-google-maps',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-maps'],
    envVars: [{ key: 'GOOGLE_MAPS_API_KEY', label: 'Google Maps API Key', required: true, hint: 'console.cloud.google.com → APIs → Maps JavaScript API' }],
    defaultPrompt: 'Help me with location-based tasks: geocoding addresses, calculating routes, finding nearby places, and analyzing geographic data.',
  },
  {
    id: 'figma',
    name: 'Figma',
    publisher: 'Community',
    official: false,
    category: 'productivity',
    emoji: '🎨',
    description: 'Read Figma designs — extract tokens, inspect components, generate code from designs.',
    tags: ['design', 'ui', 'components', 'tokens'],
    package: 'figma-mcp',
    command: 'npx',
    args: ['-y', 'figma-mcp'],
    envVars: [{ key: 'FIGMA_ACCESS_TOKEN', label: 'Figma Access Token', required: true, hint: 'figma.com → Account Settings → Personal Access Tokens' }],
    defaultPrompt: 'Help me work with Figma designs: extract design tokens, inspect component properties, and generate code that matches the design specifications.',
  },

  // ── AI & Memory ───────────────────────────────────────────────────────────
  {
    id: 'memory',
    name: 'Memory',
    publisher: 'Anthropic',
    official: true,
    category: 'ai',
    emoji: '🧠',
    description: 'Persistent knowledge graph memory — store and retrieve facts, entities, and relationships across sessions.',
    tags: ['memory', 'knowledge graph', 'persistence'],
    package: '@modelcontextprotocol/server-memory',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    envVars: [],
    defaultPrompt: 'Use persistent memory to store and retrieve important facts, decisions, and context from our work. Query existing memories before answering and update them as we learn new things.',
  },
  {
    id: 'sequential-thinking',
    name: 'Sequential Thinking',
    publisher: 'Anthropic',
    official: true,
    category: 'ai',
    emoji: '🧩',
    description: 'Structured chain-of-thought reasoning — breaks complex problems into sequential steps.',
    tags: ['reasoning', 'planning', 'thinking'],
    package: '@modelcontextprotocol/server-sequential-thinking',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    envVars: [],
    defaultPrompt: 'Use sequential thinking to work through complex problems methodically. Break down the task into clear steps, reason through each one, and revise your approach as needed.',
  },
];

const CATEGORIES = [
  { id: 'all',          label: 'All',          emoji: '✦' },
  { id: 'code',         label: 'Code & Git',   emoji: '🐙' },
  { id: 'browser',      label: 'Browser',      emoji: '🎭' },
  { id: 'database',     label: 'Database',     emoji: '🗄️' },
  { id: 'devops',       label: 'DevOps',       emoji: '🚨' },
  { id: 'search',       label: 'Search & Docs',emoji: '🔍' },
  { id: 'productivity', label: 'Productivity', emoji: '💬' },
  { id: 'ai',           label: 'AI & Memory',  emoji: '🧠' },
];

// ── File helpers ──────────────────────────────────────────────────────────────
function getInstalled() {
  if (!fs.existsSync(CONFIGS_DIR)) return [];
  return fs.readdirSync(CONFIGS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

function installMCP({ id, mcpConfig, command, defaultPrompt }) {
  fs.mkdirSync(CONFIGS_DIR, { recursive: true });
  fs.mkdirSync(COMMANDS_DIR, { recursive: true });
  fs.mkdirSync(PROMPTS_DIR,  { recursive: true });

  // 1. MCP config
  fs.writeFileSync(
    path.join(CONFIGS_DIR, `${id}.json`),
    JSON.stringify(mcpConfig, null, 2)
  );

  // 2. Slash command
  const slashCmd = `---\ndescription: "${command.description}"\nallowed-tools: Bash\n---\n\n!beacon ${id} $ARGUMENTS\n`;
  fs.writeFileSync(path.join(COMMANDS_DIR, `${id}.md`), slashCmd);

  // 3. Default headless prompt
  if (defaultPrompt) {
    fs.writeFileSync(path.join(PROMPTS_DIR, `${id}.txt`), defaultPrompt);
  }
}

function removeMCP(id) {
  [
    path.join(CONFIGS_DIR,  `${id}.json`),
    path.join(COMMANDS_DIR, `${id}.md`),
    path.join(PROMPTS_DIR,  `${id}.txt`),
  ].forEach(f => { try { fs.unlinkSync(f); } catch {} });
}

// ── HTML ──────────────────────────────────────────────────────────────────────
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Beacon — MCP Marketplace</title>
<style>
:root {
  --bg:#0f1117;--surface:#1a1d27;--surface2:#22263a;--border:#2e334d;
  --accent:#6c8fff;--accent2:#a78bfa;--green:#4ade80;--yellow:#fbbf24;
  --red:#f87171;--text:#e2e8f0;--muted:#8892aa;--code:#0d1117;
}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;display:flex;flex-direction:column;height:100vh;overflow:hidden;}

/* Top bar */
.topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:0 24px;height:56px;display:flex;align-items:center;gap:20px;flex-shrink:0;}
.logo{font-size:18px;font-weight:800;background:linear-gradient(135deg,#e2e8f0,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-0.5px;}
.logo-sub{color:var(--muted);font-size:12px;font-weight:500;margin-left:-12px;}
.search{flex:1;max-width:360px;background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:8px 14px;color:var(--text);font-size:13px;outline:none;}
.search:focus{border-color:var(--accent);}
.search::placeholder{color:var(--muted);}
.installed-count{margin-left:auto;font-size:13px;color:var(--muted);}
.installed-count span{color:var(--green);font-weight:700;}

/* Layout */
.layout{display:flex;flex:1;overflow:hidden;}

/* Sidebar */
.sidebar{width:200px;background:var(--surface);border-right:1px solid var(--border);padding:16px 12px;overflow-y:auto;flex-shrink:0;}
.sidebar-label{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--muted);padding:0 8px;margin-bottom:8px;}
.cat-btn{display:flex;align-items:center;gap:9px;width:100%;padding:8px 10px;border-radius:7px;background:none;border:none;color:var(--muted);font-size:13px;cursor:pointer;text-align:left;transition:background 0.15s,color 0.15s;}
.cat-btn:hover{background:var(--surface2);color:var(--text);}
.cat-btn.active{background:rgba(108,143,255,0.12);color:var(--accent);font-weight:600;}
.cat-btn .emoji{font-size:15px;width:20px;text-align:center;}
.cat-count{margin-left:auto;font-size:11px;color:var(--muted);background:var(--surface2);padding:1px 6px;border-radius:10px;}

/* Main grid */
.main{flex:1;overflow-y:auto;padding:24px;}
.grid-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;}
.grid-header h2{font-size:15px;font-weight:700;color:var(--text);}
.grid-header .count{font-size:12px;color:var(--muted);}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}

/* Cards */
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:12px;transition:border-color 0.15s,transform 0.15s;}
.card:hover{border-color:rgba(108,143,255,0.4);transform:translateY(-1px);}
.card.installed{border-color:rgba(74,222,128,0.3);}
.card-top{display:flex;align-items:flex-start;gap:12px;}
.card-emoji{font-size:26px;width:44px;height:44px;background:var(--surface2);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.card-meta{flex:1;}
.card-name{font-size:15px;font-weight:700;color:var(--text);display:flex;align-items:center;gap:6px;}
.badge-official{font-size:9px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;background:rgba(108,143,255,0.15);color:var(--accent);border:1px solid rgba(108,143,255,0.25);padding:1px 6px;border-radius:10px;}
.card-publisher{font-size:11px;color:var(--muted);margin-top:2px;}
.card-desc{font-size:13px;color:var(--muted);line-height:1.5;}
.card-tags{display:flex;flex-wrap:wrap;gap:5px;}
.tag{font-size:10px;padding:2px 7px;border-radius:10px;background:var(--surface2);border:1px solid var(--border);color:var(--muted);}
.card-envs{font-size:11px;color:var(--yellow);display:flex;align-items:center;gap:5px;}
.card-envs .dot{width:5px;height:5px;border-radius:50%;background:var(--yellow);flex-shrink:0;}
.card-footer{display:flex;align-items:center;justify-content:space-between;margin-top:auto;}
.btn{padding:7px 16px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;}
.btn-add{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;}
.btn-add:hover{opacity:0.9;transform:translateY(-1px);}
.btn-remove{background:var(--surface2);color:var(--muted);border:1px solid var(--border);}
.btn-remove:hover{border-color:var(--red);color:var(--red);}
.installed-pill{display:flex;align-items:center;gap:5px;font-size:11px;color:var(--green);font-weight:600;}
.installed-pill::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--green);}

/* Modal */
.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.7);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.2s;}
.modal-backdrop.open{opacity:1;pointer-events:all;}
.modal{background:var(--surface);border:1px solid var(--border);border-radius:14px;width:480px;max-width:90vw;padding:28px;position:relative;}
.modal h3{font-size:17px;font-weight:700;margin-bottom:6px;display:flex;align-items:center;gap:10px;}
.modal .subtitle{font-size:13px;color:var(--muted);margin-bottom:20px;}
.form-field{margin-bottom:16px;}
.form-label{display:block;font-size:11px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}
.form-label .req{color:var(--red);}
.form-input{width:100%;background:var(--code);border:1px solid var(--border);border-radius:7px;padding:9px 12px;color:var(--text);font-size:13px;font-family:monospace;outline:none;}
.form-input:focus{border-color:var(--accent);}
.form-hint{font-size:11px;color:var(--muted);margin-top:4px;}
.modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;}
.btn-cancel{background:var(--surface2);color:var(--muted);border:1px solid var(--border);}
.btn-install{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff;padding:9px 24px;}

/* Toast */
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(8px);background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px 20px;font-size:13px;font-weight:600;opacity:0;pointer-events:none;transition:all 0.25s;z-index:200;display:flex;align-items:center;gap:8px;}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
.toast.success{border-color:rgba(74,222,128,0.4);color:var(--green);}
.toast.error{border-color:rgba(248,113,113,0.4);color:var(--red);}

.empty{text-align:center;padding:60px 20px;color:var(--muted);}
.empty .icon{font-size:36px;margin-bottom:12px;}
</style>
</head>
<body>

<div class="topbar">
  <div class="logo">Beacon <span class="logo-sub">Marketplace</span></div>
  <input class="search" id="search" type="text" placeholder="Search MCPs…">
  <div class="installed-count">
    <span id="installed-num">0</span> installed
  </div>
</div>

<div class="layout">
  <div class="sidebar">
    <div class="sidebar-label">Categories</div>
    <div id="cats"></div>
  </div>

  <div class="main">
    <div class="grid-header">
      <h2 id="grid-title">All plugins</h2>
      <div class="count" id="grid-count"></div>
    </div>
    <div class="grid" id="grid"></div>
  </div>
</div>

<!-- Modal -->
<div class="modal-backdrop" id="modal-backdrop">
  <div class="modal" id="modal">
    <h3 id="modal-title"></h3>
    <div class="subtitle" id="modal-subtitle"></div>
    <div id="modal-fields"></div>
    <div class="modal-actions">
      <button class="btn btn-cancel" onclick="closeModal()">Cancel</button>
      <button class="btn btn-install" onclick="confirmInstall()">Add to Beacon</button>
    </div>
  </div>
</div>

<!-- Toast -->
<div class="toast" id="toast"></div>

<script>
const CATALOG = ${JSON.stringify(CATALOG)};
const CATEGORIES = ${JSON.stringify(CATEGORIES)};

let activeCategory = 'all';
let searchQuery = '';
let installed = new Set();
let pendingMCP = null;

async function loadInstalled() {
  const r = await fetch('/api/installed');
  const ids = await r.json();
  installed = new Set(ids);
  document.getElementById('installed-num').textContent = installed.size;
}

function getCategoryCounts() {
  const counts = {};
  CATALOG.forEach(m => { counts[m.category] = (counts[m.category] || 0) + 1; });
  return counts;
}

function renderCategories() {
  const counts = getCategoryCounts();
  const el = document.getElementById('cats');
  el.innerHTML = CATEGORIES.map(c => {
    const count = c.id === 'all' ? CATALOG.length : (counts[c.id] || 0);
    return \`<button class="cat-btn\${activeCategory===c.id?' active':''}" onclick="setCategory('\${c.id}')">
      <span class="emoji">\${c.emoji}</span>
      \${c.label}
      <span class="cat-count">\${count}</span>
    </button>\`;
  }).join('');
}

function setCategory(id) {
  activeCategory = id;
  renderCategories();
  renderGrid();
}

function filteredMCPs() {
  return CATALOG.filter(m => {
    const catMatch = activeCategory === 'all' || m.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const textMatch = !q ||
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some(t => t.toLowerCase().includes(q));
    return catMatch && textMatch;
  });
}

function renderGrid() {
  const mcps = filteredMCPs();
  const cat = CATEGORIES.find(c => c.id === activeCategory);
  document.getElementById('grid-title').textContent =
    activeCategory === 'all' ? 'All plugins' : cat.label;
  document.getElementById('grid-count').textContent = \`\${mcps.length} plugin\${mcps.length!==1?'s':''}\`;

  const grid = document.getElementById('grid');
  if (mcps.length === 0) {
    grid.innerHTML = '<div class="empty"><div class="icon">🔦</div><div>No plugins found</div></div>';
    return;
  }

  grid.innerHTML = mcps.map(m => {
    const isInstalled = installed.has(m.id);
    const needsEnv = m.envVars.filter(e => e.required).length > 0;
    return \`
    <div class="card\${isInstalled?' installed':''}">
      <div class="card-top">
        <div class="card-emoji">\${m.emoji}</div>
        <div class="card-meta">
          <div class="card-name">
            \${m.name}
            \${m.official ? '<span class="badge-official">Official</span>' : ''}
          </div>
          <div class="card-publisher">\${m.publisher}</div>
        </div>
      </div>
      <div class="card-desc">\${m.description}</div>
      <div class="card-tags">\${m.tags.map(t=>\`<span class="tag">\${t}</span>\`).join('')}</div>
      \${needsEnv ? \`<div class="card-envs"><div class="dot"></div>Requires \${m.envVars.filter(e=>e.required).length} API key\${m.envVars.filter(e=>e.required).length>1?'s':''}</div>\` : ''}
      <div class="card-footer">
        \${isInstalled
          ? \`<div class="installed-pill">Installed — /\${m.id}</div>
             <button class="btn btn-remove" onclick="removePlugin('\${m.id}')">Remove</button>\`
          : \`<div></div><button class="btn btn-add" onclick="openModal('\${m.id}')">Add to Beacon</button>\`
        }
      </div>
    </div>\`;
  }).join('');
}

function openModal(id) {
  pendingMCP = CATALOG.find(m => m.id === id);
  const m = pendingMCP;
  document.getElementById('modal-title').innerHTML = \`\${m.emoji} \${m.name}\`;
  document.getElementById('modal-subtitle').textContent =
    m.envVars.length === 0
      ? 'No configuration needed. Ready to install.'
      : 'Enter your credentials. These are stored locally in ~/.claude/mcp-configs/.';

  const fields = m.envVars.map(e => \`
    <div class="form-field">
      <label class="form-label">\${e.label}\${e.required?'<span class="req"> *</span>':' <span style="color:var(--muted)">(optional)</span>'}</label>
      <input class="form-input" id="field-\${e.key}" type="\${e.key.toLowerCase().includes('token')||e.key.toLowerCase().includes('key')||e.key.toLowerCase().includes('secret')?'password':'text'}" placeholder="\${e.hint}">
      <div class="form-hint">\${e.hint}</div>
    </div>
  \`).join('');

  document.getElementById('modal-fields').innerHTML = fields;
  document.getElementById('modal-backdrop').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
  pendingMCP = null;
}

async function confirmInstall() {
  const m = pendingMCP;
  if (!m) return;

  // Collect env var values
  const envValues = {};
  for (const e of m.envVars) {
    const val = document.getElementById('field-' + e.key)?.value?.trim() || '';
    if (e.required && !val) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    envValues[e.key] = val;
  }

  // Build mcp config
  const env = {};
  m.envVars.forEach(e => { if (envValues[e.key]) env[e.key] = envValues[e.key]; });

  // Handle special cases (like postgres connection string in args)
  let args = [...m.args];
  if (m.id === 'postgres' && envValues['POSTGRES_CONNECTION_STRING']) {
    args.push(envValues['POSTGRES_CONNECTION_STRING']);
    delete env['POSTGRES_CONNECTION_STRING'];
  }
  if (m.id === 'sqlite' && envValues['SQLITE_DB_PATH']) {
    args.push(envValues['SQLITE_DB_PATH']);
    delete env['SQLITE_DB_PATH'];
  }
  if (m.id === 'filesystem' && envValues['ALLOWED_PATHS']) {
    const paths = envValues['ALLOWED_PATHS'].split(' ').filter(Boolean);
    args.push(...paths);
    delete env['ALLOWED_PATHS'];
  }

  const mcpConfig = {
    mcpServers: {
      [m.id]: Object.keys(env).length > 0
        ? { command: m.command, args, env }
        : { command: m.command, args }
    }
  };

  const res = await fetch('/api/install', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: m.id,
      mcpConfig,
      command: { description: m.description },
      defaultPrompt: m.defaultPrompt,
    })
  });

  if (res.ok) {
    closeModal();
    installed.add(m.id);
    document.getElementById('installed-num').textContent = installed.size;
    renderGrid();
    showToast(\`✓ \${m.name} added — use /\${m.id} in Claude Code\`, 'success');
  } else {
    showToast('Install failed — check terminal for errors', 'error');
  }
}

async function removePlugin(id) {
  const m = CATALOG.find(c => c.id === id);
  if (!confirm(\`Remove \${m.name} from Beacon?\`)) return;
  const res = await fetch(\`/api/remove/\${id}\`, { method: 'DELETE' });
  if (res.ok) {
    installed.delete(id);
    document.getElementById('installed-num').textContent = installed.size;
    renderGrid();
    showToast(\`Removed \${m.name}\`, 'error');
  }
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = \`toast \${type} show\`;
  setTimeout(() => t.classList.remove('show'), 3500);
}

// Close modal on backdrop click
document.getElementById('modal-backdrop').addEventListener('click', e => {
  if (e.target.id === 'modal-backdrop') closeModal();
});

// Search
document.getElementById('search').addEventListener('input', e => {
  searchQuery = e.target.value;
  renderGrid();
});

// Init
(async () => {
  await loadInstalled();
  renderCategories();
  renderGrid();
})();
</script>
</body>
</html>`;

// ── HTTP Server ───────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {
  const url  = req.url;
  const method = req.method;

  // GET /
  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML);
    return;
  }

  // GET /api/installed
  if (method === 'GET' && url === '/api/installed') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(getInstalled()));
    return;
  }

  // POST /api/install
  if (method === 'POST' && url === '/api/install') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        installMCP(JSON.parse(body));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error('Install error:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // DELETE /api/remove/:id
  if (method === 'DELETE' && url.startsWith('/api/remove/')) {
    const id = url.replace('/api/remove/', '').replace(/[^a-z0-9-_]/gi, '');
    removeMCP(id);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://localhost:${PORT}`;
  console.log('');
  console.log('  ▸ Beacon Marketplace');
  console.log(`  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`  Running at ${url}`);
  console.log('');
  console.log('  Browse and install MCP plugins.');
  console.log('  Installed configs go to ~/.claude/');
  console.log('  Ctrl+C to stop.');
  console.log('');

  // Auto-open browser on macOS
  const { exec } = require('child_process');
  exec(`open ${url}`);
});
