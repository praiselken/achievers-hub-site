/**
 * seed-topics.mjs
 *
 * Reads the 5 GCSE Maths study card Excel files and seeds the topics table.
 *
 * Usage:
 *   node scripts/seed-topics.mjs --dir "/path/to/Study Card folder" --subject maths
 *   node scripts/seed-topics.mjs --dir "/path/to/Economics Study Card folder" --subject economics
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { parseArgs } from 'util';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const SUPABASE_URL     = 'https://tylqvznkuoywcouyiadc.supabase.co';
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY || '';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    dir:     { type: 'string' },
    subject: { type: 'string', default: 'maths' },
    dryrun:  { type: 'boolean', default: false },
  },
});

if (!values.dir) {
  console.error('Usage: node scripts/seed-topics.mjs --dir "/path/to/Study Card folder" --subject maths');
  process.exit(1);
}
if (!SUPABASE_SERVICE) {
  console.error('Set SUPABASE_SERVICE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

// Parse the area from the topic title: "Algebra: collecting like terms" → "Algebra"
function parseArea(title = '') {
  const colon = title.indexOf(':');
  if (colon === -1) return title.trim();
  return title.substring(0, colon).trim();
}

// Parse how-to steps from cell text into a JSON array
function parseSteps(raw = '') {
  if (!raw) return [];
  // Steps are numbered: "1. ...\n2. ...\n3. ..."
  return raw
    .split('\n')
    .map(l => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean);
}

// Parse worked example — extract just the question line
function parseQuestion(raw = '') {
  if (!raw) return '';
  return raw.split('\n')[0].trim();
}

// Extract just the final answer line
function parseFinalAnswer(raw = '') {
  if (!raw) return '';
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  return lines[lines.length - 1] || '';
}

function processWorkbook(filePath, subject) {
  const wb = XLSX.readFile(filePath);

  // Maths files use "Ready-to-Use Card Copy"; economics files use "Study Cards"
  const sheetName =
    wb.SheetNames.find(n => n.toLowerCase().includes('ready')) ||
    wb.SheetNames.find(n => n.toLowerCase() === 'study cards') ||
    wb.SheetNames[1];
  if (!sheetName) { console.warn(`  No sheet found in ${filePath}`); return []; }

  const ws = wb.Sheets[sheetName];
  let rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

  // If first row's keys look like a preamble (no recognised column names), find the real header row
  if (rows.length > 0 && !rows[0]['Topic Title'] && !rows[0]['Topic heading'] && !rows[0]['Topic'] && !rows[0]['Card Title']) {
    const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const headerIdx = raw.findIndex(r =>
      r.some(c => ['Topic Title', 'Topic heading', 'Topic', 'Card Title', 'Card ID'].includes(c))
    );
    if (headerIdx !== -1) {
      const headers = raw[headerIdx];
      rows = raw.slice(headerIdx + 1).map(r => {
        const obj = {};
        headers.forEach((h, i) => { if (h) obj[h] = r[i] ?? ''; });
        return obj;
      });
    }
  }

  const topics = [];
  for (const row of rows) {
    // Support maths column names, economics v1 (Topic Title) and economics v2 (Topic / Card Title)
    const title      = (row['Topic heading'] || row['Topic Title'] || row['Topic title'] || row['Topic'] || row['Card Title'] || '').toString().trim();
    const microSkill = (row['Micro-skill'] || row['Short Student Summary'] || row['Card copy block'] || '').toString().trim();
    const rule       = (row['Student-facing rule'] || '').toString().trim();
    const steps      = parseSteps((row['How-to steps'] || row['Card copy block'] || '').toString());
    const workedEx   = parseQuestion((row['Worked example block'] || row['Worked example'] || '').toString());
    const finalAns   = parseFinalAnswer((row['Worked example block'] || row['Final answer'] || '').toString());
    const realWorld  = (row['Real-world box'] || row['Real-world applications'] || '').toString().trim();
    const proTip     = (row['Pro-tip/checkpoint'] || row['Exam Tip / Mistake Text'] || '').toString().trim();
    const status     = (row['Production'] || row['Production status'] || row['Build Status'] || row['Status'] || '').toString().trim();
    const command    = (row['Command word'] || row['Command'] || '').toString().trim() || null;
    // Economics cards are diagram-based; maths are worked-example based
    const bodyFormat = (row['Body Format'] || row['Recommended Format'] || '').toString().toLowerCase();
    const cardFormat = bodyFormat.includes('diagram') || bodyFormat.includes('graph')
      ? 'diagram'
      : bodyFormat.includes('definition')
      ? 'definition'
      : 'worked_example';
    // Economics files use 'Theme' as the area grouping
    const area       = row['Theme']
      ? row['Theme'].toString().trim()
      : parseArea(title);
    // Economics files encode exam board in spec relevance field
    const examBoard  = row['Exam Board / Spec Relevance']
      ? (row['Exam Board / Spec Relevance'].toString().includes('OCR') ? 'all' : 'AQA')
      : 'AQA';

    if (!title || title.length < 3) continue;
    if (status && !['', 'draft', 'ready', 'complete', 'final', 'design'].some(s => status.toLowerCase().includes(s))) continue;

    topics.push({
      subject,
      exam_board: examBoard,
      area,
      name: title,
      description: microSkill || realWorld,
      key_points: steps.length > 0 ? steps : null,
      exam_tip: proTip || rule,
      practice_q: workedEx,
      practice_a: finalAns,
      command,
      card_format: cardFormat,
      pathway_min: 'numeracy',
    });
  }
  return topics;
}

function collectExcelFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectExcelFiles(full));
    } else if (entry.endsWith('.xlsx') || entry.endsWith('.xls')) {
      results.push(full);
    }
  }
  return results;
}

async function main() {
  const subject = values.subject;
  const dir = values.dir;

  console.log(`\n📂 Reading: ${dir}`);
  console.log(`📚 Subject: ${subject}\n`);

  const files = collectExcelFiles(dir);
  if (files.length === 0) {
    console.error('No Excel files found in that folder (searched recursively).');
    process.exit(1);
  }

  const allTopics = [];
  for (const file of files) {
    console.log(`  Reading ${file.replace(dir + '/', '')}…`);
    const topics = processWorkbook(file, subject);
    console.log(`  → ${topics.length} topics found`);
    allTopics.push(...topics);
  }

  console.log(`\nTotal: ${allTopics.length} topics\n`);

  if (values.dryrun) {
    for (const t of allTopics) {
      console.log(`  [${t.area}] ${t.name}`);
    }
    console.log('\nDry run complete. Remove --dryrun to insert.');
    return;
  }

  let inserted = 0, errors = 0;
  for (const topic of allTopics) {
    const { error } = await supabase
      .from('topics')
      .upsert(topic, { onConflict: 'subject,area,name' });
    if (error) {
      console.error(`  ❌ ${topic.name}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✅ ${topic.name}`);
      inserted++;
    }
  }

  console.log(`\n✅ Done — ${inserted} inserted, ${errors} errors`);
}

main().catch(console.error);
