#!/usr/bin/env node
// beacon-marketplace — localhost browser for Beacon (Plugins/Skills/Subagents/Commands/Hooks/MCP)
// Runs at http://localhost:4747  |  No npm install needed (Node.js built-ins only)

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const PORT          = 4747;
const HOME          = os.homedir();
const CLAUDE_DIR    = path.join(HOME, '.claude');
const CONFIGS_DIR   = path.join(CLAUDE_DIR, 'mcp-configs');
const COMMANDS_DIR  = path.join(CLAUDE_DIR, 'commands');
const SKILLS_DIR    = path.join(CLAUDE_DIR, 'skills');
const AGENTS_DIR    = path.join(CLAUDE_DIR, 'agents');
const HOOKS_DIR     = path.join(CLAUDE_DIR, 'hooks');
const SETTINGS_PATH = path.join(CLAUDE_DIR, 'settings.json');

const BWC_RAW  = 'https://raw.githubusercontent.com/dr-code/beacon/main';
const BWC_TREE = 'https://api.github.com/repos/dr-code/beacon/git/trees/main?recursive=1';
const MCP_REGISTRY = 'https://registry.modelcontextprotocol.io';

// ── In-memory cache ───────────────────────────────────────────────────────────
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const cache = {
  bwcPlugins:  { data: null, at: 0 },
  bwcSkills:   { data: null, at: 0 },
  bwcAgents:   { data: null, at: 0 },
  bwcCommands: { data: null, at: 0 },
  bwcHooks:    { data: null, at: 0 },
  dockerMCPs:  { data: null, at: 0 },
};
function cached(key)        { const c=cache[key]; return c.data && (Date.now()-c.at)<CACHE_TTL ? c.data : null; }
function setCache(key, data){ cache[key] = { data, at: Date.now() }; return data; }

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpsGet(url, opts={}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers:{'User-Agent':'beacon/1.0','Accept':'application/json',...(opts.headers||{})}, timeout:12000 }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) return httpsGet(res.headers.location, opts).then(resolve).catch(reject);
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d}));
    });
    req.on('error', reject);
    req.on('timeout', ()=>{ req.destroy(); reject(new Error('timeout')); });
  });
}
async function fetchJSON(url) {
  const r = await httpsGet(url);
  return JSON.parse(r.body);
}
async function fetchText(url) {
  const r = await httpsGet(url, {headers:{'Accept':'text/plain'}});
  return r.body;
}

// ── Frontmatter parser (no deps) ──────────────────────────────────────────────
function parseFM(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const obj = {};
  for (const line of m[1].split('\n')) {
    const ci = line.indexOf(':');
    if (ci <= 0) continue;
    const k = line.slice(0,ci).trim();
    const v = line.slice(ci+1).trim().replace(/^["']|["']$/g,'');
    if (k && v && v !== 'null') obj[k] = v;
  }
  return obj;
}
function extractBashScript(content) {
  const m = content.match(/```(?:bash|sh)\r?\n([\s\S]*?)```/);
  return m ? m[1].trim() : null;
}

// ── BWC data loaders ──────────────────────────────────────────────────────────
async function loadBWCData() {
  if (cached('bwcPlugins') && cached('bwcSkills') && cached('bwcAgents') && cached('bwcCommands') && cached('bwcHooks')) return;
  try {
    const [tree, mkt] = await Promise.all([
      fetchJSON(BWC_TREE),
      fetchJSON(BWC_RAW + '/.claude-plugin/marketplace.json'),
    ]);

    const paths = (tree.tree||[]).map(f=>f.path);

    const skillPaths   = paths.filter(p=>/^plugins\/all-skills\/skills\/[^/]+\/SKILL\.md$/.test(p));
    const agentPaths   = paths.filter(p=>/^plugins\/all-agents\/agents\/[^/]+\.md$/.test(p));
    const commandPaths = paths.filter(p=>/^plugins\/all-commands\/commands\/[^/]+\.md$/.test(p));
    const hookPaths    = paths.filter(p=>/^plugins\/all-hooks\/hooks\/[^/]+\.md$/.test(p));

    const fetchAll = (arr) => Promise.all(arr.map(p => fetchText(BWC_RAW+'/'+p).then(txt=>({p,txt})).catch(()=>null)));
    const [skillFiles, agentFiles, commandFiles, hookFiles] = await Promise.all([
      fetchAll(skillPaths), fetchAll(agentPaths), fetchAll(commandPaths), fetchAll(hookPaths),
    ]);

    function toItems(files) {
      return files.filter(Boolean).map(({p,txt})=>{
        const fm = parseFM(txt);
        const seg = p.split('/');
        const fname = seg[seg.length-1].replace(/\.md$/i,'');
        const name = fm.name || (fname==='SKILL' ? seg[seg.length-2] : fname);
        return { name, description: fm.description||'', category: fm.category||null, path: p };
      }).filter(x=>x.name);
    }

    setCache('bwcSkills',   toItems(skillFiles));
    setCache('bwcAgents',   toItems(agentFiles));
    setCache('bwcCommands', toItems(commandFiles).map(x=>({...x, name:x.path.split('/').pop().replace(/\.md$/,'')})));

    const hooks = hookFiles.filter(Boolean).map(({p,txt})=>{
      const fm = parseFM(txt);
      const name = fm.name || p.split('/').pop().replace(/\.md$/,'');
      return { name, description: fm.description||'', category: fm.category||null,
               event: fm.event||'PostToolUse', matcher: fm.matcher||'*', path: p };
    }).filter(x=>x.name);
    setCache('bwcHooks', hooks);
    setCache('bwcPlugins', mkt.plugins||[]);
  } catch(e) {
    console.error('BWC data load failed:', e.message);
    for (const k of ['bwcPlugins','bwcSkills','bwcAgents','bwcCommands','bwcHooks'])
      if (!cached(k)) setCache(k, []);
  }
}

async function loadDockerMCPs() {
  if (cached('dockerMCPs')) return;
  try {
    const data = await fetchJSON(BWC_RAW + '/mcp-servers.json');
    const servers = Object.entries(data.mcpServers||{}).map(([id, cfg])=>({
      id, ...cfg._metadata, command: cfg.command, args: cfg.args,
    }));
    setCache('dockerMCPs', servers);
  } catch(e) { setCache('dockerMCPs', []); }
}

// ── Settings.json helpers ─────────────────────────────────────────────────────
function readSettings() {
  try { return JSON.parse(fs.readFileSync(SETTINGS_PATH,'utf8')); }
  catch { return {}; }
}
function writeSettings(s) {
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(s,null,2));
}

// ── Installed state getters ───────────────────────────────────────────────────
function getInstalledMCPs() {
  if (!fs.existsSync(CONFIGS_DIR)) return [];
  return fs.readdirSync(CONFIGS_DIR).filter(f=>f.endsWith('.json')).map(f=>f.replace('.json',''));
}
function getInstalledFromDir(dir, ext='.md') {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f=>f.endsWith(ext)).map(f=>f.replace(ext,''));
}
function getInstalledSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs.readdirSync(SKILLS_DIR).filter(d=>{
    try { return fs.existsSync(path.join(SKILLS_DIR,d,'SKILL.md')); } catch { return false; }
  });
}
function getInstalledHooks() {
  if (!fs.existsSync(HOOKS_DIR)) return [];
  return fs.readdirSync(HOOKS_DIR).filter(f=>f.endsWith('.sh')).map(f=>f.replace('.sh',''));
}
function getInstalledPlugins() {
  const s = readSettings();
  return Object.entries(s.enabledPlugins||{})
    .filter(([k,v])=>k.endsWith('@beacon')&&v===true)
    .map(([k])=>k.replace('@beacon',''));
}

// ── Installers ────────────────────────────────────────────────────────────────
async function installBWCFile(githubPath, targetPath) {
  const content = await fetchText(BWC_RAW+'/'+githubPath);
  fs.mkdirSync(path.dirname(targetPath), {recursive:true});
  fs.writeFileSync(targetPath, content);
}

async function installHook(name, githubPath, event, matcher) {
  const content = await fetchText(BWC_RAW+'/'+githubPath);
  const script  = extractBashScript(content);
  if (!script) throw new Error('No bash script found in hook file');
  const scriptPath = path.join(HOOKS_DIR, `${name}.sh`);
  fs.mkdirSync(HOOKS_DIR, {recursive:true});
  fs.writeFileSync(scriptPath, `#!/bin/bash\n${script}`);
  try { fs.chmodSync(scriptPath, '755'); } catch {}
  const s = readSettings();
  if (!s.hooks) s.hooks = {};
  if (!s.hooks[event]) s.hooks[event] = [];
  const group = s.hooks[event].find(g=>g.matcher===matcher);
  const entry = { type:'command', command:`bash ~/.claude/hooks/${name}.sh` };
  if (group) { if (!group.hooks.some(h=>h.command===entry.command)) group.hooks.push(entry); }
  else s.hooks[event].push({ matcher, hooks:[entry] });
  writeSettings(s);
}

function installPlugin(name) {
  const s = readSettings();
  if (!s.extraKnownMarketplaces) s.extraKnownMarketplaces = {};
  s.extraKnownMarketplaces.beacon = { source:{ source:'github', repo:'dr-code/beacon' }};
  if (!s.enabledPlugins) s.enabledPlugins = {};
  s.enabledPlugins[`${name}@beacon`] = true;
  writeSettings(s);
}

function removePlugin(name) {
  const s = readSettings();
  if (s.enabledPlugins) delete s.enabledPlugins[`${name}@beacon`];
  writeSettings(s);
}

function removeHook(name) {
  const p = path.join(HOOKS_DIR, `${name}.sh`);
  try { fs.unlinkSync(p); } catch {}
  const s = readSettings();
  if (s.hooks) {
    for (const ev of Object.keys(s.hooks)) {
      s.hooks[ev] = s.hooks[ev].map(g=>({...g, hooks:g.hooks.filter(h=>!h.command.includes(`/${name}.sh`))}))
        .filter(g=>g.hooks.length>0);
    }
  }
  writeSettings(s);
}

function removeMCP(id) {
  [path.join(CONFIGS_DIR,`${id}.json`), path.join(COMMANDS_DIR,`${id}.md`)]
    .forEach(f=>{ try { fs.unlinkSync(f); } catch {} });
}

function installMCP({id, mcpConfig, commandDesc}) {
  fs.mkdirSync(CONFIGS_DIR, {recursive:true});
  fs.mkdirSync(COMMANDS_DIR,{recursive:true});
  fs.writeFileSync(path.join(CONFIGS_DIR, `${id}.json`), JSON.stringify(mcpConfig,null,2));
  fs.writeFileSync(path.join(COMMANDS_DIR,`${id}.md`), `---\ndescription: "${commandDesc}"\nallowed-tools: Bash\n---\n\n!beacon ${id} $ARGUMENTS\n`);
}

// ── Registry proxy ────────────────────────────────────────────────────────────
async function proxyRegistry(url) {
  const r = await httpsGet(url);
  return JSON.parse(r.body);
}

// ── Kick off background data loading ─────────────────────────────────────────
loadBWCData();
loadDockerMCPs();

// ── UI module ─────────────────────────────────────────────────────────────────
const { HTML } = require('./marketplace-ui');

// ── HTTP Server ───────────────────────────────────────────────────────────────
http.createServer(async (req,res)=>{
  const url=req.url||'/', method=req.method||'GET';
  const json = d => { res.writeHead(200,{'Content-Type':'application/json'}); res.end(JSON.stringify(d)); };
  const err  = (s,m) => { res.writeHead(s,{'Content-Type':'application/json'}); res.end(JSON.stringify({error:m})); };

  if (method==='GET' && url==='/') {
    res.writeHead(200,{'Content-Type':'text/html'});
    res.end(HTML(cached('bwcPlugins')||[], cached('bwcSkills')||[], cached('bwcAgents')||[], cached('bwcHooks')||[]));
    return;
  }

  if (method==='GET' && url==='/api/installed')          { json(getInstalledMCPs()); return; }
  if (method==='GET' && url==='/api/installed-skills')   { json(getInstalledSkills()); return; }
  if (method==='GET' && url==='/api/installed-agents')   { json(getInstalledFromDir(AGENTS_DIR)); return; }
  if (method==='GET' && url==='/api/installed-commands') { json(getInstalledFromDir(COMMANDS_DIR)); return; }
  if (method==='GET' && url==='/api/installed-hooks')    { json(getInstalledHooks()); return; }
  if (method==='GET' && url==='/api/installed-plugins')  { json(getInstalledPlugins()); return; }
  if (method==='GET' && url==='/api/commands')           { json(cached('bwcCommands')||[]); return; }
  if (method==='GET' && url==='/api/docker-mcps')        { json(cached('dockerMCPs')||[]); return; }

  if (method==='GET' && url.startsWith('/api/registry')) {
    try {
      const qs = new URL('http://x'+url).searchParams;
      const p  = new URLSearchParams({limit: qs.get('limit')||'24'});
      if (qs.get('search')) p.set('search', qs.get('search'));
      if (qs.get('cursor')) p.set('cursor', qs.get('cursor'));
      json(await proxyRegistry(MCP_REGISTRY+'/v0/servers?'+p));
    } catch(e) { err(502, e.message); }
    return;
  }

  const body = () => new Promise(r=>{ let b=''; req.on('data',c=>b+=c); req.on('end',()=>r(b)); });

  if (method==='POST' && url==='/api/install') {
    try { installMCP(JSON.parse(await body())); json({ok:true}); } catch(e) { err(500,e.message); }
    return;
  }
  if (method==='POST' && url==='/api/install-skill') {
    try { const {name,path:gp}=JSON.parse(await body()); await installBWCFile(gp, path.join(SKILLS_DIR,name,'SKILL.md')); json({ok:true}); }
    catch(e) { err(500,e.message); } return;
  }
  if (method==='POST' && url==='/api/install-agent') {
    try { const {name,path:gp}=JSON.parse(await body()); await installBWCFile(gp, path.join(AGENTS_DIR,`${name}.md`)); json({ok:true}); }
    catch(e) { err(500,e.message); } return;
  }
  if (method==='POST' && url==='/api/install-command') {
    try { const {name,path:gp}=JSON.parse(await body()); await installBWCFile(gp, path.join(COMMANDS_DIR,`${name}.md`)); json({ok:true}); }
    catch(e) { err(500,e.message); } return;
  }
  if (method==='POST' && url==='/api/install-hook') {
    try { const {name,path:gp,event,matcher}=JSON.parse(await body()); await installHook(name,gp,event||'PostToolUse',matcher||'*'); json({ok:true}); }
    catch(e) { err(500,e.message); } return;
  }
  if (method==='POST' && url==='/api/install-plugin') {
    try { const {name}=JSON.parse(await body()); installPlugin(name); json({ok:true}); }
    catch(e) { err(500,e.message); } return;
  }

  if (method==='DELETE' && url.startsWith('/api/remove/') && !url.split('/api/remove/')[1].includes('-')) {
    removeMCP(url.replace('/api/remove/','').replace(/[^a-z0-9-_]/gi,'')); json({ok:true}); return;
  }
  if (method==='DELETE' && url.startsWith('/api/remove-skill/'))   { try { fs.rmSync(path.join(SKILLS_DIR,  url.replace('/api/remove-skill/','').replace(/[^a-z0-9-_]/gi,'')), {recursive:true,force:true}); } catch {} json({ok:true}); return; }
  if (method==='DELETE' && url.startsWith('/api/remove-agent/'))   { try { fs.unlinkSync(path.join(AGENTS_DIR,   url.replace('/api/remove-agent/','').replace(/[^a-z0-9-_]/gi,'')+'.md')); } catch {} json({ok:true}); return; }
  if (method==='DELETE' && url.startsWith('/api/remove-command/')) { try { fs.unlinkSync(path.join(COMMANDS_DIR, url.replace('/api/remove-command/','').replace(/[^a-z0-9-_]/gi,'')+'.md')); } catch {} json({ok:true}); return; }
  if (method==='DELETE' && url.startsWith('/api/remove-hook/'))    { removeHook(url.replace('/api/remove-hook/','').replace(/[^a-z0-9-_]/gi,'')); json({ok:true}); return; }
  if (method==='DELETE' && url.startsWith('/api/remove-plugin/'))  { removePlugin(url.replace('/api/remove-plugin/','').replace(/[^a-z0-9-_]/gi,'')); json({ok:true}); return; }

  res.writeHead(404); res.end('Not found');

}).listen(PORT,'127.0.0.1',()=>{
  const u = `http://localhost:${PORT}`;
  console.log(`\n  ▸ Beacon\n  ${'─'.repeat(40)}`);
  console.log(`  ${u}\n`);
  console.log('  Tabs: Plugins · Skills · Subagents · Commands · Hooks · MCP Servers');
  console.log('  Fetching data from Beacon registry + modelcontextprotocol.io...\n');
  require('child_process').exec(`open ${u}`);
});
