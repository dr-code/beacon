#!/usr/bin/env node
// beacon-marketplace — localhost MCP browser for Beacon
// Runs at http://localhost:4747  |  No npm install needed (Node.js built-ins only)

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const PORT        = 4747;
const HOME        = os.homedir();
const CONFIGS_DIR = path.join(HOME, '.claude', 'mcp-configs');
const COMMANDS_DIR= path.join(HOME, '.claude', 'commands');
const PROMPTS_DIR = path.join(HOME, '.claude', 'scoped-prompts');
const MCP_REGISTRY= 'https://registry.modelcontextprotocol.io';

// ── Agent Skills catalog (from mcpservers.org/agent-skills) ─────────────────
const AGENT_SKILLS = [
  { id:'anthropic/frontend-design', author:'Anthropic', name:'Frontend Design', category:'development', emoji:'🎨', description:'Generates distinctive, production-grade frontend interfaces that avoid generic AI aesthetics.', install:'anthropic/frontend-design', official:true },
  { id:'anthropic/docx', author:'Anthropic', name:'Docx', category:'document', emoji:'📄', description:'Comprehensive document creation, editing, and analysis with tracked changes, comments, and formatting.', install:'anthropic/docx', official:true },
  { id:'anthropic/pdf', author:'Anthropic', name:'PDF', category:'document', emoji:'📋', description:'Comprehensive PDF toolkit: extract text, create new PDFs, merge/split documents, fill forms.', install:'anthropic/pdf', official:true },
  { id:'anthropic/pptx', author:'Anthropic', name:'PPTX', category:'document', emoji:'📊', description:'Presentation creation, editing, and analysis for .pptx files with layout and speaker notes support.', install:'anthropic/pptx', official:true },
  { id:'anthropic/xlsx', author:'Anthropic', name:'XLSX', category:'document', emoji:'📈', description:'Spreadsheet creation, editing, and analysis with formulas, formatting, and data visualization.', install:'anthropic/xlsx', official:true },
  { id:'anthropic/algorithmic-art', author:'Anthropic', name:'Algorithmic Art', category:'creative', emoji:'🌀', description:'Create algorithmic art using p5.js with seeded randomness and interactive parameter exploration.', install:'anthropic/algorithmic-art', official:true },
  { id:'anthropic/brand-guidelines', author:'Anthropic', name:'Brand Guidelines', category:'creative', emoji:'🏷️', description:"Applies Anthropic's official brand colors and typography to any artifact.", install:'anthropic/brand-guidelines', official:true },
  { id:'anthropic/canvas-design', author:'Anthropic', name:'Canvas Design', category:'creative', emoji:'🖼️', description:'Create beautiful visual art in .png and .pdf documents using design philosophy.', install:'anthropic/canvas-design', official:true },
  { id:'anthropic/slack-gif-creator', author:'Anthropic', name:'Slack GIF Creator', category:'creative', emoji:'🎞️', description:'Toolkit for creating animated GIFs optimized for Slack with composable animation primitives.', install:'anthropic/slack-gif-creator', official:true },
  { id:'anthropic/theme-factory', author:'Anthropic', name:'Theme Factory', category:'creative', emoji:'🎭', description:'Styling toolkit with 10 pre-set themes for slides, docs, and HTML landing pages.', install:'anthropic/theme-factory', official:true },
  { id:'anthropic/mcp-builder', author:'Anthropic', name:'MCP Builder', category:'development', emoji:'🔧', description:'Guide for creating high-quality MCP servers in Python (FastMCP) or Node/TypeScript.', install:'anthropic/mcp-builder', official:true },
  { id:'microsoft/playwright', author:'Microsoft', name:'Playwright', category:'browser-automation', emoji:'🎭', description:'Automates browser interactions for web testing, form filling, screenshots, and data extraction.', install:'microsoft/playwright', official:true },
  { id:'vercel/agent-browser', author:'Vercel', name:'Agent Browser', category:'browser-automation', emoji:'🌐', description:'Automates browser interactions for web testing, form filling, and data extraction.', install:'vercel/agent-browser', official:true },
  { id:'vercel/react-best-practices', author:'Vercel', name:'React Best Practices', category:'development', emoji:'⚛️', description:'React and Next.js performance optimization guidelines from Vercel Engineering.', install:'vercel/react-best-practices', official:true },
  { id:'vercel/vercel-deploy', author:'Vercel', name:'Vercel Deploy', category:'development', emoji:'▲', description:'Deploy applications and websites to Vercel with a single command. Returns preview URL.', install:'vercel/vercel-deploy', official:true },
  { id:'supabase/postgres-best-practices', author:'Supabase', name:'Postgres Best Practices', category:'database', emoji:'🐘', description:'Postgres performance optimization and best practices from Supabase Engineering.', install:'supabase/postgres-best-practices', official:true },
  { id:'planetscale/mysql', author:'PlanetScale', name:'MySQL', category:'database', emoji:'🐬', description:'Plan and review MySQL/InnoDB schema, indexing, query tuning, and transactions.', install:'planetscale/mysql', official:false },
  { id:'planetscale/postgres', author:'PlanetScale', name:'PostgreSQL', category:'database', emoji:'🐘', description:'PostgreSQL best practices, query optimization, and connection troubleshooting.', install:'planetscale/postgres', official:false },
  { id:'neondatabase/neon-postgres', author:'Neon', name:'Neon Serverless Postgres', category:'database', emoji:'⚡', description:'Guides and best practices for working with Neon Serverless Postgres.', install:'neondatabase/neon-postgres', official:false },
  { id:'softaworks/database-schema-designer', author:'softaworks', name:'Database Schema Designer', category:'database', emoji:'🗃️', description:'Design production-ready database schemas with built-in best practices for SQL and NoSQL.', install:'softaworks/database-schema-designer', official:false },
  { id:'browser-use/browser-use', author:'browser-use', name:'browser-use', category:'browser-automation', emoji:'🤖', description:'Automates browser interactions for web testing, form filling, screenshots, and data extraction.', install:'browser-use/browser-use', official:false },
  { id:'smerchek/markdown-to-epub', author:'smerchek', name:'Markdown to EPUB', category:'document', emoji:'📚', description:'Converts markdown documents and chat summaries into professional EPUB ebook files.', install:'smerchek/markdown-to-epub', official:false },
  { id:'michalparkola/youtube-transcript', author:'michalparkola', name:'YouTube Transcript', category:'media', emoji:'▶️', description:'Download YouTube video transcripts when given a URL or request to get captions.', install:'michalparkola/youtube-transcript', official:false },
  { id:'composiohq/image-enhancer', author:'composiohq', name:'Image Enhancer', category:'media', emoji:'✨', description:'Takes your images and screenshots and makes them sharper, clearer, and more professional.', install:'composiohq/image-enhancer', official:false },
  { id:'composiohq/domain-name-brainstormer', author:'composiohq', name:'Domain Name Brainstormer', category:'productivity', emoji:'🌐', description:'Find the perfect domain name by generating creative options and checking availability.', install:'composiohq/domain-name-brainstormer', official:false },
  { id:'composiohq/file-organizer', author:'composiohq', name:'File Organizer', category:'productivity', emoji:'📁', description:'Personal organization assistant for maintaining clean, logical file structure.', install:'composiohq/file-organizer', official:false },
  { id:'pleaseprompto/notebooklm-skill', author:'pleaseprompto', name:'NotebookLM Skill', category:'productivity', emoji:'📓', description:'Let Claude Code chat directly with NotebookLM for source-grounded answers.', install:'pleaseprompto/notebooklm-skill', official:false },
  { id:'michalparkola/article-extractor', author:'michalparkola', name:'Article Extractor', category:'research', emoji:'📰', description:'Extracts main content from web articles, removing navigation, ads, and clutter.', install:'michalparkola/article-extractor', official:false },
  { id:'composiohq/lead-research-assistant', author:'composiohq', name:'Lead Research Assistant', category:'research', emoji:'🔍', description:'Identify and qualify potential leads by analyzing your product and ideal customer profile.', install:'composiohq/lead-research-assistant', official:false },
  { id:'coffeefuelbump/csv-data-summarizer-claude-skill', author:'coffeefuelbump', name:'CSV Data Summarizer', category:'data-analysis', emoji:'📊', description:'Analyzes CSV files and generates comprehensive insights with visualizations automatically.', install:'coffeefuelbump/csv-data-summarizer-claude-skill', official:false },
  { id:'ramp/vendor-analysis', author:'Ramp', name:'Ramp Vendor Spend Analysis', category:'data-analysis', emoji:'💰', description:'Analyzes vendor spend data from Ramp and exports to connected systems.', install:'ramp/vendor-analysis', official:false },
  { id:'ast-grep/ast-grep', author:'ast-grep', name:'ast-grep', category:'development', emoji:'🌳', description:'Guide for writing ast-grep rules to perform structural code search using AST patterns.', install:'ast-grep/ast-grep', official:false },
  { id:'lackeyjb/playwright-skill', author:'lackeyjb', name:'Playwright Skill', category:'browser-automation', emoji:'🎭', description:'Enables Claude to write and execute any Playwright automation on-the-fly.', install:'lackeyjb/playwright-skill', official:false },
  { id:'conorluddy/ios-simulator-skill', author:'conorluddy', name:'iOS Simulator', category:'development', emoji:'📱', description:'Efficient iOS app building, navigation, and testing using accessibility-first automation.', install:'conorluddy/ios-simulator-skill', official:false },
  { id:'remotion/remotion-best-practices', author:'Remotion', name:'Remotion Best Practices', category:'creative', emoji:'🎬', description:'Best practices for Remotion — video creation in React.', install:'remotion/remotion-best-practices', official:false },
];

const SKILL_CATEGORIES = [
  { id:'all',               label:'All Skills',   emoji:'✦' },
  { id:'development',       label:'Development',  emoji:'⚙️' },
  { id:'document',          label:'Documents',    emoji:'📄' },
  { id:'browser-automation',label:'Browser',      emoji:'🌐' },
  { id:'database',          label:'Database',     emoji:'🗄️' },
  { id:'creative',          label:'Creative',     emoji:'🎨' },
  { id:'media',             label:'Media',        emoji:'🎬' },
  { id:'productivity',      label:'Productivity', emoji:'⚡' },
  { id:'research',          label:'Research',     emoji:'🔍' },
  { id:'data-analysis',     label:'Data Analysis',emoji:'📊' },
];

// ── MCP Clients (from mcpservers.org/clients) ─────────────────────────────────
const CLIENTS = [
  { id:'claude-code',    name:'Claude Code',       emoji:'🤖', desc:'Interactive agentic coding tool from Anthropic with full MCP integration.',                   url:'https://claude.ai/code',          tags:['coding','official'], featured:true },
  { id:'claude-desktop', name:'Claude Desktop',    emoji:'🖥️', desc:"Anthropic's desktop app with comprehensive MCP support for local and remote servers.",         url:'https://claude.ai/download',      tags:['desktop','official'], featured:true },
  { id:'mcp-dock',       name:'MCP Dock',          emoji:'⚓', desc:'macOS app to centralize and sync MCP configs for Claude Code, Codex, Cursor, and more.',       url:'https://apps.apple.com/app/mcp-dock/id6748305262', tags:['macos','desktop'], featured:true },
  { id:'cursor',         name:'Cursor',            emoji:'↗️', desc:'AI code editor with MCP tools in Cursor Composer.',                                            url:'https://cursor.com',              tags:['coding'], featured:true },
  { id:'windsurf',       name:'Windsurf Editor',   emoji:'🏄', desc:'Agentic IDE with AI Flow system and MCP support for collaborative development.',               url:'https://codeium.com/windsurf',    tags:['coding'], featured:true },
  { id:'cline',          name:'Cline',             emoji:'⚡', desc:'Autonomous coding agent in VS Code that edits files, runs commands, and uses MCP servers.',    url:'https://github.com/cline/cline',  tags:['coding','open-source'], featured:true },
  { id:'vscode-copilot', name:'VS Code Copilot',   emoji:'🔵', desc:'VS Code integration with GitHub Copilot featuring comprehensive MCP support.',                url:'https://code.visualstudio.com',   tags:['coding'] },
  { id:'zed',            name:'Zed',               emoji:'⚡', desc:'High-performance code editor with MCP support for prompt templates and tools.',               url:'https://zed.dev',                 tags:['coding'] },
  { id:'warp',           name:'Warp',              emoji:'🚀', desc:'Intelligent terminal with AI and MCP support for natural language commands.',                  url:'https://www.warp.dev',            tags:['terminal'] },
  { id:'continue',       name:'Continue',          emoji:'▶️', desc:'Open-source AI code assistant with built-in support for all MCP features.',                   url:'https://github.com/continuedev/continue', tags:['coding','open-source'] },
  { id:'goose',          name:'Goose',             emoji:'🪿', desc:'Open source AI agent for software development with MCP functionality.',                       url:'https://github.com/block/goose',  tags:['open-source'] },
  { id:'roo-code',       name:'Roo Code',          emoji:'🦘', desc:'AI coding assistance platform with MCP tools and resources integration.',                     url:'https://roocode.com',             tags:['coding'] },
  { id:'jetbrains',      name:'JetBrains AI',      emoji:'🧠', desc:'AI-powered features for all JetBrains IDEs with MCP support.',                               url:'https://plugins.jetbrains.com/plugin/22282-jetbrains-ai-assistant', tags:['coding'] },
  { id:'claude-ai',      name:'Claude.ai',         emoji:'💬', desc:"Anthropic's web-based AI assistant with MCP support for remote servers.",                     url:'https://claude.ai',               tags:['official'] },
  { id:'glama',          name:'Glama',             emoji:'🌟', desc:'Comprehensive AI workspace with integrated MCP Server Directory and multi-LLM support.',      url:'https://glama.ai/chat',           tags:[] },
  { id:'5ire',           name:'5ire',              emoji:'🔥', desc:'Open source cross-platform desktop AI assistant that supports tools through MCP servers.',    url:'https://github.com/nanbingxyz/5ire', tags:['desktop','open-source'] },
  { id:'librechat',      name:'LibreChat',         emoji:'💬', desc:'Open-source, customizable AI chat UI with MCP integration for agent tools.',                  url:'https://github.com/danny-avila/LibreChat', tags:['open-source'] },
  { id:'postman',        name:'Postman',           emoji:'📮', desc:'Popular API client with full MCP server testing and debugging support.',                      url:'https://postman.com/downloads',   tags:[] },
  { id:'witsy',          name:'Witsy',             emoji:'🧙', desc:'AI desktop assistant supporting Anthropic models and MCP servers as LLM tools.',             url:'https://github.com/nbonamy/witsy', tags:['desktop','open-source'] },
  { id:'typingmind',     name:'TypingMind',        emoji:'⌨️', desc:'Advanced frontend for LLMs with MCP tool integration and AI agent support.',                  url:'https://www.typingmind.com',      tags:[] },
  { id:'boltai',         name:'BoltAI',            emoji:'⚡', desc:'Native, all-in-one AI chat client with MCP support for multiple AI providers.',              url:'https://boltai.com',              tags:['desktop','macos'] },
  { id:'amazon-q',       name:'Amazon Q CLI',      emoji:'☁️', desc:'Open-source agentic coding assistant for terminals with full MCP server support.',           url:'https://github.com/aws/amazon-q-developer-cli', tags:['terminal','open-source'] },
  { id:'augment-code',   name:'Augment Code',      emoji:'🔮', desc:'AI-powered coding platform for VS Code and JetBrains with autonomous agents and MCP.',       url:'https://augmentcode.com',         tags:['coding'] },
  { id:'msty',           name:'Msty Studio',       emoji:'🔒', desc:'Privacy-first AI productivity platform integrating local and online LLMs with MCP.',         url:'https://msty.ai',                 tags:['desktop','privacy'] },
  { id:'fast-agent',     name:'fast-agent',        emoji:'🚀', desc:'Python agent framework with full multi-modal MCP support and end-to-end tests.',             url:'https://github.com/evalstate/fast-agent', tags:['framework','open-source'] },
  { id:'mcp-agent',      name:'mcp-agent',         emoji:'🤝', desc:'Simple, composable framework to build agents using Model Context Protocol.',                  url:'https://github.com/lastmile-ai/mcp-agent', tags:['framework','open-source'] },
  { id:'gptme',          name:'gptme',             emoji:'💻', desc:'Open-source terminal-based personal AI assistant with MCP tool support.',                   url:'https://github.com/gptme/gptme',  tags:['terminal','open-source'] },
  { id:'mcphub',         name:'MCPHub',            emoji:'🔌', desc:'Powerful Neovim plugin that integrates MCP servers into your workflow.',                     url:'https://github.com/ravitemer/mcphub.nvim', tags:['coding','open-source'] },
  { id:'sourcegraph',    name:'Sourcegraph Cody',  emoji:'🔍', desc:'AI coding assistant with MCP resource support through OpenCTX integration.',                url:'https://sourcegraph.com/cody',    tags:['coding'] },
  { id:'tome',           name:'Tome',              emoji:'📖', desc:'Open source cross-platform desktop app for working with local LLMs and MCP servers.',        url:'https://github.com/runebookai/tome', tags:['desktop','open-source'] },
];

const CLIENT_CATEGORIES = [
  { id:'all',        label:'All Clients',  emoji:'✦' },
  { id:'coding',     label:'Coding IDEs',  emoji:'💻' },
  { id:'desktop',    label:'Desktop Apps', emoji:'🖥️' },
  { id:'terminal',   label:'Terminal',     emoji:'⬛' },
  { id:'framework',  label:'Frameworks',   emoji:'🔧' },
  { id:'open-source',label:'Open Source',  emoji:'🌍' },
  { id:'official',   label:'Official',     emoji:'🌟' },
];

// ── File helpers ──────────────────────────────────────────────────────────────
function getInstalled() {
  if (!fs.existsSync(CONFIGS_DIR)) return [];
  return fs.readdirSync(CONFIGS_DIR).filter(f=>f.endsWith('.json')).map(f=>f.replace('.json',''));
}
function getInstalledSkills() {
  if (!fs.existsSync(PROMPTS_DIR)) return [];
  return fs.readdirSync(PROMPTS_DIR).filter(f=>f.endsWith('.skill')).map(f=>f.replace('.skill',''));
}
function installMCP({id, mcpConfig, commandDesc, defaultPrompt}) {
  fs.mkdirSync(CONFIGS_DIR,  {recursive:true});
  fs.mkdirSync(COMMANDS_DIR, {recursive:true});
  fs.mkdirSync(PROMPTS_DIR,  {recursive:true});
  fs.writeFileSync(path.join(CONFIGS_DIR,  `${id}.json`), JSON.stringify(mcpConfig, null, 2));
  fs.writeFileSync(path.join(COMMANDS_DIR, `${id}.md`),   `---\ndescription: "${commandDesc}"\nallowed-tools: Bash\n---\n\n!beacon ${id} $ARGUMENTS\n`);
  if (defaultPrompt) fs.writeFileSync(path.join(PROMPTS_DIR, `${id}.txt`), defaultPrompt);
}
function removeMCP(id) {
  [path.join(CONFIGS_DIR,`${id}.json`), path.join(COMMANDS_DIR,`${id}.md`), path.join(PROMPTS_DIR,`${id}.txt`)]
    .forEach(f => { try { fs.unlinkSync(f); } catch {} });
}
function markSkill(id)   { fs.mkdirSync(PROMPTS_DIR,{recursive:true}); fs.writeFileSync(path.join(PROMPTS_DIR,`${id}.skill`),'1'); }
function unmarkSkill(id) { try { fs.unlinkSync(path.join(PROMPTS_DIR,`${id}.skill`)); } catch {} }

// ── Registry proxy ────────────────────────────────────────────────────────────
function proxyRegistry(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {headers:{'Accept':'application/json','User-Agent':'beacon-marketplace/1.0'}}, res => {
      let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try{resolve(JSON.parse(d));}catch(e){reject(e);} });
    });
    req.on('error', reject);
    req.setTimeout(8000, ()=>{ req.destroy(); reject(new Error('Registry timeout')); });
  });
}

// ── HTML ──────────────────────────────────────────────────────────────────────
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Beacon Marketplace</title>
<style>
:root{--bg:#0f1117;--sf:#1a1d27;--sf2:#22263a;--bd:#2e334d;--ac:#6c8fff;--ac2:#a78bfa;--gn:#4ade80;--ye:#fbbf24;--rd:#f87171;--tx:#e2e8f0;--mu:#8892aa;--cd:#0d1117;}
*{box-sizing:border-box;margin:0;padding:0;}
body{background:var(--bg);color:var(--tx);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.6;display:flex;flex-direction:column;height:100vh;overflow:hidden;}
.topbar{background:var(--sf);border-bottom:1px solid var(--bd);padding:0 20px;height:54px;display:flex;align-items:center;gap:14px;flex-shrink:0;}
.logo{font-size:17px;font-weight:800;background:linear-gradient(135deg,#e2e8f0,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.tabs{display:flex;gap:2px;background:var(--sf2);border:1px solid var(--bd);border-radius:8px;padding:3px;}
.tab{padding:5px 14px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:none;color:var(--mu);transition:all .15s;}
.tab.active{background:var(--ac);color:#fff;}
input.search{flex:1;max-width:300px;background:var(--sf2);border:1px solid var(--bd);border-radius:7px;padding:7px 12px;color:var(--tx);font-size:13px;outline:none;}
input.search:focus{border-color:var(--ac);}
input.search::placeholder{color:var(--mu);}
.ibadge{margin-left:auto;background:rgba(74,222,128,.12);border:1px solid rgba(74,222,128,.25);color:var(--gn);padding:3px 8px;border-radius:10px;font-size:11px;font-weight:600;display:none;}
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
.cicon{font-size:22px;width:40px;height:40px;background:var(--sf2);border-radius:9px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.cname{font-size:14px;font-weight:700;color:var(--tx);display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
.offb{font-size:9px;font-weight:700;text-transform:uppercase;background:rgba(108,143,255,.12);color:var(--ac);border:1px solid rgba(108,143,255,.2);padding:1px 5px;border-radius:8px;}
.featb{font-size:9px;font-weight:700;text-transform:uppercase;background:rgba(167,139,250,.12);color:var(--ac2);border:1px solid rgba(167,139,250,.2);padding:1px 5px;border-radius:8px;}
.csub{font-size:11px;color:var(--mu);margin-top:1px;}
.cdesc{font-size:12px;color:var(--mu);line-height:1.5;flex:1;}
.tags{display:flex;flex-wrap:wrap;gap:4px;}
.tag{font-size:10px;padding:2px 6px;border-radius:8px;background:var(--sf2);border:1px solid var(--bd);color:var(--mu);}
.envh{font-size:11px;color:var(--ye);display:flex;align-items:center;gap:4px;}
.envh::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--ye);flex-shrink:0;}
.cfoot{display:flex;align-items:center;justify-content:space-between;margin-top:auto;padding-top:4px;}
.btn{padding:6px 14px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:none;transition:all .12s;}
.badd{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;}
.badd:hover{opacity:.88;}
.brm{background:var(--sf2);color:var(--mu);border:1px solid var(--bd);}
.brm:hover{border-color:var(--rd);color:var(--rd);}
.ipill{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--gn);font-weight:600;}
.ipill::before{content:'';width:5px;height:5px;border-radius:50%;background:var(--gn);}
a.el{font-size:11px;color:var(--ac);text-decoration:none;}
a.el:hover{text-decoration:underline;}
.scenter{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px;color:var(--mu);}
.scenter .icon{font-size:36px;}
.spin{width:24px;height:24px;border:2px solid var(--bd);border-top-color:var(--ac);border-radius:50%;animation:spin .8s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.pager{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:20px;padding:10px;}
.pbtn{padding:6px 14px;border-radius:6px;background:var(--sf);border:1px solid var(--bd);color:var(--tx);font-size:12px;cursor:pointer;}
.pbtn:hover{border-color:var(--ac);color:var(--ac);}
.pbtn:disabled{opacity:.4;cursor:not-allowed;}
.pinfo{font-size:12px;color:var(--mu);}
.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(4px);z-index:50;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s;}
.backdrop.open{opacity:1;pointer-events:all;}
.modal{background:var(--sf);border:1px solid var(--bd);border-radius:13px;width:460px;max-width:90vw;max-height:80vh;overflow-y:auto;padding:24px;}
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
  <div class="tabs">
    <button class="tab active" onclick="switchTab('mcp')">🔌 MCP Servers</button>
    <button class="tab"        onclick="switchTab('skills')">🧠 Agent Skills</button>
    <button class="tab"        onclick="switchTab('clients')">💻 Clients</button>
  </div>
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
      <button class="btn bconfirm" id="mconfirm" onclick="doConfirm()">Install</button>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>

<script>
const SKILLS=${JSON.stringify(AGENT_SKILLS)};
const SCATS=${JSON.stringify(SKILL_CATEGORIES)};
const CLIENTS=${JSON.stringify(CLIENTS)};
const CCATS=${JSON.stringify(CLIENT_CATEGORIES)};

let tab='mcp', cat='all', q='', timer=null;
let mcpData=[], mcpLoading=false, cursors=[null], pageIdx=0, total=0;
let iMCPs=new Set(), iSkills=new Set(), pending=null;

(async()=>{ await loadInstalled(); renderTab(); })();

async function loadInstalled(){
  const [a,b]=await Promise.all([fetch('/api/installed').then(r=>r.json()),fetch('/api/installed-skills').then(r=>r.json())]);
  iMCPs=new Set(a); iSkills=new Set(b); updateBadge();
}
function updateBadge(){
  const n=iMCPs.size+iSkills.size, el=document.getElementById('ibadge');
  el.style.display=n?'':'none'; el.textContent=n+' installed';
}
function switchTab(t){ tab=t; cat='all'; q=''; document.getElementById('search').value='';
  cursors=[null]; pageIdx=0; mcpData=[];
  document.querySelectorAll('.tab').forEach((b,i)=>b.classList.toggle('active',['mcp','skills','clients'][i]===t));
  renderTab();
}
function onSearch(v){ q=v; clearTimeout(timer);
  if(tab==='mcp'){ cursors=[null]; pageIdx=0; timer=setTimeout(fetchMCPs,400); }
  else renderTab();
}
function renderTab(){ if(tab==='mcp')renderMCP(); else if(tab==='skills')renderSkills(); else renderClients(); }

// ── MCP ───────────────────────────────────────────────────────────────────────
function renderMCP(){
  sidebar([{id:'all',label:'All Servers',emoji:'✦'},{id:'npm',label:'npm packages',emoji:'📦'},{id:'remote',label:'Remote / SSE',emoji:'🌐'}],
    cat, c=>{ cat=c; cursors=[null]; pageIdx=0; fetchMCPs(); });
  if(mcpData.length===0 && !mcpLoading) fetchMCPs(); else renderMCPGrid();
}
async function fetchMCPs(){
  mcpLoading=true; renderMCPGrid();
  try {
    const p=new URLSearchParams({limit:24});
    if(q) p.set('search',q);
    if(cursors[pageIdx]) p.set('cursor',cursors[pageIdx]);
    const d=await fetch('/api/registry?'+p).then(r=>r.json());
    mcpData=d.servers||[]; total=d.metadata?.totalCount||0;
    const nc=d.metadata?.nextCursor;
    if(nc && cursors[pageIdx+1]!==nc) cursors[pageIdx+1]=nc;
  } catch(e){ mcpData=[]; }
  mcpLoading=false; renderMCPGrid();
}
function renderMCPGrid(){
  const m=document.getElementById('main');
  if(mcpLoading){ m.innerHTML='<div class="scenter"><div class="spin"></div><div>Fetching from registry.modelcontextprotocol.io…</div></div>'; return; }
  if(!mcpData.length){ m.innerHTML='<div class="scenter"><div class="icon">🔦</div><div>No servers found</div></div>'; return; }
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
  const ins=iMCPs.has(id);
  const name=(s.title||s.name||id).split('/').pop();
  const desc=(s.description||'').slice(0,130);
  const pkg=(s.packages||[])[0], remote=(s.remotes||[])[0];
  const type=pkg?(pkg.registry_type||pkg.registryType||'npm'):remote?'remote':'?';
  const envN=(pkg?.environment_variables||[]).filter(e=>e.required!==false).length;
  const isOff=s._meta?.['io.modelcontextprotocol.registry/official']===true;
  const ghUrl=s.source_code_url||s.homepage||'';
  return \`<div class="card \${ins?'ins':''}">
    <div class="ctop">
      <div class="cicon">\${type==='npm'?'📦':type==='remote'?'🌐':'🔌'}</div>
      <div><div class="cname">\${esc(name)} \${isOff?'<span class="offb">Official</span>':''}</div>
      <div class="csub">\${esc((s.name||'').split('/')[0]||'')} · <span class="tag">\${type}</span></div></div>
    </div>
    <div class="cdesc">\${esc(desc)}\${desc.length===130?'…':''}</div>
    \${envN?'<div class="envh">Needs '+envN+' env var'+(envN>1?'s':'')+'</div>':''}
    <div class="cfoot">
      \${ins
        ?'<div class="ipill">Installed — /'+id+'</div><button class="btn brm" onclick="rmMCP(\''+id+'\')">Remove</button>'
        :cfg
          ?'<div></div><button class="btn badd" onclick=\'openMCPModal('+escA(JSON.stringify(s))+')\'> Add to Beacon</button>'
          :'<div style="font-size:11px;color:var(--mu)">No install info</div>'+(ghUrl?'<a class="el" href="'+esc(ghUrl)+'" target="_blank">GitHub ↗</a>':'')
      }
    </div>
  </div>\`;
}
function mcpNext(){ pageIdx++; fetchMCPs(); }
function mcpPrev(){ pageIdx--; fetchMCPs(); }

// ── Skills ────────────────────────────────────────────────────────────────────
function renderSkills(){
  const cats=SCATS.map(c=>({...c,count:c.id==='all'?SKILLS.length:SKILLS.filter(s=>s.category===c.id).length}));
  sidebar(cats, cat, c=>{ cat=c; renderSkills(); });
  const filtered=SKILLS.filter(s=>{
    const catOk=cat==='all'||s.category===cat;
    const qOk=!q||s.name.toLowerCase().includes(q.toLowerCase())||s.description.toLowerCase().includes(q.toLowerCase());
    return catOk&&qOk;
  });
  document.getElementById('main').innerHTML=\`
    <div class="ghdr"><h2>Agent Skills</h2><div class="gmeta"><span class="rbadge">mcpservers.org/agent-skills</span><span>\${filtered.length} skills</span></div></div>
    <div class="grid">\${filtered.map(s=>{
      const key=s.id.replace(/\\//g,'__'), ins=iSkills.has(key);
      return '<div class="card '+(ins?'ins':'')+'"><div class="ctop"><div class="cicon">'+s.emoji+'</div><div><div class="cname">'+esc(s.name)+' '+(s.official?'<span class="offb">Official</span>':'')+
        '</div><div class="csub">by '+esc(s.author)+'</div></div></div><div class="cdesc">'+esc(s.description)+'</div>'+
        '<div class="cfoot">'+(ins
          ?'<div class="ipill">Installed</div><button class="btn brm" onclick="rmSkill(\''+s.id+'\')">Remove</button>'
          :'<div></div><button class="btn badd" onclick=\'openSkillModal('+escA(JSON.stringify(s))+')\'> Add to Beacon</button>'
        )+'</div></div>';
    }).join('')}</div>\`;
}

// ── Clients ───────────────────────────────────────────────────────────────────
function renderClients(){
  const cats=CCATS.map(c=>({...c,count:c.id==='all'?CLIENTS.length:CLIENTS.filter(cl=>cl.tags.includes(c.id)).length}));
  sidebar(cats, cat, c=>{ cat=c; renderClients(); });
  const filtered=CLIENTS.filter(cl=>{
    const catOk=cat==='all'||cl.tags.includes(cat);
    const qOk=!q||cl.name.toLowerCase().includes(q.toLowerCase())||cl.desc.toLowerCase().includes(q.toLowerCase());
    return catOk&&qOk;
  });
  document.getElementById('main').innerHTML=\`
    <div class="ghdr"><h2>MCP Clients</h2><div class="gmeta"><span class="rbadge">mcpservers.org/clients</span><span>\${filtered.length} clients</span></div></div>
    <div class="grid">\${filtered.map(cl=>\`<div class="card \${cl.featured?'ins':''}">
      <div class="ctop"><div class="cicon">\${cl.emoji}</div>
        <div><div class="cname">\${esc(cl.name)} \${cl.featured?'<span class="featb">Featured</span>':''}</div></div>
      </div>
      <div class="cdesc">\${esc(cl.desc)}</div>
      <div class="tags">\${cl.tags.map(t=>'<span class="tag">'+t+'</span>').join('')}</div>
      <a class="el" href="\${esc(cl.url)}" target="_blank">Visit site ↗</a>
    </div>\`).join('')}\`;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function sidebar(cats, active, fn){
  document.getElementById('sidebar').innerHTML='<span class="slabel">Categories</span>'+
    cats.map(c=>\`<button class="catbtn \${active===c.id?'act':''}" onclick="(\${fn.toString()})('\${c.id}')">
      <span class="ce">\${c.emoji||'•'}</span>\${c.label}\${c.count!=null?'<span class="cc">'+c.count+'</span>':''}
    </button>\`).join('');
}

// ── Modals ────────────────────────────────────────────────────────────────────
function openMCPModal(s){
  const cfg=parseCfg(s); if(!cfg) return;
  const envVars=s.packages?.[0]?.environment_variables||[];
  pending={type:'mcp',s,cfg};
  document.getElementById('mtitle').textContent=s.title||s.name||cfg.id;
  document.getElementById('msub').textContent=cfg.type==='remote'
    ?'Remote server — connects via '+(cfg.transport||'HTTP')+'. No local install needed.'
    :envVars.length?'Enter credentials. Stored in ~/.claude/mcp-configs/.':'No credentials needed.';
  document.getElementById('mfields').innerHTML=envVars.map(e=>{
    const k=e.name||e, pw=/token|key|secret|password/i.test(k);
    return '<div class="field"><label>'+esc(k)+(e.required!==false?'<span class="req"> *</span>':' (opt)')+'</label>'+
      '<input id="f-'+esc(k)+'" type="'+(pw?'password':'text')+'" placeholder="'+(e.description||k)+'">'+
      (e.description?'<div class="hint">'+esc(e.description)+'</div>':'')+'</div>';
  }).join('');
  document.getElementById('mconfirm').textContent='Add to Beacon';
  document.getElementById('backdrop').classList.add('open');
}
function openSkillModal(s){
  pending={type:'skill',s};
  document.getElementById('mtitle').textContent=s.emoji+' '+s.name;
  document.getElementById('msub').textContent='by '+s.author+' — installed via Claude Code CLI';
  document.getElementById('mfields').innerHTML=
    '<p style="font-size:12px;color:var(--mu);margin-bottom:8px">Run this command in your terminal:</p>'+
    '<div class="mcode">claude plugin marketplace add '+esc(s.install)+'</div>'+
    '<p style="font-size:12px;color:var(--mu)">Click "Mark Installed" after running it.</p>';
  document.getElementById('mconfirm').textContent='Mark Installed';
  document.getElementById('backdrop').classList.add('open');
}
function closeModal(){ document.getElementById('backdrop').classList.remove('open'); pending=null; }
document.getElementById('backdrop').addEventListener('click',e=>{ if(e.target.classList.contains('backdrop')) closeModal(); });

async function doConfirm(){
  if(!pending) return;
  if(pending.type==='skill'){
    const key=pending.s.id.replace(/\\//g,'__');
    await fetch('/api/mark-skill',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:key})});
    iSkills.add(key); updateBadge(); closeModal(); renderTab();
    toast('✓ '+pending.s.name+' marked installed','ok'); return;
  }
  // MCP
  const {s,cfg}=pending;
  const envVars=s.packages?.[0]?.environment_variables||[];
  const env={};
  for(const e of envVars){
    const k=e.name||e, v=document.getElementById('f-'+k)?.value?.trim()||'';
    if(e.required!==false && !v){ toast('Fill required fields','err'); return; }
    if(v) env[k]=v;
  }
  let entry=cfg.type==='remote'
    ?{url:cfg.url,transport:cfg.transport==='sse'?'sse':'http'}
    :(Object.keys(env).length?{command:cfg.command,args:cfg.args,env}:{command:cfg.command,args:cfg.args});
  const payload={id:cfg.id,mcpConfig:{mcpServers:{[cfg.id]:entry}},
    commandDesc:(s.description||s.title||cfg.id).slice(0,120),
    defaultPrompt:'You have access to '+(s.title||cfg.id)+'. '+(s.description||'')};
  const r=await fetch('/api/install',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(r.ok){ iMCPs.add(cfg.id); updateBadge(); closeModal(); renderMCPGrid(); toast('✓ Added — use /'+cfg.id+' in Claude Code','ok'); }
  else toast('Install failed','err');
}

async function rmMCP(id){
  if(!confirm('Remove '+id+'?')) return;
  await fetch('/api/remove/'+id,{method:'DELETE'});
  iMCPs.delete(id); updateBadge(); renderMCPGrid(); toast('Removed '+id,'err');
}
async function rmSkill(id){
  const key=id.replace(/\\//g,'__');
  await fetch('/api/remove-skill/'+key,{method:'DELETE'});
  iSkills.delete(key); updateBadge(); renderTab(); toast('Removed skill','err');
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Server ────────────────────────────────────────────────────────────────────
http.createServer(async (req,res)=>{
  const url=req.url||'/', method=req.method||'GET';
  const j=d=>res.end(JSON.stringify(d));
  const jh=()=>res.writeHead(200,{'Content-Type':'application/json'});

  if(method==='GET'&&url==='/'){res.writeHead(200,{'Content-Type':'text/html'});res.end(HTML);return;}
  if(method==='GET'&&url==='/api/installed'){jh();j(getInstalled());return;}
  if(method==='GET'&&url==='/api/installed-skills'){jh();j(getInstalledSkills());return;}

  if(method==='GET'&&url.startsWith('/api/registry')){
    try{
      const qs=new URL('http://x'+url).searchParams;
      const p=new URLSearchParams({limit:qs.get('limit')||'24'});
      if(qs.get('search')) p.set('search',qs.get('search'));
      if(qs.get('cursor')) p.set('cursor',qs.get('cursor'));
      const data=await proxyRegistry(MCP_REGISTRY+'/v0/servers?'+p);
      jh();j(data);
    }catch(e){res.writeHead(502,{'Content-Type':'application/json'});j({error:e.message,servers:[]});}
    return;
  }

  if(method==='POST'&&url==='/api/install'){
    let b=''; req.on('data',c=>b+=c);
    req.on('end',()=>{ try{installMCP(JSON.parse(b));jh();j({ok:true});}catch(e){res.writeHead(500,{'Content-Type':'application/json'});j({error:e.message});} });
    return;
  }
  if(method==='POST'&&url==='/api/mark-skill'){
    let b=''; req.on('data',c=>b+=c);
    req.on('end',()=>{ try{const{id}=JSON.parse(b);markSkill(id);jh();j({ok:true});}catch(e){res.writeHead(500,{'Content-Type':'application/json'});j({error:e.message});} });
    return;
  }
  if(method==='DELETE'&&url.startsWith('/api/remove/')&&!url.includes('skill')){
    removeMCP(url.replace('/api/remove/','').replace(/[^a-z0-9-_]/gi,''));jh();j({ok:true});return;
  }
  if(method==='DELETE'&&url.startsWith('/api/remove-skill/')){
    unmarkSkill(url.replace('/api/remove-skill/','').replace(/[^a-z0-9_-]/gi,''));jh();j({ok:true});return;
  }
  res.writeHead(404);res.end('Not found');
}).listen(PORT,'127.0.0.1',()=>{
  const u=`http://localhost:${PORT}`;
  console.log('\n  ▸ Beacon Marketplace\n  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  ${u}\n`);
  console.log('  🔌 MCP Servers  — live from registry.modelcontextprotocol.io');
  console.log('  🧠 Agent Skills — curated from mcpservers.org/agent-skills');
  console.log('  💻 Clients      — curated from mcpservers.org/clients');
  console.log('\n  Ctrl+C to stop.\n');
  require('child_process').exec(`open ${u}`);
});
