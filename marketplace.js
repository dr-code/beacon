#!/usr/bin/env node
// beacon marketplace — localhost:4747
// Serves the Beacon task marketplace. No npm dependencies (Node.js built-ins only).

'use strict';
const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

// ── Constants ─────────────────────────────────────────────────────────────────
const PORT         = 4747;
const HOME         = os.homedir();
const CLAUDE_DIR   = path.join(HOME, '.claude');
const TASKS_DIR    = path.join(CLAUDE_DIR, 'beacon-tasks');
const COMP_DIR     = path.join(TASKS_DIR, 'components');
const COMMANDS_DIR = path.join(CLAUDE_DIR, 'commands');

const REPO       = 'dr-code/beacon';
const RAW        = `https://raw.githubusercontent.com/${REPO}/main`;
const TREE_URL   = `https://api.github.com/repos/${REPO}/git/trees/main?recursive=1`;
const MCP_REG    = 'https://registry.modelcontextprotocol.io';
const TTL        = 60 * 60 * 1000; // 1 hour

// ── Cache ─────────────────────────────────────────────────────────────────────
const cache = {
  agents:  { data: null, at: 0 },
  skills:  { data: null, at: 0 },
  hooks:   { data: null, at: 0 },
  commands:{ data: null, at: 0 },
  mcps:    { data: null, at: 0 },
};
const fresh = k => cache[k].data !== null && (Date.now() - cache[k].at) < TTL;
const get   = k => cache[k].data || [];
const set   = (k, d) => { cache[k] = { data: d, at: Date.now() }; return d; };

// ── HTTP ──────────────────────────────────────────────────────────────────────
function httpsGet(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const headers = { 'User-Agent': 'beacon/2.0', 'Accept': 'application/json', ...extraHeaders };
    const req = https.get(url, { headers, timeout: 15000 }, res => {
      if (res.statusCode === 301 || res.statusCode === 302)
        return httpsGet(res.headers.location, extraHeaders).then(resolve).catch(reject);
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout: ' + url)); });
  });
}
const fetchJSON = url => httpsGet(url).then(r => JSON.parse(r.body));
const fetchText = url => httpsGet(url, { Accept: 'text/plain' }).then(r => r.body);

// ── Parsers ───────────────────────────────────────────────────────────────────
function parseFM(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const obj = {};
  let arrKey = null;
  for (const line of m[1].split('\n')) {
    const item = line.match(/^\s+- (.*)/);
    if (item && arrKey) {
      if (!Array.isArray(obj[arrKey])) obj[arrKey] = [];
      obj[arrKey].push(item[1].trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    arrKey = null;
    const ci = line.indexOf(':');
    if (ci <= 0) continue;
    const k = line.slice(0, ci).trim();
    const v = line.slice(ci + 1).trim();
    if (!k) continue;
    if (v === '') { arrKey = k; }
    else { obj[k] = v.replace(/^["']|["']$/g, ''); }
  }
  return obj;
}

function extractBody(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
}

function extractScript(content) {
  const m = content.match(/```(?:bash|sh)\r?\n([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}

// Token estimate: ~4 chars per token. Hooks have zero context cost (process-based).
const MCP_TOKEN_BY_CAT = {
  'development': 12000, 'cloud-infrastructure': 8000, 'ai-task-management': 6000,
  'database': 5000, 'security': 4000, 'productivity': 3000,
  'communication': 3000, 'automation': 2500, 'utilities': 2000,
  'data-analytics': 5000, 'finance': 3000, 'design': 4000,
};

function tokenCost(content, type) {
  if (type === 'hook' || type === 'command') return 0;
  return Math.ceil(extractBody(content).length / 4);
}

// ── Pre-built task bundles ────────────────────────────────────────────────────
// These are curated starting points. Users can customize or create their own.
const BUILT_IN_TASKS = [
  {
    name: 'review',
    description: 'Code review with isolated context — GitHub MCP + code-reviewer persona',
    prompt: 'Review the current git diff. Check for correctness, edge cases, error handling, naming clarity, and security issues. Format as a structured report with sections.',
    mcps: [],
    agents: ['code-reviewer'],
    skills: [],
    hooks: [],
    category: 'code-quality',
    examples: ['beacon review', '/review', '/review "focus on auth middleware"'],
  },
  {
    name: 'browser',
    description: 'Browser automation with Playwright MCP — only browser tools loaded',
    prompt: 'You are a browser automation specialist with Playwright available. Help with browser tasks, E2E testing, and web debugging.',
    mcps: [{ name: 'playwright', command: 'npx', args: ['-y', '@playwright/mcp'] }],
    agents: ['frontend-developer'],
    skills: [],
    hooks: [],
    category: 'browser',
    examples: ['beacon browser -i', '/browser -i', 'beacon browser "test the login flow"'],
  },
  {
    name: 'db',
    description: 'Database session with Postgres MCP — only DB tools loaded',
    prompt: 'You are a database specialist with Postgres access. Help with queries, schema design, and migrations.',
    mcps: [{ name: 'postgres', command: 'npx', args: ['-y', '@modelcontextprotocol/server-postgres', '${DATABASE_URL}'] }],
    agents: ['database-admin'],
    skills: [],
    hooks: [],
    category: 'database',
    examples: ['beacon db -i', '/db -i', 'beacon db "analyze slow queries"'],
  },
  {
    name: 'security',
    description: 'Security audit session — security-auditor persona with change-tracker hook',
    prompt: 'You are a security specialist. Audit the codebase for vulnerabilities, exposed secrets, insecure patterns, and compliance issues.',
    mcps: [],
    agents: ['security-auditor'],
    skills: [],
    hooks: ['security-scanner'],
    category: 'security',
    examples: ['beacon security', '/security', 'beacon security "audit the auth system"'],
  },
  {
    name: 'docs',
    description: 'Documentation session — technical-researcher persona, no MCP overhead',
    prompt: 'You are a technical writer and researcher. Help create clear, accurate documentation.',
    mcps: [],
    agents: ['technical-researcher'],
    skills: ['changelog-generator'],
    hooks: [],
    category: 'documentation',
    examples: ['beacon docs', '/docs', 'beacon docs "write API documentation for this module"'],
  },
  {
    name: 'debug',
    description: 'Debugging session — debugger + error-detective agents focused on root cause',
    prompt: 'You are a debugging specialist. Identify root causes, not symptoms. Trace errors systematically.',
    mcps: [],
    agents: ['debugger', 'error-detective'],
    skills: [],
    hooks: ['change-tracker'],
    category: 'debugging',
    examples: ['beacon debug', '/debug "TypeError in auth middleware"', 'beacon debug -i'],
  },
];

// ── Data loaders ──────────────────────────────────────────────────────────────
async function loadComponents() {
  if (fresh('agents') && fresh('skills') && fresh('hooks') && fresh('commands')) return;
  try {
    const tree = await fetchJSON(TREE_URL);
    const paths = (tree.tree || []).map(f => f.path);

    const agentPaths   = paths.filter(p => /^plugins\/all-agents\/agents\/[^/]+\.md$/.test(p));
    const skillPaths   = paths.filter(p => /^plugins\/all-skills\/skills\/[^/]+\/SKILL\.md$/.test(p));
    const hookPaths    = paths.filter(p => /^plugins\/all-hooks\/hooks\/[^/]+\.md$/.test(p));
    const commandPaths = paths.filter(p => /^plugins\/all-commands\/commands\/[^/]+\.md$/.test(p));

    const fetchAll = arr => Promise.all(
      arr.map(p => fetchText(RAW + '/' + p).then(txt => ({ p, txt })).catch(() => null))
    );

    const [agentFiles, skillFiles, hookFiles, commandFiles] = await Promise.all([
      fetchAll(agentPaths), fetchAll(skillPaths), fetchAll(hookPaths), fetchAll(commandPaths),
    ]);

    const agents = agentFiles.filter(Boolean).map(({ p, txt }) => {
      const fm   = parseFM(txt);
      const seg  = p.split('/');
      const name = fm.name || seg[seg.length - 1].replace(/\.md$/i, '');
      return {
        name, description: fm.description || '', category: fm.category || 'general',
        examples: Array.isArray(fm.examples) ? fm.examples : [],
        body: extractBody(txt),
        tokenCost: tokenCost(txt, 'agent'),
        rawContent: txt, path: p, type: 'agent',
      };
    }).filter(x => x.name);

    const skills = skillFiles.filter(Boolean).map(({ p, txt }) => {
      const fm   = parseFM(txt);
      const seg  = p.split('/');
      const name = fm.name || seg[seg.length - 2]; // parent dir name
      return {
        name, description: fm.description || '', category: fm.category || 'general',
        examples: Array.isArray(fm.examples) ? fm.examples : [],
        body: extractBody(txt),
        tokenCost: tokenCost(txt, 'skill'),
        rawContent: txt, path: p, type: 'skill',
      };
    }).filter(x => x.name);

    const hooks = hookFiles.filter(Boolean).map(({ p, txt }) => {
      const fm   = parseFM(txt);
      const name = fm.name || p.split('/').pop().replace(/\.md$/i, '');
      return {
        name, description: fm.description || '', category: fm.category || 'general',
        event: fm.event || 'PostToolUse', matcher: fm.matcher || '*',
        language: fm.language || 'bash',
        examples: Array.isArray(fm.examples) ? fm.examples : [],
        body: extractBody(txt),
        script: extractScript(txt),
        tokenCost: 0,
        rawContent: txt, path: p, type: 'hook',
      };
    }).filter(x => x.name);

    const commands = commandFiles.filter(Boolean).map(({ p, txt }) => {
      const fm   = parseFM(txt);
      const name = p.split('/').pop().replace(/\.md$/i, '');
      return {
        name, description: fm.description || '', category: fm.category || 'general',
        argumentHint: fm['argument-hint'] || '',
        allowedTools: fm['allowed-tools'] || '',
        examples: Array.isArray(fm.examples) ? fm.examples : [],
        body: extractBody(txt),
        tokenCost: 0,
        rawContent: txt, path: p, type: 'command',
      };
    }).filter(x => x.name);

    set('agents', agents);
    set('skills', skills);
    set('hooks', hooks);
    set('commands', commands);
    console.log(`[cache] loaded: ${agents.length} agents, ${skills.length} skills, ${hooks.length} hooks, ${commands.length} commands`);
  } catch (e) {
    console.error('[cache] component load failed:', e.message);
    for (const k of ['agents','skills','hooks','commands']) if (!fresh(k)) set(k, []);
  }
}

async function loadDockerMCPs() {
  if (fresh('mcps')) return;
  try {
    const data = await fetchJSON(RAW + '/mcp-servers.json');
    const servers = Object.entries(data.mcpServers || {}).map(([id, cfg]) => {
      const meta = cfg._metadata || {};
      const cat  = meta.category || 'utilities';
      return {
        id, name: meta.displayName || id, description: meta.description || '',
        category: cat, vendor: meta.vendor || '', dockerHub: meta.dockerHub || '',
        repository: meta.repository || '', command: cfg.command, args: cfg.args || [],
        env: cfg.env || {}, tokenCost: MCP_TOKEN_BY_CAT[cat] || 3000,
        type: 'mcp',
      };
    });
    set('mcps', servers);
    console.log(`[cache] loaded: ${servers.length} Docker MCPs`);
  } catch (e) {
    console.error('[cache] Docker MCP load failed:', e.message);
    set('mcps', []);
  }
}

// ── Installed state ───────────────────────────────────────────────────────────
function getInstalledTasks() {
  if (!fs.existsSync(TASKS_DIR)) return [];
  return fs.readdirSync(TASKS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const d = JSON.parse(fs.readFileSync(path.join(TASKS_DIR, f), 'utf8'));
        return { name: f.replace('.json',''), description: d.description || '', ...d };
      } catch { return null; }
    }).filter(Boolean);
}

function getInstalledComponents() {
  const result = { agents: [], skills: [], hooks: [], commands: [] };
  const agentsDir  = path.join(COMP_DIR, 'agents');
  const skillsDir  = path.join(COMP_DIR, 'skills');
  const hooksDir   = path.join(COMP_DIR, 'hooks');
  if (fs.existsSync(agentsDir))
    result.agents = fs.readdirSync(agentsDir).filter(f=>f.endsWith('.md')).map(f=>f.replace('.md',''));
  if (fs.existsSync(skillsDir))
    result.skills = fs.readdirSync(skillsDir).filter(d=>fs.existsSync(path.join(skillsDir,d,'SKILL.md')));
  if (fs.existsSync(hooksDir))
    result.hooks = fs.readdirSync(hooksDir).filter(f=>f.endsWith('.md')).map(f=>f.replace('.md',''));
  if (fs.existsSync(COMMANDS_DIR))
    result.commands = fs.readdirSync(COMMANDS_DIR).filter(f=>f.endsWith('.md')).map(f=>f.replace('.md',''));
  return result;
}

function getInstalledMCPs() {
  const mcpDir = path.join(TASKS_DIR, 'mcps');
  if (!fs.existsSync(mcpDir)) return [];
  return fs.readdirSync(mcpDir).filter(f=>f.endsWith('.json')).map(f=>f.replace('.json',''));
}

// ── Token stats ───────────────────────────────────────────────────────────────
function getTokenStats() {
  const installed = getInstalledComponents();
  const allItems = [...get('agents'), ...get('skills'), ...get('hooks'), ...get('commands')];
  const installedMCPs = getInstalledMCPs();
  const allMCPs = get('mcps');

  let componentTokens = 0;
  for (const type of ['agents','skills','hooks','commands']) {
    for (const name of installed[type]) {
      const item = allItems.find(x => x.name === name && x.type === (type==='agents'?'agent':type==='skills'?'skill':type==='hooks'?'hook':'command'));
      if (item) componentTokens += item.tokenCost || 0;
    }
  }
  let mcpTokens = 0;
  for (const id of installedMCPs) {
    const mcp = allMCPs.find(m => m.id === id);
    if (mcp) mcpTokens += mcp.tokenCost || 0;
  }

  return {
    componentTokens,
    mcpTokens,
    totalSaved: componentTokens + mcpTokens,
    installedCount: Object.values(installed).flat().length + installedMCPs.length,
  };
}

// ── Install / uninstall ───────────────────────────────────────────────────────
function installTask(bundle) {
  fs.mkdirSync(TASKS_DIR, { recursive: true });
  fs.writeFileSync(path.join(TASKS_DIR, `${bundle.name}.json`), JSON.stringify(bundle, null, 2));

  // Write component files from cache (no additional GitHub fetches needed)
  const allAgents  = get('agents');
  const allSkills  = get('skills');
  const allHooks   = get('hooks');

  for (const agentName of (bundle.agents || [])) {
    const item = allAgents.find(a => a.name === agentName);
    if (item && item.rawContent) {
      const dest = path.join(COMP_DIR, 'agents', `${agentName}.md`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, item.rawContent);
    }
  }
  for (const skillName of (bundle.skills || [])) {
    const item = allSkills.find(s => s.name === skillName);
    if (item && item.rawContent) {
      const dest = path.join(COMP_DIR, 'skills', skillName, 'SKILL.md');
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, item.rawContent);
    }
  }
  for (const hookName of (bundle.hooks || [])) {
    const item = allHooks.find(h => h.name === hookName);
    if (item && item.rawContent) {
      const dest = path.join(COMP_DIR, 'hooks', `${hookName}.md`);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, item.rawContent);
    }
  }
}

function uninstallTask(name) {
  try { fs.unlinkSync(path.join(TASKS_DIR, `${name}.json`)); } catch {}
}

function installComponent(type, name) {
  const items = { agent: get('agents'), skill: get('skills'), hook: get('hooks'), command: get('commands') };
  const item = (items[type] || []).find(x => x.name === name);
  if (!item || !item.rawContent) throw new Error(`Component not found or content missing: ${type}/${name}`);

  if (type === 'agent') {
    const dest = path.join(COMP_DIR, 'agents', `${name}.md`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, item.rawContent);
  } else if (type === 'skill') {
    const dest = path.join(COMP_DIR, 'skills', name, 'SKILL.md');
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, item.rawContent);
  } else if (type === 'hook') {
    const dest = path.join(COMP_DIR, 'hooks', `${name}.md`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, item.rawContent);
  } else if (type === 'command') {
    const dest = path.join(COMMANDS_DIR, `${name}.md`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, item.rawContent);
  }
}

function installMCP(id) {
  const mcp = get('mcps').find(m => m.id === id);
  if (!mcp) throw new Error(`MCP not found: ${id}`);
  const dest = path.join(TASKS_DIR, 'mcps', `${id}.json`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, JSON.stringify({ name: id, command: mcp.command, args: mcp.args, env: mcp.env }, null, 2));
  // Also write the slash command for beacon invocation
  fs.mkdirSync(COMMANDS_DIR, { recursive: true });
  fs.writeFileSync(path.join(COMMANDS_DIR, `${id}.md`),
    `---\ndescription: "${mcp.name} — ${mcp.description.slice(0,80)}"\nallowed-tools: Bash\n---\n\n!beacon ${id} $ARGUMENTS\n`);
}

function uninstallComponent(type, name) {
  if (type === 'agent')   { try { fs.unlinkSync(path.join(COMP_DIR,'agents',`${name}.md`)); } catch {} }
  if (type === 'skill')   { try { fs.rmSync(path.join(COMP_DIR,'skills',name), {recursive:true,force:true}); } catch {} }
  if (type === 'hook')    { try { fs.unlinkSync(path.join(COMP_DIR,'hooks',`${name}.md`)); } catch {} }
  if (type === 'command') { try { fs.unlinkSync(path.join(COMMANDS_DIR,`${name}.md`)); } catch {} }
  if (type === 'mcp')     { try { fs.unlinkSync(path.join(TASKS_DIR,'mcps',`${name}.json`)); } catch {}
                             try { fs.unlinkSync(path.join(COMMANDS_DIR,`${name}.md`)); } catch {} }
}

// ── Kick off background loading ───────────────────────────────────────────────
loadComponents();
loadDockerMCPs();
setInterval(() => { loadComponents(); loadDockerMCPs(); }, TTL);

// ── UI module ─────────────────────────────────────────────────────────────────
const { HTML } = require('./marketplace-ui');

// ── HTTP server ───────────────────────────────────────────────────────────────
const readBody = req => new Promise(r => { let b=''; req.on('data',c=>b+=c); req.on('end',()=>r(b)); });

http.createServer(async (req, res) => {
  const url    = req.url || '/';
  const method = req.method || 'GET';
  const send   = (d, s=200) => { res.writeHead(s,{'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}); res.end(JSON.stringify(d)); };
  const fail   = (s, m)     => send({ error: m }, s);

  // ── Serve UI ──────────────────────────────────────────────────────────────
  if (method === 'GET' && url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML());
    return;
  }

  // ── Discovery API ─────────────────────────────────────────────────────────
  if (method === 'GET' && url === '/api/tasks') {
    // Merge built-in tasks with installed state
    const installedTasks = getInstalledTasks().map(t => t.name);
    const tasks = BUILT_IN_TASKS.map(t => ({
      ...t,
      tokenCost: (get('agents').filter(a => (t.agents||[]).includes(a.name)).reduce((s,a)=>s+a.tokenCost,0) +
                  (t.mcps||[]).reduce((s,m)=>s+(MCP_TOKEN_BY_CAT[m.category]||3000),0)),
      installed: installedTasks.includes(t.name),
    }));
    send(tasks);
    return;
  }

  if (method === 'GET' && url.startsWith('/api/components')) {
    const qs   = new URL('http://x' + url).searchParams;
    const type = qs.get('type') || 'agents';
    const q    = (qs.get('search') || '').toLowerCase();
    const cat  = qs.get('category') || '';
    let items  = get(type);
    if (q)   items = items.filter(x => x.name.includes(q) || (x.description||'').toLowerCase().includes(q));
    if (cat) items = items.filter(x => x.category === cat);
    // Strip rawContent from response (not needed by browser)
    send(items.map(({ rawContent, ...rest }) => rest));
    return;
  }

  if (method === 'GET' && url === '/api/registry') {
    // Official MCP registry proxy
    try {
      const qs = new URL('http://x' + url).searchParams;
      const p  = new URLSearchParams({ limit: qs.get('limit') || '24' });
      if (qs.get('search')) p.set('search', qs.get('search'));
      if (qs.get('cursor')) p.set('cursor', qs.get('cursor'));
      const data = await fetchJSON(MCP_REG + '/v0/servers?' + p);
      send(data);
    } catch (e) { fail(502, e.message); }
    return;
  }

  // ── Installed state ───────────────────────────────────────────────────────
  if (method === 'GET' && url === '/api/installed') {
    send({
      tasks: getInstalledTasks(),
      components: getInstalledComponents(),
      mcps: getInstalledMCPs(),
    });
    return;
  }

  if (method === 'GET' && url === '/api/token-stats') {
    send(getTokenStats());
    return;
  }

  // ── Install endpoints ─────────────────────────────────────────────────────
  if (method === 'POST' && url === '/api/install-task') {
    try {
      const bundle = JSON.parse(await readBody(req));
      if (!bundle.name) return fail(400, 'name required');
      // Use built-in task if no bundle provided, otherwise use sent bundle
      const task = BUILT_IN_TASKS.find(t => t.name === bundle.name) || bundle;
      installTask(task);
      send({ ok: true });
    } catch (e) { fail(500, e.message); }
    return;
  }

  if (method === 'POST' && url === '/api/install-component') {
    try {
      const { type, name } = JSON.parse(await readBody(req));
      if (!type || !name) return fail(400, 'type and name required');
      installComponent(type, name);
      send({ ok: true });
    } catch (e) { fail(500, e.message); }
    return;
  }

  if (method === 'POST' && url === '/api/install-mcp') {
    try {
      const { id } = JSON.parse(await readBody(req));
      if (!id) return fail(400, 'id required');
      installMCP(id);
      send({ ok: true });
    } catch (e) { fail(500, e.message); }
    return;
  }

  // ── Uninstall endpoints ───────────────────────────────────────────────────
  if (method === 'DELETE' && url.startsWith('/api/task/')) {
    const name = decodeURIComponent(url.replace('/api/task/', ''));
    uninstallTask(name);
    send({ ok: true });
    return;
  }

  if (method === 'DELETE' && url.startsWith('/api/component/')) {
    const parts = url.replace('/api/component/', '').split('/');
    uninstallComponent(parts[0], parts[1]);
    send({ ok: true });
    return;
  }

  res.writeHead(404); res.end('Not found');

}).listen(PORT, '127.0.0.1', () => {
  const u = `http://localhost:${PORT}`;
  console.log(`\n  Beacon Marketplace`);
  console.log(`  ${'─'.repeat(36)}`);
  console.log(`  ${u}\n`);
  console.log('  Tasks · Agents · Skills · Commands · Hooks · MCPs');
  console.log('  Fetching components from Beacon registry...\n');
  require('child_process').exec(`open ${u}`);
});
