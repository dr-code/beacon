'use strict';
// Beacon Marketplace UI — exports HTML() → string
// SPA: tab switching, slide-in detail panel, token savings banner

function HTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Beacon Marketplace</title>
<style>
:root{--bg:#0f1117;--sf:#1a1d27;--sf2:#22263a;--bd:#2e334d;--ac:#6c8fff;--ac2:#a78bfa;--gn:#4ade80;--ye:#fbbf24;--rd:#f87171;--tx:#e2e8f0;--mu:#8892aa;--cd:#0d1117;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--tx);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;display:flex;flex-direction:column;height:100vh;overflow:hidden;}

/* Topbar */
.topbar{background:var(--sf);border-bottom:1px solid var(--bd);padding:0 16px;height:52px;display:flex;align-items:center;gap:8px;flex-shrink:0;z-index:10;}
.logo{font-size:15px;font-weight:800;letter-spacing:-.5px;background:linear-gradient(135deg,#e2e8f0,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-right:4px;white-space:nowrap;}
.tabs{display:flex;gap:2px;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:3px;}
.tab{padding:5px 12px;border-radius:5px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:none;color:var(--mu);transition:all .15s;white-space:nowrap;}
.tab:hover{color:var(--tx);}
.tab.active{background:var(--ac);color:#fff;}
.spacer{flex:1;}
.search-wrap{position:relative;flex-shrink:0;}
.search-wrap svg{position:absolute;left:9px;top:50%;transform:translateY(-50%);opacity:.4;pointer-events:none;}
input.search{width:210px;background:var(--sf2);border:1px solid var(--bd);border-radius:7px;padding:7px 12px 7px 30px;color:var(--tx);font-size:12px;outline:none;}
input.search:focus{border-color:var(--ac);}
input.search::placeholder{color:var(--mu);}

/* Token savings banner */
.savings-banner{background:rgba(74,222,128,.06);border-bottom:1px solid rgba(74,222,128,.15);padding:8px 20px;display:none;align-items:center;gap:10px;flex-shrink:0;}
.savings-banner.visible{display:flex;}
.sb-text{font-size:12px;color:var(--mu);}
.sb-text strong{color:var(--gn);}
.sb-badge{font-size:11px;font-weight:700;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.25);color:var(--gn);padding:3px 10px;border-radius:10px;white-space:nowrap;}

/* Layout */
.layout{display:flex;flex:1;overflow:hidden;}
.sidebar{width:180px;background:var(--sf);border-right:1px solid var(--bd);padding:12px 8px;overflow-y:auto;flex-shrink:0;}
.slabel{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--mu);padding:0 8px;margin:12px 0 6px;display:block;}
.slabel:first-child{margin-top:0;}
.catbtn{display:flex;align-items:center;gap:7px;width:100%;padding:6px 8px;border-radius:6px;background:none;border:none;color:var(--mu);font-size:12px;cursor:pointer;text-align:left;transition:all .12s;}
.catbtn:hover{background:var(--sf2);color:var(--tx);}
.catbtn.act{background:rgba(108,143,255,.12);color:var(--ac);font-weight:600;}
.catbtn .ci{font-size:13px;width:16px;text-align:center;flex-shrink:0;}
.catbtn .cn{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cc{font-size:10px;color:var(--mu);background:var(--sf2);padding:1px 5px;border-radius:8px;flex-shrink:0;}

/* Main */
.main{flex:1;overflow-y:auto;padding:20px;position:relative;}
.main-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.main-hdr h2{font-size:14px;font-weight:700;color:var(--tx);}
.item-count{font-size:12px;color:var(--mu);}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:13px;}

/* Cards */
.card{background:var(--sf);border:1px solid var(--bd);border-radius:11px;padding:15px;display:flex;flex-direction:column;gap:9px;cursor:pointer;transition:border-color .15s,box-shadow .15s;}
.card:hover{border-color:rgba(108,143,255,.4);box-shadow:0 2px 12px rgba(0,0,0,.3);}
.card.installed{border-color:rgba(74,222,128,.2);}
.card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:8px;}
.card-name{font-size:13px;font-weight:700;color:var(--tx);line-height:1.3;}
.card-cat{font-size:10px;font-weight:700;text-transform:uppercase;background:var(--sf2);border:1px solid var(--bd);color:var(--mu);padding:2px 7px;border-radius:8px;white-space:nowrap;flex-shrink:0;}
.card-desc{font-size:12px;color:var(--mu);line-height:1.5;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.card-foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:2px;}
.token-badge{font-size:11px;font-weight:600;padding:2px 8px;border-radius:8px;white-space:nowrap;}
.token-badge.zero{color:var(--gn);background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.2);}
.token-badge.sm{color:var(--ye);background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.2);}
.token-badge.lg{color:var(--rd);background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.2);}
.installed-badge{font-size:10px;font-weight:700;color:var(--gn);background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.25);padding:2px 7px;border-radius:8px;}
.btn{padding:5px 12px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all .15s;white-space:nowrap;}
.btn-primary{background:var(--ac);color:#fff;}
.btn-primary:hover{background:#5a7ef0;}
.btn-installed{background:transparent;border:1px solid rgba(74,222,128,.3);color:var(--gn);}
.btn-installed:hover{background:rgba(248,113,113,.1);border-color:var(--rd);color:var(--rd);}

/* Empty state */
.empty{text-align:center;padding:60px 20px;color:var(--mu);}
.empty h3{font-size:16px;margin-bottom:8px;color:var(--tx);}
.loading{display:flex;align-items:center;justify-content:center;gap:10px;padding:60px 20px;color:var(--mu);font-size:13px;}
.spinner{width:18px;height:18px;border:2px solid var(--bd);border-top-color:var(--ac);border-radius:50%;animation:spin .7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}

/* Detail panel overlay */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:100;opacity:0;pointer-events:none;transition:opacity .2s;}
.overlay.open{opacity:1;pointer-events:all;}
.panel{position:fixed;top:0;right:0;bottom:0;width:480px;max-width:100vw;background:var(--sf);border-left:1px solid var(--bd);overflow-y:auto;transform:translateX(100%);transition:transform .22s cubic-bezier(.4,0,.2,1);z-index:101;display:flex;flex-direction:column;}
.panel.open{transform:translateX(0);}
.panel-hdr{padding:18px 20px 16px;border-bottom:1px solid var(--bd);display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-shrink:0;position:sticky;top:0;background:var(--sf);z-index:1;}
.panel-title{flex:1;}
.panel-name{font-size:16px;font-weight:700;color:var(--tx);display:block;margin-bottom:5px;}
.panel-badges{display:flex;gap:6px;flex-wrap:wrap;}
.pbadge{font-size:10px;font-weight:700;text-transform:uppercase;padding:2px 8px;border-radius:8px;}
.pbadge-cat{background:var(--sf2);border:1px solid var(--bd);color:var(--mu);}
.pbadge-token{border:1px solid;}
.pbadge-zero{background:rgba(74,222,128,.1);border-color:rgba(74,222,128,.25);color:var(--gn);}
.pbadge-sm{background:rgba(251,191,36,.1);border-color:rgba(251,191,36,.25);color:var(--ye);}
.pbadge-lg{background:rgba(248,113,113,.1);border-color:rgba(248,113,113,.25);color:var(--rd);}
.panel-close{background:none;border:none;color:var(--mu);cursor:pointer;font-size:20px;line-height:1;padding:2px;flex-shrink:0;}
.panel-close:hover{color:var(--tx);}
.panel-body{padding:20px;flex:1;}
.panel-section{margin-bottom:20px;}
.panel-section h4{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--mu);margin-bottom:10px;}
.panel-desc{font-size:13px;color:var(--tx);line-height:1.6;}
.panel-desc.muted{color:var(--mu);}
.token-info{background:rgba(108,143,255,.06);border:1px solid rgba(108,143,255,.15);border-radius:8px;padding:12px 14px;}
.token-row{display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:4px;}
.token-row:last-child{margin-bottom:0;}
.token-row .label{color:var(--mu);}
.token-row .value{font-weight:600;}
.token-row .value.red{color:var(--rd);}
.token-row .value.green{color:var(--gn);}
.examples-list{list-style:none;display:flex;flex-direction:column;gap:6px;}
.example-item{background:var(--cd);border:1px solid var(--bd);border-radius:6px;padding:7px 10px;font-size:12px;font-family:'SF Mono',Menlo,monospace;color:#a5d6ff;cursor:pointer;transition:border-color .12s;}
.example-item:hover{border-color:var(--ac);}
.meta-grid{display:grid;grid-template-columns:auto 1fr;gap:5px 12px;font-size:12px;}
.meta-label{color:var(--mu);white-space:nowrap;}
.meta-value{color:var(--tx);font-family:'SF Mono',Menlo,monospace;font-size:11px;}
.collapsible{border:1px solid var(--bd);border-radius:8px;overflow:hidden;margin-top:4px;}
.collapsible summary{padding:8px 12px;cursor:pointer;font-size:12px;font-weight:600;color:var(--mu);background:var(--sf2);list-style:none;display:flex;align-items:center;justify-content:space-between;}
.collapsible summary::-webkit-details-marker{display:none;}
.collapsible summary::after{content:'▶';font-size:10px;transition:transform .15s;}
.collapsible[open] summary::after{transform:rotate(90deg);}
.collapsible pre{background:var(--cd);padding:12px;font-size:11px;font-family:'SF Mono',Menlo,monospace;color:#c9d1d9;overflow-x:auto;line-height:1.6;white-space:pre-wrap;word-break:break-word;}
.usage-block{background:var(--cd);border:1px solid var(--bd);border-radius:7px;padding:10px 12px;display:flex;flex-direction:column;gap:6px;}
.usage-row{display:flex;align-items:flex-start;gap:10px;font-size:12px;}
.usage-label{color:var(--mu);white-space:nowrap;min-width:80px;flex-shrink:0;}
.usage-code{font-family:'SF Mono',Menlo,monospace;color:#a5d6ff;font-size:11px;word-break:break-all;}
.panel-foot{padding:16px 20px;border-top:1px solid var(--bd);display:flex;gap:10px;flex-shrink:0;background:var(--sf);}
.task-components{display:flex;flex-direction:column;gap:6px;}
.tc-row{display:flex;align-items:center;gap:8px;font-size:12px;padding:6px 10px;background:var(--sf2);border-radius:6px;border:1px solid var(--bd);}
.tc-type{color:var(--mu);font-size:10px;text-transform:uppercase;font-weight:700;width:60px;flex-shrink:0;}
.tc-names{color:var(--tx);flex:1;}
.tc-cost{font-size:11px;color:var(--ye);font-weight:600;flex-shrink:0;}
</style>
</head>
<body>

<!-- Topbar -->
<div class="topbar">
  <span class="logo">Beacon</span>
  <div class="tabs" id="tabs">
    <button class="tab active" data-tab="tasks">Tasks</button>
    <button class="tab" data-tab="agents">Agents</button>
    <button class="tab" data-tab="skills">Skills</button>
    <button class="tab" data-tab="commands">Commands</button>
    <button class="tab" data-tab="hooks">Hooks</button>
    <button class="tab" data-tab="mcps">MCPs</button>
  </div>
  <div class="spacer"></div>
  <div class="search-wrap">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
    <input class="search" id="search" placeholder="Search..." oninput="onSearch(this.value)">
  </div>
</div>

<!-- Token savings banner -->
<div class="savings-banner" id="savings-banner">
  <span class="sb-text" id="savings-text"></span>
  <div class="spacer"></div>
  <span class="sb-badge" id="savings-badge"></span>
</div>

<!-- Layout -->
<div class="layout">
  <div class="sidebar" id="sidebar"></div>
  <div class="main" id="main">
    <div class="loading"><div class="spinner"></div> Loading components...</div>
  </div>
</div>

<!-- Detail panel overlay -->
<div class="overlay" id="overlay" onclick="closePanel()"></div>
<div class="panel" id="panel">
  <div class="panel-hdr">
    <div class="panel-title">
      <span class="panel-name" id="panel-name"></span>
      <div class="panel-badges" id="panel-badges"></div>
    </div>
    <button class="panel-close" onclick="closePanel()">✕</button>
  </div>
  <div class="panel-body" id="panel-body"></div>
  <div class="panel-foot" id="panel-foot"></div>
</div>

<script>
// ── State ─────────────────────────────────────────────────────────────────────
const S = {
  tab: 'tasks',
  search: '',
  category: '',
  data: { tasks:[], agents:[], skills:[], commands:[], hooks:[], mcps:[] },
  installed: { tasks:[], components:{agents:[],skills:[],hooks:[],commands:[]}, mcps:[] },
  tokenStats: { totalSaved: 0, installedCount: 0 },
  loading: true,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function fmtTokens(n) {
  if (n >= 1000) return '~' + (n/1000).toFixed(1) + 'K tokens';
  return '~' + n + ' tokens';
}

function tokenBadgeClass(n) {
  if (n === 0) return 'zero';
  if (n < 5000) return 'sm';
  return 'lg';
}

function isInstalled(type, name) {
  if (type === 'task')    return S.installed.tasks.some(t => t.name === name);
  if (type === 'mcp')     return S.installed.mcps.includes(name);
  const t = type === 'agent' ? 'agents' : type === 'skill' ? 'skills' : type === 'hook' ? 'hooks' : 'commands';
  return (S.installed.components[t] || []).includes(name);
}

// ── Data fetching ─────────────────────────────────────────────────────────────
async function loadAll() {
  try {
    const [tasks, agents, skills, commands, hooks, mcps, installed, stats] = await Promise.all([
      fetch('/api/tasks').then(r=>r.json()),
      fetch('/api/components?type=agents').then(r=>r.json()),
      fetch('/api/components?type=skills').then(r=>r.json()),
      fetch('/api/components?type=commands').then(r=>r.json()),
      fetch('/api/components?type=hooks').then(r=>r.json()),
      fetch('/api/components?type=mcps').then(r=>r.json()),
      fetch('/api/installed').then(r=>r.json()),
      fetch('/api/token-stats').then(r=>r.json()),
    ]);
    S.data = { tasks, agents, skills, commands, hooks, mcps };
    S.installed = installed;
    S.tokenStats = stats;
    S.loading = false;
    updateBanner();
    render();
  } catch(e) {
    $('main').innerHTML = '<div class="empty"><h3>Could not load data</h3><p>' + esc(e.message) + '</p></div>';
  }
}

function currentItems() {
  const t = S.tab;
  const all = t === 'tasks' ? S.data.tasks
    : t === 'agents' ? S.data.agents
    : t === 'skills' ? S.data.skills
    : t === 'commands' ? S.data.commands
    : t === 'hooks' ? S.data.hooks
    : S.data.mcps;
  if (!Array.isArray(all)) return [];
  return all.filter(item => {
    const q = S.search.toLowerCase();
    const id = item.id || item.name || '';
    if (q && !id.toLowerCase().includes(q) && !(item.description||'').toLowerCase().includes(q)) return false;
    if (S.category && S.category !== 'all') {
      if ((item.category || '') !== S.category) return false;
    }
    return true;
  });
}

// ── Render ────────────────────────────────────────────────────────────────────
function render() {
  renderSidebar();
  renderMain();
}

function renderSidebar() {
  const items = S.tab === 'tasks' ? S.data.tasks
    : S.tab === 'agents'   ? S.data.agents
    : S.tab === 'skills'   ? S.data.skills
    : S.tab === 'commands' ? S.data.commands
    : S.tab === 'hooks'    ? S.data.hooks
    : S.data.mcps;

  const cats = {};
  (items || []).forEach(x => {
    const c = x.category || 'general';
    cats[c] = (cats[c] || 0) + 1;
  });

  const total = (items || []).length;
  let html = '';
  html += '<button class="catbtn' + (S.category===''?' act':'') + '" onclick="setCategory(\'\')"><span class="ci">◈</span><span class="cn">All</span><span class="cc">' + total + '</span></button>';
  Object.entries(cats).sort((a,b)=>b[1]-a[1]).forEach(([cat,n]) => {
    const label = cat.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
    html += '<button class="catbtn' + (S.category===cat?' act':'') + '" onclick="setCategory(\'' + esc(cat) + '\')"><span class="ci">·</span><span class="cn">' + esc(label) + '</span><span class="cc">' + n + '</span></button>';
  });
  $('sidebar').innerHTML = html;
}

function renderMain() {
  const items = currentItems();
  const tabLabel = S.tab.charAt(0).toUpperCase() + S.tab.slice(1);

  if (S.loading) {
    $('main').innerHTML = '<div class="loading"><div class="spinner"></div> Loading components...</div>';
    return;
  }

  let html = '<div class="main-hdr"><h2>' + esc(tabLabel) + '</h2><span class="item-count">' + items.length + ' items</span></div>';

  if (items.length === 0) {
    html += '<div class="empty"><h3>No results</h3><p>Try a different search or category.</p></div>';
  } else {
    html += '<div class="grid">';
    items.forEach((item, i) => { html += renderCard(item, i); });
    html += '</div>';
  }
  $('main').innerHTML = html;
}

function renderCard(item, i) {
  const t      = S.tab;
  const id     = item.id || item.name;
  const type   = t === 'tasks' ? 'task' : t === 'mcps' ? 'mcp' : t.slice(0,-1); // agents→agent
  const inst   = isInstalled(type, id);
  const cost   = item.tokenCost || 0;
  const cls    = tokenBadgeClass(cost);
  const catStr = (item.category || '').replace(/-/g,' ');

  let tokenBadge = '';
  if (cost === 0) {
    tokenBadge = '<span class="token-badge zero">0 tokens</span>';
  } else {
    tokenBadge = '<span class="token-badge ' + cls + '">' + fmtTokens(cost) + ' if always-on</span>';
  }

  const instBtn = inst
    ? '<button class="btn btn-installed" onclick="event.stopPropagation();uninstall(\'' + esc(type) + '\',\'' + esc(id) + '\')">Installed ✓</button>'
    : '<button class="btn btn-primary" onclick="event.stopPropagation();install(\'' + esc(type) + '\',\'' + esc(id) + '\',this)">Install</button>';

  return '<div class="card' + (inst?' installed':'') + '" onclick="openPanel(' + i + ')">' +
    '<div class="card-top"><span class="card-name">' + esc(item.name || id) + '</span>' +
    (catStr ? '<span class="card-cat">' + esc(catStr) + '</span>' : '') + '</div>' +
    '<div class="card-desc">' + esc(item.description || '') + '</div>' +
    '<div class="card-foot">' + tokenBadge + instBtn + '</div>' +
    '</div>';
}

function updateBanner() {
  const { totalSaved, installedCount } = S.tokenStats;
  const banner = $('savings-banner');
  if (installedCount === 0 || totalSaved === 0) { banner.classList.remove('visible'); return; }
  $('savings-text').innerHTML = 'Your <strong>' + installedCount + ' installed component' + (installedCount>1?'s':'') + '</strong> would cost <strong>' + fmtTokens(totalSaved) + '/session</strong> if always loaded.';
  $('savings-badge').textContent = 'With Beacon: 0 tokens until invoked';
  banner.classList.add('visible');
}

// ── Tab & category ────────────────────────────────────────────────────────────
function setTab(tab) {
  S.tab = tab;
  S.category = '';
  S.search = '';
  $('search').value = '';
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  render();
}

function setCategory(cat) {
  S.category = cat;
  renderSidebar();
  renderMain();
}

function onSearch(q) {
  S.search = q;
  renderMain();
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => setTab(t.dataset.tab)));

// ── Detail panel ──────────────────────────────────────────────────────────────
function openPanel(idx) {
  const items = currentItems();
  const item  = items[idx];
  if (!item) return;
  const type = S.tab === 'tasks' ? 'task' : S.tab === 'mcps' ? 'mcp' : S.tab.slice(0,-1);
  const id   = item.id || item.name;
  const inst = isInstalled(type, id);

  $('panel-name').textContent = item.name || id;

  // Badges
  const cost = item.tokenCost || 0;
  const tc   = tokenBadgeClass(cost);
  const tokenLabel = cost === 0 ? '0 tokens — no context overhead' : fmtTokens(cost) + ' if always-on';
  $('panel-badges').innerHTML =
    (item.category ? '<span class="pbadge pbadge-cat">' + esc(item.category.replace(/-/g,' ')) + '</span>' : '') +
    '<span class="pbadge pbadge-token pbadge-' + tc + '">' + esc(tokenLabel) + '</span>';

  // Body content
  $('panel-body').innerHTML = buildPanelBody(item, type);

  // Footer install button
  $('panel-foot').innerHTML = inst
    ? '<button class="btn btn-installed" onclick="uninstall(\'' + esc(type) + '\',\'' + esc(id) + '\')" style="flex:1">Installed — click to remove</button>'
    : '<button class="btn btn-primary" onclick="install(\'' + esc(type) + '\',\'' + esc(id) + '\',this)" style="flex:1">Install</button>';

  $('overlay').classList.add('open');
  $('panel').classList.add('open');
}

function closePanel() {
  $('overlay').classList.remove('open');
  $('panel').classList.remove('open');
}

function buildPanelBody(item, type) {
  let html = '';

  // Description
  html += '<div class="panel-section"><div class="panel-desc">' + esc(item.description || '') + '</div></div>';

  // Token info block
  const cost = item.tokenCost || 0;
  if (type !== 'hook' && type !== 'command') {
    html += '<div class="panel-section"><h4>Token Impact</h4><div class="token-info">';
    html += '<div class="token-row"><span class="label">If always loaded:</span><span class="value red">' + (cost > 0 ? fmtTokens(cost) + '/session' : 'N/A') + '</span></div>';
    html += '<div class="token-row"><span class="label">With Beacon:</span><span class="value green">0 tokens until invoked</span></div>';
    if (cost > 0) {
      const daily = cost * 10;
      html += '<div class="token-row"><span class="label">Saved (10 sessions/day):</span><span class="value green">' + fmtTokens(daily) + '/day</span></div>';
    }
    html += '</div></div>';
  } else if (type === 'hook') {
    html += '<div class="panel-section"><h4>Token Impact</h4><div class="token-info">';
    html += '<div class="token-row"><span class="label">Context overhead:</span><span class="value green">0 tokens — hooks run as external processes</span></div>';
    html += '</div></div>';
  }

  // Type-specific content
  if (type === 'task') {
    html += buildTaskSection(item);
  } else if (type === 'agent') {
    html += buildAgentSection(item);
  } else if (type === 'skill') {
    html += buildSkillSection(item);
  } else if (type === 'command') {
    html += buildCommandSection(item);
  } else if (type === 'hook') {
    html += buildHookSection(item);
  } else if (type === 'mcp') {
    html += buildMCPSection(item);
  }

  return html;
}

function buildExamplesSection(examples, type) {
  if (!examples || !examples.length) return '';
  let html = '<div class="panel-section"><h4>Example Usage</h4><ul class="examples-list">';
  examples.forEach(ex => {
    html += '<li class="example-item" onclick="copyToClipboard(\'' + esc(ex.replace(/'/g,"\\'")) + '\')">' + esc(ex) + '</li>';
  });
  html += '</ul></div>';
  return html;
}

function buildTaskSection(item) {
  let html = '';
  // Components list
  const hasComponents = (item.mcps||[]).length + (item.agents||[]).length + (item.skills||[]).length + (item.hooks||[]).length > 0;
  if (hasComponents) {
    html += '<div class="panel-section"><h4>What\'s Included</h4><div class="task-components">';
    if ((item.mcps||[]).length) {
      html += '<div class="tc-row"><span class="tc-type">MCPs</span><span class="tc-names">' + esc((item.mcps||[]).map(m=>m.name).join(', ')) + '</span>' +
        '<span class="tc-cost">' + fmtTokens((item.mcps||[]).reduce((s,m)=>s+(m.tokenCost||3000),0)) + '</span></div>';
    }
    if ((item.agents||[]).length) {
      const agentCost = S.data.agents.filter(a=>(item.agents||[]).includes(a.name)).reduce((s,a)=>s+(a.tokenCost||0),0);
      html += '<div class="tc-row"><span class="tc-type">Agents</span><span class="tc-names">' + esc((item.agents||[]).join(', ')) + '</span>' +
        '<span class="tc-cost">' + fmtTokens(agentCost) + '</span></div>';
    }
    if ((item.skills||[]).length) {
      html += '<div class="tc-row"><span class="tc-type">Skills</span><span class="tc-names">' + esc((item.skills||[]).join(', ')) + '</span><span class="tc-cost">minimal</span></div>';
    }
    if ((item.hooks||[]).length) {
      html += '<div class="tc-row"><span class="tc-type">Hooks</span><span class="tc-names">' + esc((item.hooks||[]).join(', ')) + '</span><span class="tc-cost">0 tokens</span></div>';
    }
    html += '</div></div>';
  }
  // Usage
  html += '<div class="panel-section"><h4>Usage</h4><div class="usage-block">';
  html += '<div class="usage-row"><span class="usage-label">In session:</span><span class="usage-code">/' + esc(item.name) + '</span></div>';
  html += '<div class="usage-row"><span class="usage-label">Headless:</span><span class="usage-code">beacon ' + esc(item.name) + '</span></div>';
  html += '<div class="usage-row"><span class="usage-label">Interactive:</span><span class="usage-code">beacon ' + esc(item.name) + ' -i</span></div>';
  if (item.prompt) {
    html += '<div class="usage-row"><span class="usage-label">Custom:</span><span class="usage-code">beacon ' + esc(item.name) + ' "your prompt"</span></div>';
  }
  html += '</div></div>';
  if (item.examples) html += buildExamplesSection(item.examples, 'task');
  return html;
}

function buildAgentSection(item) {
  let html = '';
  html += buildExamplesSection(item.examples, 'agent');
  html += '<div class="panel-section"><h4>Usage</h4><div class="usage-block">';
  html += '<div class="usage-row"><span class="usage-label">In session:</span><span class="usage-code">"Use the ' + esc(item.name) + ' to..."</span></div>';
  html += '<div class="usage-row"><span class="usage-label">Via beacon:</span><span class="usage-code">Add to a task bundle, then run beacon &lt;task&gt;</span></div>';
  html += '</div></div>';
  if (item.body) {
    html += '<div class="panel-section"><details class="collapsible"><summary>System Prompt</summary><pre>' + esc(item.body.slice(0,3000)) + (item.body.length>3000?'\n...':'') + '</pre></details></div>';
  }
  return html;
}

function buildSkillSection(item) {
  let html = '';
  html += buildExamplesSection(item.examples, 'skill');
  html += '<div class="panel-section"><h4>Usage</h4><div class="usage-block">';
  html += '<div class="usage-row"><span class="usage-label">In session:</span><span class="usage-code">/' + esc(item.name) + '</span></div>';
  html += '</div></div>';
  if (item.body) {
    html += '<div class="panel-section"><details class="collapsible"><summary>Skill Content</summary><pre>' + esc(item.body.slice(0,3000)) + '</pre></details></div>';
  }
  return html;
}

function buildCommandSection(item) {
  let html = '';
  if (item.argumentHint || item.allowedTools) {
    html += '<div class="panel-section"><h4>Details</h4><div class="meta-grid">';
    if (item.argumentHint) html += '<span class="meta-label">Argument:</span><span class="meta-value">' + esc(item.argumentHint) + '</span>';
    if (item.allowedTools) html += '<span class="meta-label">Tools:</span><span class="meta-value">' + esc(item.allowedTools) + '</span>';
    html += '</div></div>';
  }
  html += buildExamplesSection(item.examples, 'command');
  html += '<div class="panel-section"><h4>Usage</h4><div class="usage-block">';
  html += '<div class="usage-row"><span class="usage-label">In session:</span><span class="usage-code">/' + esc(item.name) + (item.argumentHint?' '+esc(item.argumentHint):'') + '</span></div>';
  html += '</div></div>';
  if (item.body) {
    html += '<div class="panel-section"><details class="collapsible"><summary>Command Template</summary><pre>' + esc(item.body.slice(0,2000)) + '</pre></details></div>';
  }
  return html;
}

function buildHookSection(item) {
  let html = '';
  html += '<div class="panel-section"><h4>Configuration</h4><div class="meta-grid">';
  html += '<span class="meta-label">Event:</span><span class="meta-value">' + esc(item.event || 'PostToolUse') + '</span>';
  html += '<span class="meta-label">Matcher:</span><span class="meta-value">' + esc(item.matcher || '*') + '</span>';
  html += '</div></div>';
  html += buildExamplesSection(item.examples, 'hook');
  html += '<div class="panel-section"><h4>Usage</h4><div class="usage-block">';
  html += '<div class="usage-row"><span class="usage-label">Activation:</span><span class="usage-code">Install to components, then add to a task bundle</span></div>';
  html += '<div class="usage-row"><span class="usage-label">Fires on:</span><span class="usage-code">' + esc(item.event || 'PostToolUse') + ' when ' + esc(item.matcher || '*') + ' matches</span></div>';
  html += '</div></div>';
  if (item.script) {
    html += '<div class="panel-section"><details class="collapsible"><summary>Script</summary><pre>' + esc(item.script) + '</pre></details></div>';
  }
  return html;
}

function buildMCPSection(item) {
  let html = '';
  html += '<div class="panel-section"><h4>Details</h4><div class="meta-grid">';
  if (item.vendor) html += '<span class="meta-label">Vendor:</span><span class="meta-value">' + esc(item.vendor) + '</span>';
  if (item.category) html += '<span class="meta-label">Category:</span><span class="meta-value">' + esc(item.category.replace(/-/g,' ')) + '</span>';
  const cmd = [item.command, ...(item.args||[])].join(' ');
  html += '<span class="meta-label">Command:</span><span class="meta-value">' + esc(cmd) + '</span>';
  if (item.dockerHub) html += '<span class="meta-label">Docker Hub:</span><span class="meta-value"><a href="' + esc(item.dockerHub) + '" target="_blank" style="color:var(--ac)">' + esc(item.dockerHub.replace('https://hub.docker.com/r/','')) + '</a></span>';
  if (item.repository) html += '<span class="meta-label">Repository:</span><span class="meta-value"><a href="' + esc(item.repository) + '" target="_blank" style="color:var(--ac)">' + esc(item.repository.replace('https://github.com/','')) + '</a></span>';
  html += '</div></div>';
  const envKeys = Object.keys(item.env || {});
  if (envKeys.length) {
    html += '<div class="panel-section"><h4>Environment Variables</h4><div class="meta-grid">';
    envKeys.forEach(k => { html += '<span class="meta-label">' + esc(k) + '</span><span class="meta-value">' + esc(item.env[k]) + '</span>'; });
    html += '</div></div>';
  }
  html += '<div class="panel-section"><h4>Usage</h4><div class="usage-block">';
  html += '<div class="usage-row"><span class="usage-label">Via Beacon:</span><span class="usage-code">Install, then add to a task bundle</span></div>';
  html += '<div class="usage-row"><span class="usage-label">Direct:</span><span class="usage-code">docker run -i --rm mcp/' + esc(item.id) + '</span></div>';
  html += '</div></div>';
  return html;
}

// ── Install / Uninstall ───────────────────────────────────────────────────────
async function install(type, id, btn) {
  if (btn) { btn.textContent = 'Installing...'; btn.disabled = true; }
  try {
    let endpoint, body;
    if (type === 'task')    { endpoint = '/api/install-task'; body = { name: id }; }
    else if (type === 'mcp') { endpoint = '/api/install-mcp'; body = { id }; }
    else                    { endpoint = '/api/install-component'; body = { type, name: id }; }
    const r = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    // Refresh installed state
    const [installed, stats] = await Promise.all([
      fetch('/api/installed').then(r=>r.json()),
      fetch('/api/token-stats').then(r=>r.json()),
    ]);
    S.installed = installed;
    S.tokenStats = stats;
    updateBanner();
    render();
    // Refresh panel footer if open
    const panel = $('panel');
    if (panel.classList.contains('open')) {
      $('panel-foot').innerHTML = '<button class="btn btn-installed" onclick="uninstall(\'' + esc(type) + '\',\'' + esc(id) + '\')" style="flex:1">Installed — click to remove</button>';
    }
  } catch(e) {
    alert('Install failed: ' + e.message);
    if (btn) { btn.textContent = 'Install'; btn.disabled = false; }
  }
}

async function uninstall(type, id) {
  const endpoint = type === 'task' ? '/api/task/' + encodeURIComponent(id)
    : '/api/component/' + encodeURIComponent(type) + '/' + encodeURIComponent(id);
  try {
    await fetch(endpoint, { method: 'DELETE' });
    const [installed, stats] = await Promise.all([
      fetch('/api/installed').then(r=>r.json()),
      fetch('/api/token-stats').then(r=>r.json()),
    ]);
    S.installed = installed;
    S.tokenStats = stats;
    updateBanner();
    render();
    closePanel();
  } catch(e) { alert('Uninstall failed: ' + e.message); }
}

// ── Clipboard ─────────────────────────────────────────────────────────────────
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ── Init ──────────────────────────────────────────────────────────────────────
loadAll();
</script>
</body>
</html>`;
}

module.exports = { HTML };
