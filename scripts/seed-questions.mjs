/**
 * seed-questions.mjs
 *
 * Seeds the questions table from Daily 5 Excel files.
 *
 * Usage:
 *   node scripts/seed-questions.mjs --dir "/path/to/Daily 5 Maths" --subject maths
 *   node scripts/seed-questions.mjs --dir "/path/to/Daily 5 Economics" --subject economics
 */

import { createClient } from '@supabase/supabase-js';
import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
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
  console.error('Usage: node scripts/seed-questions.mjs --dir "/path/to/Daily 5 folder" --subject maths');
  process.exit(1);
}
if (!SUPABASE_SERVICE) {
  console.error('Set SUPABASE_SERVICE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

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

// Extract month name from filename
function parseMonth(filePath) {
  const name = basename(filePath);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return months.find(m => name.includes(m)) || 'Unknown';
}

// Extract pathway from file path for maths (folder name like "1. Numeracy")
function parsePathwayMaths(filePath) {
  const map = {
    'numeracy':       'numeracy',
    'foundation plus':'foundation_plus',
    'foundation':     'foundation',
    'higher plus':    'higher_plus',
    'higher':         'higher',
  };
  const lower = filePath.toLowerCase();
  for (const [key, val] of Object.entries(map)) {
    if (lower.includes(key)) return val;
  }
  return 'numeracy';
}

// Extract pathway from file path for economics (Paper 1 / Paper 2)
function parsePathwayEconomics(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.includes('paper 2') || lower.includes('paper_2')) return 'paper_2';
  return 'paper_1';
}

function processMathsWorkbook(filePath) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['All Questions'];
  if (!ws) return [];

  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  const headerIdx = raw.findIndex(r => r.includes('Day') && r.includes('Question'));
  if (headerIdx === -1) return [];

  const headers = raw[headerIdx];
  const rows = raw.slice(headerIdx + 1).map(r => {
    const obj = {};
    headers.forEach((h, i) => { if (h) obj[h] = r[i] ?? ''; });
    return obj;
  }).filter(r => r['Day'] && r['Question']);

  const month    = parseMonth(filePath);
  const pathway  = parsePathwayMaths(filePath);

  return rows.map(row => ({
    subject:         'maths',
    pathway,
    month,
    day:             parseInt(row['Day']) || 0,
    question_number: parseInt(row['Q#']) || 0,
    question_id:     row['QID']?.toString().trim() || null,
    topic_id:        null,
    topic_title:     row['Topic']?.toString().trim() || null,
    question:        row['Question']?.toString().trim(),
    answer:          row['Answer']?.toString().trim() || null,
    marks:           null,
    difficulty:      null,
    skill_type:      null,
    solution_steps:  row['Step-by-step solution']?.toString().trim() || null,
    hints:           row['Helpful hints']?.toString().trim() || null,
    exam_board:      'all',
    calculator:      row['Calculator?']?.toString().trim() || null,
    has_diagram:     row['Needs image/table?']?.toString().toLowerCase().includes('yes') || false,
    diagram_notes:   row['Asset notes']?.toString().trim() || null,
  })).filter(q => q.question && q.day > 0);
}

function processEconomicsWorkbook(filePath) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets['Daily 5 Script'];
  if (!ws) return [];

  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
  const pathway = parsePathwayEconomics(filePath);

  return rows.map(row => ({
    subject:         'economics',
    pathway,
    month:           row['Calendar month']?.toString().trim() || parseMonth(filePath),
    day:             parseInt(row['Day number']) || 0,
    question_number: parseInt(row['Question number']) || 0,
    question_id:     row['Topic ID']?.toString().trim() || null,
    topic_id:        row['Topic ID']?.toString().trim() || null,
    topic_title:     row['Topic title']?.toString().trim() || null,
    question:        row['Question']?.toString().trim(),
    answer:          row['Model answer']?.toString().trim() || null,
    marks:           parseInt(row['Marks available']) || null,
    difficulty:      row['Difficulty']?.toString().trim() || null,
    skill_type:      row['Skill type']?.toString().trim() || null,
    solution_steps:  row['Student-friendly explanation']?.toString().trim() || null,
    hints:           row['Common misconception']?.toString().trim() || null,
    exam_board:      row['Exam board alignment']?.toString().trim() || 'all',
    calculator:      null,
    has_diagram:     !!(row['Q4 source/diagram type'] || row['Expected axes labels']),
    diagram_notes:   row['Diagram model answer description']?.toString().trim() || null,
  })).filter(q => q.question && q.day > 0);
}

async function main() {
  const subject = values.subject;
  const dir = values.dir;

  console.log(`\n📂 Reading: ${dir}`);
  console.log(`📚 Subject: ${subject}\n`);

  const files = collectExcelFiles(dir);
  if (files.length === 0) {
    console.error('No Excel files found.');
    process.exit(1);
  }

  const allQuestions = [];
  for (const file of files) {
    console.log(`  Reading ${file.replace(dir + '/', '')}…`);
    const questions = subject === 'maths'
      ? processMathsWorkbook(file)
      : processEconomicsWorkbook(file);
    console.log(`  → ${questions.length} questions found`);
    allQuestions.push(...questions);
  }

  console.log(`\nTotal: ${allQuestions.length} questions\n`);

  if (values.dryrun) {
    allQuestions.slice(0, 10).forEach(q =>
      console.log(`  [${q.pathway}] ${q.month} Day ${q.day} Q${q.question_number}: ${q.question.slice(0, 60)}…`)
    );
    console.log('\nDry run complete. Remove --dryrun to insert.');
    return;
  }

  let inserted = 0, errors = 0;
  for (const q of allQuestions) {
    const { error } = await supabase
      .from('questions')
      .upsert(q, { onConflict: 'subject,pathway,month,day,question_number' });
    if (error) {
      console.error(`  ❌ ${q.month} Day ${q.day} Q${q.question_number}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✅ ${q.month} Day ${q.day} Q${q.question_number}: ${q.question.slice(0, 50)}`);
      inserted++;
    }
  }

  console.log(`\n✅ Done — ${inserted} inserted, ${errors} errors`);
}

main().catch(console.error);
