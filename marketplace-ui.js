'use strict';
// ── Beacon Marketplace UI ─────────────────────────────────────────────────────
// Exported as HTML(plugins, skills, agents, hooks) → string

function HTML(PLUGINS, SKILLS, AGENTS, HOOKS) {
  const j = x => JSON.stringify(x);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Beacon</title>
<style>
:root{--bg:#0f1117;--sf:#1a1d27;--sf2:#22263a;--bd:#2e334d;--ac:#6c8fff;--ac2:#a78bfa;--gn:#4ade80;--ye:#fbbf24;--rd:#f87171;--tx:#e2e8f0;--mu:#8892aa;--cd:#0d1117;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--tx);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;display:flex;flex-direction:column;height:100vh;overflow:hidden;}
.topbar{background:var(--sf);border-bottom:1px solid var(--bd);padding:0 16px;height:54px;display:flex;align-items:center;gap:10px;flex-shrink:0;}
.logo{font-size:16px;font-weight:800;background:linear-gradient(135deg,#e2e8f0,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;white-space:nowrap;}
.tabs{display:flex;gap:2px;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:3px;flex-shrink:0;}
.tab{padding:5px 11px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:none;color:var(--mu);transition:all .15s;white-space:nowrap;}
.tab.active{background:var(--ac);color:#fff;}
.spacer{flex:1;}
input.search{width:220px;background:var(--sf2);border:1px solid var(--bd);border-radius:7px;padding:7px 12px;color:var(--tx);font-size:13px;outline:none;flex-shrink:0;}
input.search:focus{border-color:var(--ac);}
input.search::placeholder{color:var(--mu);}
.ibadge{background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.25);color:var(--gn);padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;display:none;white-space:nowrap;}
.layout{display:flex;flex:1;overflow:hidden;}
.sidebar{width:185px;background:var(--sf);border-right:1px solid var(--bd);padding:12px 10px;overflow-y:auto;flex-shrink:0;}
.slabel{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--mu);padding:0 8px;margin-bottom:8px;display:block;}
.catbtn{display:flex;align-items:center;gap:7px;width:100%;padding:7px 9px;border-radius:6px;background:none;border:none;color:var(--mu);font-size:12px;cursor:pointer;text-align:left;transition:all .12s;}
.catbtn:hover{background:var(--sf2);color:var(--tx);}
.catbtn.act{background:rgba(108,143,255,.12);color:var(--ac);font-weight:600;}
.catbtn .ce{font-size:14px;width:18px;text-align:center;}
.cc{margin-left:auto;font-size:10px;color:var(--mu);background:var(--sf2);padding:1px 5px;border-radius:8px;}
.main{flex:1;overflow-y:auto;padding:20px;}
.ghdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
.ghdr h2{font-size:14px;font-weight:700;}
.gmeta{font-size:12px;color:var(--mu);display:flex;align-items:center;gap:8px;}
.rbadge{font-size:10px;padding:2px 7px;border-radius:8px;background:rgba(108,143,255,.1);border:1px solid rgba(108,143,255,.2);color:var(--ac);}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(285px,1fr));gap:14px;}
.card{background:var(--sf);border:1px solid var(--bd);border-radius:11px;padding:16px;display:flex;flex-direction:column;gap:10px;transition:border-color .15s,transform .12s;}
.card:hover{border-color:rgba(108,143,255,.35);transform:translateY(-1px);}
.card.ins{border-color:rgba(74,222,128,.25);}
.ctop{display:flex;align-items:flex-start;gap:10px;}
.cicon{font-size:20px;width:38px;height:38px;background:var(--sf2);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.cname{font-size:13px;font-weight:700;color:var(--tx);display:flex;align-items:center;gap:5px;flex-wrap:wrap;}
.offb{font-size:9px;font-weight:700;text-transform:uppercase;background:rgba(108,143,255,.12);color:var(--ac);border:1px solid rgba(108,143,255,.2);padding:1px 5px;border-radius:8px;}
.bwcb{font-size:9px;font-weight:700;text-transform:uppercase;background:rgba(167,139,250,.12);color:var(--ac2);border:1px solid rgba(167,139,250,.2);padding:1px 5px;border-radius:8px;}
.dockerb{font-size:9px;font-weight:700;text-transform:uppercase;background:rgba(14,165,233,.12);color:#38bdf8;border:1px solid rgba(14,165,233,.2);padding:1px 5px;border-radius:8px;}
.csub{font-size:11px;color:var(--mu);margin-top:1px;}
.cdesc{font-size:12px;color:var(--mu);line-height:1.5;flex:1;}
.catpill{font-size:10px;padding:2px 6px;border-radius:8px;background:var(--sf2);border:1px solid var(--bd);color:var(--mu);}
.envh{font-size:11px;color:var(--ye);display:flex;align-items:center;gap:4px;}
.envh::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--ye);flex-shrink:0;}
.cfoot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:4px;}
.btn{padding:6px 14px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:none;transition:all .12s;}
.badd{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;}
.badd:hover{opacity:.88;}
.badd:disabled{opacity:.5;cursor:wait;}
.brm{background:var(--sf2);color:var(--mu);border:1px solid var(--bd);}
.brm:hover{border-color:var(--rd);color:var(--rd);}
.ipill{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--gn);font-weight:600;}
.ipill::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--gn);}
.scenter{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;color:var(--mu);}
.spin{width:24px;height:24px;border:2px solid var(--bd);border-top-color:var(--ac);border-radius:50%;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.pager{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:20px;padding:10px;}
.pbtn{padding:6px 14px;border-radius:6px;background:var(--sf);border:1px solid var(--bd);color:var(--tx);font-size:12px;cursor:pointer;}
.pbtn:hover{border-color:var(--ac);color:var(--ac);}
.pbtn:disabled{opacity:.4;cursor:not-allowed;}
.pinfo{font-size:12px;color:var(--mu);}
.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);z-index:50;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s;}
.backdrop.open{opacity:1;pointer-events:all;}
.modal{background:var(--sf);border:1px solid var(--bd);border-radius:13px;width:480px;max-width:90vw;max-height:80vh;overflow-y:auto;padding:24px;}
.modal h3{font-size:16px;font-weight:700;margin-bottom:4px;}
.msub{font-size:12px;color:var(--mu);margin-bottom:18px;}
.field{margin-bottom:14px;}
.field label{display:block;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;color:var(--mu);margin-bottom:5px;}
.field label .req{color:var(--rd);}
.field input{width:100%;background:var(--cd);border:1px solid var(--bd);border-radius:6px;padding:8px 11px;color:var(--tx);font-size:12px;font-family:monospace;outline:none;}
.field input:focus{border-color:var(--ac);}
.hint{font-size:11px;color:var(--mu);margin-top:3px;}
.mcode{background:var(--cd);border:1px solid var(--bd);border-radius:7px;padding:12px 14px;font-family:monospace;font-size:12px;color:#a5d6ff;margin:12px 0;user-select:all;word-break:break-all;}
.mactions{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;}
.bcancel{background:var(--sf2);color:var(--mu);border:1px solid var(--bd);}
.bconfirm{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;padding:8px 20px;}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(6px);background:var(--sf);border:1px solid var(--bd);border-radius:9px;padding:10px 18px;font-size:12px;font-weight:600;opacity:0;pointer-events:none;transition:all .22s;z-index:200;white-space:nowrap;}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);}
.toast.ok{border-color:rgba(74,222,128,.35);color:var(--gn);}
.toast.err{border-color:rgba(248,113,113,.35);color:var(--rd);}
</style>
</head>
<body>
<div class="topbar">
  <div class="logo">▸ Beacon</div>
  <div class="tabs" id="tabs">
    <button class="tab active" data-tab="plugins">Plugins</button>
    <button class="tab" data-tab="skills">Skills</button>
    <button class="tab" data-tab="subagents">Subagents</button>
    <button class="tab" data-tab="commands">Commands</button>
    <button class="tab" data-tab="hooks">Hooks</button>
    <button class="tab" data-tab="mcp">MCP Servers</button>
  </div>
  <div class="spacer"></div>
  <input class="search" id="search" type="text" placeholder="Search…" oninput="onSearch(this.value)">
  <div class="ibadge" id="ibadge"></div>
</div>
<div class="layout">
  <div class="sidebar" id="sidebar"></div>
  <div class="main"    id="main"></div>
</div>
<div class="backdrop" id="backdrop">
  <div class="modal">
    <h3 id="mtitle"></h3>
    <div class="msub" id="msub"></div>
    <div id="mfields"></div>
    <div class="mactions">
      <button class="btn bcancel" onclick="closeModal()">Cancel</button>
      <button class="btn bconfirm" id="mconfirm" onclick="doConfirm()">Confirm</button>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>

<script>
// ── Static data (server-injected) ──────────────────────────────────────────
const PLUGINS  = ${j(PLUGINS)};
const SKILLS   = ${j(SKILLS)};
const AGENTS   = ${j(AGENTS)};
const HOOKS    = ${j(HOOKS)};
let   COMMANDS = []; // loaded async

// ── State ──────────────────────────────────────────────────────────────────
let tab='plugins', cat='all', q='', sbTimer=null;
let mcpData=[], mcpLoading=false, dockerMCPs=[], cursors=[null], pageIdx=0, total=0;
let installed={mcps:new Set(),skills:new Set(),agents:new Set(),commands:new Set(),hooks:new Set(),plugins:new Set()};
let pending=null;

// ── Boot ───────────────────────────────────────────────────────────────────
(async()=>{
  await loadInstalled();
  // Fetch commands async so UI isn't blocked
  fetch('/api/commands').then(r=>r.json()).then(d=>{ COMMANDS=d||[]; if(tab==='commands') renderTab(); }).catch(()=>{});
  document.getElementById('tabs').addEventListener('click', e=>{
    const t=e.target.closest('.tab');
    if(t){ switchTab(t.dataset.tab); }
  });
  renderTab();
})();

async function loadInstalled(){
  try {
    const [a,b,c,d,e,f]=await Promise.all([
      fetch('/api/installed').then(r=>r.json()),
      fetch('/api/installed-skills').then(r=>r.json()),
      fetch('/api/installed-agents').then(r=>r.json()),
      fetch('/api/installed-commands').then(r=>r.json()),
      fetch('/api/installed-hooks').then(r=>r.json()),
      fetch('/api/installed-plugins').then(r=>r.json()),
    ]);
    installed={mcps:new Set(a),skills:new Set(b),agents:new Set(c),commands:new Set(d),hooks:new Set(e),plugins:new Set(f)};
    updateBadge();
  } catch(e){ console.warn('installed check failed',e); }
}
function updateBadge(){
  const n=Object.values(installed).reduce((s,x)=>s+x.size,0);
  const el=document.getElementById('ibadge');
  el.style.display=n?'':'none'; el.textContent=n+' installed';
}
function switchTab(t){
  tab=t; cat='all'; q=''; document.getElementById('search').value='';
  cursors=[null]; pageIdx=0; mcpData=[];
  document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
  renderTab();
}
function onSearch(v){ q=v; clearTimeout(sbTimer);
  if(tab==='mcp'){ cursors=[null]; pageIdx=0; sbTimer=setTimeout(fetchMCPs,400); }
  else sbTimer=setTimeout(renderTab,200);
}
function renderTab(){
  if(tab==='mcp')      renderMCP();
  else if(tab==='plugins')  renderList('Plugins',   PLUGINS,  pluginCats(),  pluginCard,  'Plugin bundles from buildwithclaude.com');
  else if(tab==='skills')   renderList('Skills',    SKILLS,   itemCats(SKILLS),  skillCard,   'buildwithclaude.com/skills');
  else if(tab==='subagents')renderList('Subagents', AGENTS,   itemCats(AGENTS),  agentCard,   'buildwithclaude.com/agents');
  else if(tab==='commands') renderList('Commands',  COMMANDS, itemCats(COMMANDS),commandCard, 'buildwithclaude.com/commands');
  else if(tab==='hooks')    renderList('Hooks',     HOOKS,    hookCats(),    hookCard,    'buildwithclaude.com/hooks');
}

// ── Category helpers ───────────────────────────────────────────────────────
function cats(arr, keyFn){ const m={}; arr.forEach(x=>{ const k=keyFn(x)||'other'; m[k]=(m[k]||0)+1; }); return m; }
function itemCats(arr){
  const m=cats(arr, x=>x.category);
  return [{id:'all',label:'All',emoji:'✦',count:arr.length},...Object.keys(m).sort().map(k=>({id:k,label:fmtCat(k),emoji:'•',count:m[k]}))];
}
function pluginCats(){
  const m=cats(PLUGINS, x=>x.category);
  return [{id:'all',label:'All',emoji:'✦',count:PLUGINS.length},...Object.keys(m).sort().map(k=>({id:k,label:fmtCat(k),emoji:'•',count:m[k]}))];
}
function hookCats(){
  const m=cats(HOOKS, x=>x.category);
  return [{id:'all',label:'All',emoji:'✦',count:HOOKS.length},...Object.keys(m).sort().map(k=>({id:k,label:fmtCat(k),emoji:'•',count:m[k]}))];
}
function fmtCat(s){ return (s||'other').replace(/-/g,' ').replace(/\b./g,c=>c.toUpperCase()); }

// ── Generic list renderer ──────────────────────────────────────────────────
let _sbFn=null;
function renderList(title, items, cats, cardFn, source){
  sidebar(cats, cat, c=>{ cat=c; renderTab(); });
  const filtered=items.filter(x=>{
    const catOk=cat==='all'||(x.category||'other')===cat;
    const qOk=!q||JSON.stringify(x).toLowerCase().includes(q.toLowerCase());
    return catOk&&qOk;
  });
  const m=document.getElementById('main');
  if(!filtered.length){ m.innerHTML='<div class="scenter"><div style="font-size:32px">🔦</div><div>No results</div></div>'; return; }
  m.innerHTML=\`<div class="ghdr"><h2>\${esc(title)}</h2><div class="gmeta"><span class="rbadge">\${esc(source)}</span><span>\${filtered.length} items</span></div></div>
  <div class="grid">\${filtered.map(cardFn).join('')}</div>\`;
}
function sidebar(cats, active, fn){
  _sbFn=fn;
  document.getElementById('sidebar').innerHTML='<span class="slabel">Categories</span>'+
    cats.map(c=>\`<button class="catbtn \${active===c.id?'act':''}" data-cat="\${esc(c.id)}" onclick="_sbClick(this)">
      <span class="ce">\${c.emoji||'•'}</span>\${esc(c.label)}\${c.count!=null?'<span class="cc">'+c.count+'</span>':''}
    </button>\`).join('');
}
function _sbClick(el){ if(_sbFn) _sbFn(el.dataset.cat); }

// ── Card renderers ─────────────────────────────────────────────────────────
function pluginCard(p){
  const ins=installed.plugins.has(p.name);
  const catLabel=fmtCat(p.category);
  return \`<div class="card \${ins?'ins':''}">
    <div class="ctop"><div class="cicon">🔌</div>
      <div><div class="cname">\${esc(p.name)} <span class="bwcb">BWC</span></div>
      <div class="csub">by \${esc((p.author&&p.author.name)||'BuildWithClaude')} · <span class="catpill">\${esc(catLabel)}</span></div></div>
    </div>
    <div class="cdesc">\${esc((p.description||'').slice(0,140))}</div>
    <div class="cfoot">\${ins
      ?'<div class="ipill">Installed</div><button class="btn brm" onclick=\\'rmPlugin('+escA(JSON.stringify(p.name))+')\\'> Remove</button>'
      :'<div></div><button class="btn badd" onclick=\\'addPlugin('+escA(JSON.stringify(p))+')\\'>Add to Beacon</button>'
    }</div>
  </div>\`;
}
function skillCard(s){
  const ins=installed.skills.has(s.name);
  return bwcCard(s, ins, '🧠',
    ins?'<div class="ipill">Installed</div><button class="btn brm" onclick=\\'rmItem("skill",'+escA(JSON.stringify(s.name))+')\\'> Remove</button>'
       :'<div></div><button class="btn badd" onclick=\\'addBWC("skill",'+escA(JSON.stringify(s))+')\\'> Add to Beacon</button>'
  );
}
function agentCard(a){
  const ins=installed.agents.has(a.name);
  return bwcCard(a, ins, '🤖',
    ins?'<div class="ipill">Installed</div><button class="btn brm" onclick=\\'rmItem("agent",'+escA(JSON.stringify(a.name))+')\\'> Remove</button>'
       :'<div></div><button class="btn badd" onclick=\\'addBWC("agent",'+escA(JSON.stringify(a))+')\\'> Add to Beacon</button>'
  );
}
function commandCard(c){
  const ins=installed.commands.has(c.name);
  return bwcCard(c, ins, '/',
    ins?'<div class="ipill">Installed — /'+esc(c.name)+'</div><button class="btn brm" onclick=\\'rmItem("command",'+escA(JSON.stringify(c.name))+')\\'> Remove</button>'
       :'<div></div><button class="btn badd" onclick=\\'addBWC("command",'+escA(JSON.stringify(c))+')\\'> Add to Beacon</button>'
  );
}
function hookCard(h){
  const ins=installed.hooks.has(h.name);
  const meta=h.event?'<span class="catpill">'+esc(h.event)+'</span>':'';
  return bwcCard({...h, description:(h.description||'')+(h.event?\' · Event: \'+h.event+\' · Matcher: \'+h.matcher:\'')}, ins, '⚙️',
    ins?'<div class="ipill">Installed</div><button class="btn brm" onclick=\\'rmItem("hook",'+escA(JSON.stringify(h.name))+')\\'> Remove</button>'
       :'<div></div><button class="btn badd" onclick=\\'addHook('+escA(JSON.stringify(h))+')\\'> Add to Beacon</button>'
  );
}
function bwcCard(item, ins, icon, footer){
  return \`<div class="card \${ins?'ins':''}">
    <div class="ctop"><div class="cicon">\${icon}</div>
      <div><div class="cname">\${esc(item.name)}</div>
      \${item.category?'<div class="csub"><span class="catpill">'+esc(fmtCat(item.category))+'</span></div>':''}
      </div>
    </div>
    <div class="cdesc">\${esc((item.description||'').slice(0,150))}</div>
    <div class="cfoot">\${footer}</div>
  </div>\`;
}

// ── MCP tab ────────────────────────────────────────────────────────────────
function renderMCP(){
  sidebar([
    {id:'all',    label:'All Servers', emoji:'✦'},
    {id:'npm',    label:'npm packages',emoji:'📦'},
    {id:'remote', label:'Remote / SSE',emoji:'🌐'},
    {id:'docker', label:'Docker (BWC)', emoji:'🐳'},
  ], cat, c=>{ cat=c; cursors=[null]; pageIdx=0; if(c==='docker') renderDockerMCPs(); else fetchMCPs(); });
  if(cat==='docker'){ renderDockerMCPs(); return; }
  if(mcpData.length===0 && !mcpLoading) fetchMCPs(); else renderMCPGrid();
}
async function fetchMCPs(){
  mcpLoading=true; renderMCPGrid();
  try {
    const p=new URLSearchParams({limit:24});
    if(q) p.set('search',q);
    if(cursors[pageIdx]) p.set('cursor',cursors[pageIdx]);
    const d=await fetch('/api/registry?'+p).then(r=>r.json());
    mcpData=(d.servers||[]).map(x=>({...x.server,_meta:x._meta}));
    total=d.metadata?.count||0;
    const nc=d.metadata?.nextCursor;
    if(nc && cursors[pageIdx+1]!==nc) cursors[pageIdx+1]=nc;
  } catch(e){ mcpData=[]; }
  mcpLoading=false; renderMCPGrid();
}
async function renderDockerMCPs(){
  if(!dockerMCPs.length){
    try { dockerMCPs=await fetch('/api/docker-mcps').then(r=>r.json()); } catch{}
  }
  const filtered=dockerMCPs.filter(s=>!q||JSON.stringify(s).toLowerCase().includes(q.toLowerCase()));
  const m=document.getElementById('main');
  if(!filtered.length){ m.innerHTML='<div class="scenter"><div style="font-size:32px">🐳</div><div>No Docker servers found</div></div>'; return; }
  m.innerHTML=\`<div class="ghdr"><h2>Docker MCP Servers</h2><div class="gmeta"><span class="rbadge">buildwithclaude · Docker Hub</span><span>\${filtered.length} servers</span></div></div>
  <div class="grid">\${filtered.map(dockerCard).join('')}</div>\`;
}
function dockerCard(s){
  const ins=installed.mcps.has(s.id);
  return \`<div class="card \${ins?'ins':''}">
    <div class="ctop"><div class="cicon">🐳</div>
      <div><div class="cname">\${esc(s.displayName||s.id)} <span class="dockerb">Docker</span></div>
      <div class="csub">\${esc(s.vendor||'MCP')} · <span class="catpill">\${esc(s.category||'')}</span></div></div>
    </div>
    <div class="cdesc">\${esc((s.description||'').slice(0,130))}</div>
    <div class="cfoot">\${ins
      ?'<div class="ipill">Installed</div><button class="btn brm" onclick=\\'rmMCP('+escA(JSON.stringify(s.id))+')\\'> Remove</button>'
      :'<div></div><button class="btn badd" onclick=\\'addDockerMCP('+escA(JSON.stringify(s))+')\\'> Add to Beacon</button>'
    }</div>
  </div>\`;
}
function renderMCPGrid(){
  const m=document.getElementById('main');
  if(mcpLoading){ m.innerHTML='<div class="scenter"><div class="spin"></div><div>Fetching from registry.modelcontextprotocol.io…</div></div>'; return; }
  if(!mcpData.length){ m.innerHTML='<div class="scenter"><div style="font-size:32px">🔦</div><div>No servers found</div></div>'; return; }
  const hasPrev=pageIdx>0, hasNext=!!cursors[pageIdx+1];
  m.innerHTML=\`<div class="ghdr"><h2>MCP Servers</h2><div class="gmeta"><span class="rbadge">Live · registry.modelcontextprotocol.io</span>\${total?'<span>'+total.toLocaleString()+' total</span>':''}</div></div>
  <div class="grid">\${mcpData.map(mcpCard).join('')}</div>
  <div class="pager">
    <button class="pbtn" \${!hasPrev?'disabled':''} onclick="mcpPrev()">← Prev</button>
    <span class="pinfo">Page \${pageIdx+1}</span>
    <button class="pbtn" \${!hasNext?'disabled':''} onclick="mcpNext()">Next →</button>
  </div>\`;
}
function mcpCard(s){
  const cfg=parseCfg(s), id=cfg?.id||safeId(s.name||'');
  const ins=installed.mcps.has(id);
  const name=(s.title||s.name||id).split('/').pop();
  const desc=(s.description||'').slice(0,130);
  const pkg=(s.packages||[])[0], remote=(s.remotes||[])[0];
  const type=pkg?(pkg.registry_type||pkg.registryType||'npm'):remote?'remote':'?';
  const envN=(pkg?.environment_variables||[]).filter(e=>e.required!==false).length+(remote?.headers||[]).filter(h=>h.isRequired!==false).length;
  const isOff=!!(s._meta?.['io.modelcontextprotocol.registry/official']?.status);
  const ghUrl=s.repository?.url||s.websiteUrl||'';
  return \`<div class="card \${ins?'ins':''}">
    <div class="ctop"><div class="cicon">\${type==='npm'?'📦':type==='remote'?'🌐':'🔌'}</div>
      <div><div class="cname">\${esc(name)} \${isOff?'<span class="offb">Official</span>':''}</div>
      <div class="csub">\${esc((s.name||'').split('/')[0]||'')} · <span class="catpill">\${type}</span></div></div>
    </div>
    <div class="cdesc">\${esc(desc)}\${desc.length===130?'…':''}</div>
    \${envN?'<div class="envh">Needs '+envN+' env var'+(envN>1?'s':'')+'</div>':''}
    <div class="cfoot">\${ins
      ?'<div class="ipill">Installed — /'+id+'</div><button class="btn brm" onclick=\\'rmMCP('+escA(JSON.stringify(id))+')\\'> Remove</button>'
      :cfg
        ?'<div></div><button class="btn badd" onclick=\\'openMCPModal('+escA(JSON.stringify(s))+')\\'>Add to Beacon</button>'
        :'<div style="font-size:11px;color:var(--mu)">No install info</div>'+(ghUrl?'<a style="font-size:11px;color:var(--ac);text-decoration:none" href="'+esc(ghUrl)+'" target="_blank">GitHub ↗</a>':'')
    }</div>
  </div>\`;
}
function mcpNext(){ pageIdx++; fetchMCPs(); }
function mcpPrev(){ pageIdx--; fetchMCPs(); }

// ── Actions ────────────────────────────────────────────────────────────────
async function addBWC(type, item){
  const btn = event.target; btn.disabled=true; btn.textContent='Installing…';
  try {
    const r=await fetch('/api/install-'+type,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:item.name,path:item.path})});
    if(!r.ok) throw new Error((await r.json()).error||'failed');
    installed[type+'s'].add(item.name); updateBadge(); renderTab();
    toast('Added '+item.name,'ok');
  } catch(e){ toast('Failed: '+e.message,'err'); btn.disabled=false; btn.textContent='Add to Beacon'; }
}
async function addHook(h){
  const btn=event.target; btn.disabled=true; btn.textContent='Installing…';
  try {
    const r=await fetch('/api/install-hook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:h.name,path:h.path,event:h.event,matcher:h.matcher})});
    if(!r.ok) throw new Error((await r.json()).error||'failed');
    installed.hooks.add(h.name); updateBadge(); renderTab();
    toast('Hook '+h.name+' added to settings.json','ok');
  } catch(e){ toast('Failed: '+e.message,'err'); btn.disabled=false; btn.textContent='Add to Beacon'; }
}
async function addPlugin(p){
  try {
    const r=await fetch('/api/install-plugin',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:p.name})});
    if(!r.ok) throw new Error((await r.json()).error||'failed');
    installed.plugins.add(p.name); updateBadge(); renderTab();
    toast('Plugin '+p.name+' enabled in settings.json','ok');
  } catch(e){ toast('Failed: '+e.message,'err'); }
}
async function rmItem(type, name){
  if(!confirm('Remove '+name+'?')) return;
  await fetch('/api/remove-'+type+'/'+name,{method:'DELETE'});
  installed[type+'s'].delete(name); updateBadge(); renderTab();
  toast('Removed '+name,'err');
}
async function rmMCP(id){
  if(!confirm('Remove '+id+'?')) return;
  await fetch('/api/remove/'+id,{method:'DELETE'});
  installed.mcps.delete(id); updateBadge(); if(cat==='docker') renderDockerMCPs(); else renderMCPGrid();
  toast('Removed '+id,'err');
}
async function rmPlugin(name){
  if(!confirm('Remove '+name+'?')) return;
  await fetch('/api/remove-plugin/'+name,{method:'DELETE'});
  installed.plugins.delete(name); updateBadge(); renderTab();
  toast('Removed '+name,'err');
}
async function addDockerMCP(s){
  const entry={command:s.command,args:s.args};
  const payload={id:s.id,mcpConfig:{mcpServers:{[s.id]:entry}},commandDesc:(s.description||s.displayName||s.id).slice(0,120)};
  const r=await fetch('/api/install',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(r.ok){ installed.mcps.add(s.id); updateBadge(); renderDockerMCPs(); toast('Added — use /'+s.id+' in Claude Code','ok'); }
  else toast('Install failed','err');
}

// ── MCP modal (for servers needing env vars) ───────────────────────────────
function openMCPModal(s){
  const cfg=parseCfg(s); if(!cfg) return;
  const envVars=s.packages?.[0]?.environment_variables||[];
  pending={type:'mcp',s,cfg};
  document.getElementById('mtitle').textContent=s.title||s.name||cfg.id;
  document.getElementById('msub').textContent=cfg.type==='remote'?'Remote server — connects via HTTP/SSE.':envVars.length?'Enter credentials (stored in ~/.claude/mcp-configs/).':'No credentials needed.';
  document.getElementById('mfields').innerHTML=envVars.map(e=>{
    const k=e.name||e, pw=/token|key|secret|password/i.test(k);
    return '<div class="field"><label>'+esc(k)+(e.required!==false?'<span class="req"> *</span>':' (opt)')+'</label>'+
      '<input id="f-'+esc(k)+'" type="'+(pw?'password':'text')+'" placeholder="'+(e.description||k)+'">'+
      (e.description?'<div class="hint">'+esc(e.description)+'</div>':'')+'</div>';
  }).join('');
  document.getElementById('mconfirm').textContent='Add to Beacon';
  document.getElementById('backdrop').classList.add('open');
}
function closeModal(){ document.getElementById('backdrop').classList.remove('open'); pending=null; }
document.getElementById('backdrop').addEventListener('click',e=>{ if(e.target.classList.contains('backdrop')) closeModal(); });
async function doConfirm(){
  if(!pending) return;
  const {s,cfg}=pending;
  const envVars=s.packages?.[0]?.environment_variables||[];
  const env={};
  for(const e of envVars){
    const k=e.name||e, v=document.getElementById('f-'+k)?.value?.trim()||'';
    if(e.required!==false && !v){ toast('Fill required fields','err'); return; }
    if(v) env[k]=v;
  }
  let entry=cfg.type==='remote'?{url:cfg.url,transport:cfg.transport==='sse'?'sse':'http'}:(Object.keys(env).length?{command:cfg.command,args:cfg.args,env}:{command:cfg.command,args:cfg.args});
  const payload={id:cfg.id,mcpConfig:{mcpServers:{[cfg.id]:entry}},commandDesc:(s.description||s.title||cfg.id).slice(0,120)};
  const r=await fetch('/api/install',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(r.ok){ installed.mcps.add(cfg.id); updateBadge(); closeModal(); renderMCPGrid(); toast('Added — use /'+cfg.id+' in Claude Code','ok'); }
  else toast('Install failed','err');
}

// ── Helpers ────────────────────────────────────────────────────────────────
function parseCfg(s){
  const pkg=(s.packages||[]).find(p=>(p.registry_type||p.registryType)==='npm')||(s.packages||[])[0];
  const remote=(s.remotes||[])[0];
  const id=safeId(s.name||s.id||'');
  if(pkg){ const ident=pkg.identifier||pkg.name||''; return {id,type:'stdio',command:'npx',args:['-y',ident]}; }
  if(remote) return {id,type:'remote',url:remote.url,transport:remote.type};
  return null;
}
function safeId(n){ return n.split('/').pop().replace(/[^a-z0-9-]/gi,'-').toLowerCase().slice(0,40); }
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function escA(s){ return String(s).replace(/'/g,'&#39;').replace(/"/g,'&quot;'); }
function toast(msg,type='ok'){ const t=document.getElementById('toast'); t.textContent=msg; t.className='toast '+type+' show'; setTimeout(()=>t.classList.remove('show'),3200); }
</script>
</body>
</html>`;
}

module.exports = { HTML };
