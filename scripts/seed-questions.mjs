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

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
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
if (!SUPABASE_URL || !SUPABASE_SERVICE) {
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY (service_role) for the target project.');
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

// ── Reading cells the spreadsheets don't agree on ───────────────────────────
//
// The client's workbooks were built at different times and the column headings
// drifted. Across the sixty maths files there are four different layouts: most
// say "Q#", but five say "Question Number" or "Question No", and the casing of
// "Step-by-step solution" and "Helpful hints" moves around too. Reading a
// column by one exact name means a renamed heading silently yields nothing.
//
// Look a cell up by any of its known spellings, case- and space-insensitively.
function cellReader(row) {
  const normal = {};
  for (const key of Object.keys(row)) {
    normal[key.toLowerCase().replace(/\s+/g, ' ').trim()] = row[key];
  }
  return (...aliases) => {
    for (const alias of aliases) {
      const value = normal[alias.toLowerCase().replace(/\s+/g, ' ').trim()];
      if (value !== undefined && value !== null && value !== '') return value;
    }
    return undefined;
  };
}

// Day and question numbers arrive as 3, "3" or "Q3" depending on the file.
// parseInt("Q3") is NaN, which used to become 0 — and because 0 is a valid
// value for the unique key, all five of a day's questions collapsed onto one
// row and four were lost without an error. Strip to digits instead.
function parseIndex(value) {
  if (value === undefined || value === null) return 0;
  const digits = String(value).replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
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

  return rows.map(row => {
    const cell = cellReader(row);
    const text = (...aliases) => cell(...aliases)?.toString().trim() || null;
    return {
      subject:         'maths',
      pathway,
      month,
      day:             parseIndex(cell('Day')),
      question_number: parseIndex(cell('Q#', 'Question Number', 'Question No')),
      question_id:     text('QID'),
      topic_id:        null,
      topic_title:     text('Topic'),
      question:        text('Question'),
      answer:          text('Answer'),
      marks:           null,
      difficulty:      null,
      skill_type:      null,
      solution_steps:  text('Step-by-step solution'),
      hints:           text('Helpful hints', 'Helpful Hint'),
      exam_board:      'all',
      calculator:      text('Calculator?', 'Calculator or Non-calculator'),
      has_diagram:     !!cell('Needs image/table?', 'Image/Table Needed?', 'Asset Needed?',
                                'Relevant image/table needed?')?.toString().toLowerCase().includes('yes'),
      diagram_notes:   text('Asset notes', 'Assets Needed', 'Asset brief', 'Asset ID'),
    };
  }).filter(q => q.question && q.day > 0);
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
    // September to December write these as "Q1"…"Q5" rather than 1…5.
    day:             parseIndex(row['Day number']),
    question_number: parseIndex(row['Question number']),
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

  // The failure this guards against lost a fifth of the question bank on the
  // first run and reported "0 errors" while doing it. Two questions sharing a
  // unique key don't collide — the upsert quietly overwrites one with the
  // other — so nothing surfaces unless we look for it here. Refuse to write.
  const slot = (q, n = q.question_number) =>
    [q.subject, q.pathway, q.month, q.day, n].join(' | ');

  // A question number that wouldn't parse is a bug in this script, not in the
  // client's data — every such row lands on number 0 and a whole day collapses
  // to one question. Stop, rather than write a quarter of the day away.
  const unnumbered = allQuestions.filter(q => q.question_number === 0).length;
  if (unnumbered) {
    console.error(`❌ Refusing to write: ${unnumbered} questions have no readable question number.`);
    console.error(`   Check the question-number column's heading in the source files — the`);
    console.error(`   layouts are not consistent, and an unrecognised one reads as nothing.`);
    process.exit(1);
  }

  // A repeated number, by contrast, is a content error: Higher Plus June days 7
  // and 9 each carry two Q4s and no Q5. Both questions are real, so dropping
  // one loses content and keeping both is impossible. Move the later one into
  // the day's first free slot and report it, so the client can confirm what the
  // numbering was meant to be.
  const taken = new Set();
  const renumbered = [];
  for (const q of allQuestions) {
    if (taken.has(slot(q))) {
      let n = 1;
      while (taken.has(slot(q, n))) n++;
      renumbered.push(`${q.month} day ${q.day} (${q.pathway}): Q${q.question_number} → Q${n}  ${q.question.slice(0, 48)}…`);
      q.question_number = n;
    }
    taken.add(slot(q));
  }

  if (renumbered.length) {
    console.warn(`⚠️  ${renumbered.length} question(s) had a number already used that day, and were moved:`);
    for (const line of renumbered) console.warn(`     ${line}`);
    console.warn(`   Nothing was lost, but the source numbering needs the client's eye.\n`);
  }

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
