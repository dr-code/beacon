#!/usr/bin/env node
// generate-examples.js
// Adds `examples` field to frontmatter of all agent, skill, command, hook markdown files.
// Uses `claude -p` (Claude Code headless mode) to generate 3 example phrases per component.
// Skips files that already have an `examples` field.
// Usage: node scripts/generate-examples.js [--dry-run]

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 40;
const BASE = path.join(__dirname, '..');

// Directories to scan: [glob pattern, type label]
const SOURCES = [
  { dir: path.join(BASE, 'plugins/all-agents/agents'),    ext: '.md',   type: 'agent',   nameFrom: 'frontmatter' },
  { dir: path.join(BASE, 'plugins/all-hooks/hooks'),      ext: '.md',   type: 'hook',    nameFrom: 'frontmatter' },
  { dir: path.join(BASE, 'plugins/all-commands/commands'),ext: '.md',   type: 'command', nameFrom: 'filename' },
  { dir: path.join(BASE, 'plugins/all-skills/skills'),    ext: null,    type: 'skill',   nameFrom: 'frontmatter', subfile: 'SKILL.md' },
];

// --- Frontmatter helpers ---

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { meta: {}, body: content, raw: '' };
  const raw = match[1];
  const meta = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (m) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return { meta, body: content.slice(match[0].length), raw };
}

function injectExamples(content, examples) {
  // Insert `examples:` block after the last frontmatter field, before closing ---
  const lines = examples.map(e => `  - "${e.replace(/"/g, "'")}"`).join('\n');
  const examplesBlock = `examples:\n${lines}`;
  return content.replace(/^(---\n[\s\S]*?)(^\s*---)/m, (_, fm, close) => {
    // Remove any existing examples field first
    const cleanFm = fm.replace(/^examples:[\s\S]*?(?=^\w|\z)/m, '');
    return `${cleanFm.trimEnd()}\n${examplesBlock}\n${close}`;
  });
}

// --- File collection ---

function collectFiles() {
  const files = [];
  for (const source of SOURCES) {
    if (!fs.existsSync(source.dir)) { console.warn(`Missing: ${source.dir}`); continue; }

    let entries;
    if (source.subfile) {
      // Skills: each entry is a directory containing SKILL.md
      entries = fs.readdirSync(source.dir)
        .map(d => ({ filePath: path.join(source.dir, d, source.subfile), dirName: d }))
        .filter(e => fs.existsSync(e.filePath));
    } else {
      entries = fs.readdirSync(source.dir)
        .filter(f => f.endsWith(source.ext))
        .map(f => ({ filePath: path.join(source.dir, f), dirName: null }));
    }

    for (const entry of entries) {
      const content = fs.readFileSync(entry.filePath, 'utf8');
      const { meta, body } = parseFrontmatter(content);

      // Skip if already has examples
      if (content.match(/^examples:/m)) {
        process.stdout.write('.');
        continue;
      }

      const name = meta.name || path.basename(entry.filePath, '.md');
      const description = meta.description || '';
      if (!description) continue;

      files.push({
        filePath: entry.filePath,
        name,
        type: source.type,
        description,
        event: meta.event || null,
        matcher: meta.matcher || null,
        argumentHint: meta['argument-hint'] || null,
      });
    }
  }
  return files;
}

// --- Claude call ---

function buildPrompt(batch) {
  const typeInstructions = {
    agent: 'Write 3 phrases a user might type to ask Claude to use this agent. Be specific and natural. Start with action verbs like "Use the", "Run the", "Have the", or describe a task that would trigger it.',
    skill: 'Write 3 phrases showing how a user would invoke this skill — include the slash command form (e.g. /skill-name) and 2 natural language prompts.',
    command: 'Write 3 example slash command invocations with realistic arguments (e.g. /command-name <realistic argument>). Include 1 short and 1 detailed example.',
    hook: 'Write 2 phrases describing when this hook fires (e.g. "Fires after every Edit/Write call") and 1 phrase a user might say when setting it up.',
  };

  const items = batch.map((f, i) => {
    const extra = f.event ? ` Event: ${f.event}. Matcher: ${f.matcher}.` : '';
    const hint = f.argumentHint ? ` Argument: ${f.argumentHint}.` : '';
    return `${i + 1}. name="${f.name}" type="${f.type}" description="${f.description}"${extra}${hint}`;
  }).join('\n');

  const instructions = [...new Set(batch.map(f => `${f.type}: ${typeInstructions[f.type]}`))]
    .join('\n');

  return `Generate example usage phrases for Claude Code components. Return ONLY a JSON array, no explanation, no markdown fences.

Instructions by type:
${instructions}

Components:
${items}

Return format — a JSON array with one object per component:
[
  {"name": "component-name", "examples": ["phrase 1", "phrase 2", "phrase 3"]},
  ...
]

IMPORTANT: Return ONLY the JSON array. No text before or after.`;
}

function callClaude(prompt) {
  const escaped = prompt.replace(/'/g, "'\\''");
  const result = execSync(`claude -p '${escaped}'`, {
    encoding: 'utf8',
    timeout: 120000,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  return result.trim();
}

function parseResponse(raw) {
  // Strip any markdown fences if claude added them
  const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  return JSON.parse(cleaned);
}

// --- Main ---

async function main() {
  console.log('Scanning files...');
  const files = collectFiles();
  console.log(`\nFound ${files.length} files needing examples.`);

  if (files.length === 0) {
    console.log('All files already have examples. Done.');
    return;
  }

  if (DRY_RUN) {
    console.log('Dry run — first 3 files:');
    files.slice(0, 3).forEach(f => console.log(` ${f.type}: ${f.name}`));
    return;
  }

  let updated = 0;
  let errors = 0;
  const batches = [];
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    batches.push(files.slice(i, i + BATCH_SIZE));
  }

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    console.log(`\nBatch ${b + 1}/${batches.length} (${batch.length} files)...`);

    let results;
    try {
      const prompt = buildPrompt(batch);
      const raw = callClaude(prompt);
      results = parseResponse(raw);
    } catch (err) {
      console.error(`  Batch ${b + 1} failed: ${err.message}`);
      // Retry once with smaller batch split in half
      try {
        results = [];
        for (let half = 0; half < 2; half++) {
          const sub = batch.slice(half * Math.ceil(batch.length / 2), (half + 1) * Math.ceil(batch.length / 2));
          if (!sub.length) continue;
          const raw2 = callClaude(buildPrompt(sub));
          results.push(...parseResponse(raw2));
        }
      } catch (err2) {
        console.error(`  Retry failed: ${err2.message}`);
        errors += batch.length;
        continue;
      }
    }

    // Build name → examples map
    const map = {};
    for (const r of results) map[r.name] = r.examples;

    // Write back to files
    for (const file of batch) {
      const examples = map[file.name];
      if (!examples || !examples.length) {
        console.warn(`  No examples returned for: ${file.name}`);
        errors++;
        continue;
      }
      const content = fs.readFileSync(file.filePath, 'utf8');
      const updated_content = injectExamples(content, examples);
      fs.writeFileSync(file.filePath, updated_content, 'utf8');
      process.stdout.write(`  + ${file.name}\n`);
      updated++;
    }
  }

  console.log(`\nDone. Updated: ${updated} | Errors: ${errors} | Skipped (already had examples): ${files.length - updated - errors}`);
}

main().catch(err => { console.error(err); process.exit(1); });
