/**
 * seed-question-bank.mjs
 *
 * Seeds the question_bank table from the client's topic-organised spreadsheets.
 *
 *   node scripts/seed-question-bank.mjs --dir "$HOME/Downloads/Question Bank" --subject maths
 *
 * Structure it expects, taken from the folder and file names:
 *
 *   Question Bank/
 *     Algebra/                       → topic_area
 *       Inequalities (one sign).xlsx → topic
 *     Number 2/
 *       ...
 *
 * WHY THIS IS SO DEFENSIVE
 * The 903 maths files were written over several months and agree on very
 * little. There are 30 different sheet-name layouts, 50 different column
 * layouts, and the header row is not always the first row. Reading any of that
 * by a fixed name or position silently yields nothing — which is exactly how
 * the Daily 5 seeder lost a fifth of its bank before anyone noticed. So every
 * lookup here is by alias, case-insensitively, and the script refuses to write
 * if a file yields no questions rather than skipping it quietly.
 */

import { createClient } from '@supabase/supabase-js';
import { readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
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
  console.error('Usage: node scripts/seed-question-bank.mjs --dir "/path/to/Question Bank" --subject maths');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE) {
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY (service_role) for the target project.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

// ── Reading sheets that don't agree on anything ─────────────────────────────

/** Sheet names seen across the bank, in the order we should prefer them. */
const SHEET_NAMES = [
  'Question Bank',
  'Diagnostic Question Bank',
  'Diagnostic Sheet',
  'Question Sheet',
  'Diagnostic Questions',
];

/** Compare headings ignoring case, punctuation and dash flavour — the files use
 *  "Estimated GCSE Grade (1-9)" and "(1–9)" interchangeably. */
const norm = s => String(s ?? '')
  .toLowerCase()
  .replace(/[‐-―]/g, '-')   // en/em dashes → hyphen
  .replace(/[?]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

function findSheet(wb) {
  const named = SHEET_NAMES.find(n => wb.SheetNames.includes(n));
  return named ?? wb.SheetNames[0];
}

/** The header row is row 1 in 857 files and rows 2–5 in the rest, where a title
 *  sits above it. Find it by content rather than trusting position. */
function findHeaderRow(rows) {
  const limit = Math.min(rows.length, 12);
  for (let i = 0; i < limit; i++) {
    const cells = rows[i].map(norm);
    if (cells.includes('question') && cells.includes('answer')) return i;
  }
  return -1;
}

function makeReader(header) {
  const index = new Map();
  header.forEach((h, i) => {
    const key = norm(h);
    if (key && !index.has(key)) index.set(key, i);
  });
  return (row, ...aliases) => {
    for (const alias of aliases) {
      const i = index.get(norm(alias));
      if (i === undefined) continue;
      const value = String(row[i] ?? '').trim();
      if (value) return value;
    }
    return null;
  };
}

// ── Turning cells into columns ──────────────────────────────────────────────

function parseCalculator(raw) {
  if (!raw) return null;
  const v = norm(raw);
  // A few rows have build notes or stray values in this column, from a
  // misaligned paste. Anything unrecognised becomes null rather than a guess.
  if (v.includes('either') || v.includes('non-calculator / calculator')) return 'either';
  if (v.startsWith('non-calculator') || v.startsWith('non calculator')) return 'non_calculator';
  if (v.startsWith('calculator')) return 'calculator';
  return null;
}

/** "5" → 5. "8/9" and "2-3" have no single answer, so they keep their label
 *  and leave the numeric column null rather than silently picking one. */
function parseGrade(raw) {
  if (!raw) return { grade: null, label: null };
  const text = String(raw).trim();
  if (/^[1-9]$/.test(text)) return { grade: Number(text), label: text };
  return { grade: null, label: text };
}

const parseFlag = raw => !!raw && /^(y|yes|true|1)/i.test(String(raw).trim());

function parseTags(raw) {
  if (!raw) return null;
  const tags = String(raw).split(/[;,]/).map(t => t.trim()).filter(Boolean);
  return tags.length ? tags : null;
}

// ── Walking the folders ─────────────────────────────────────────────────────

function collectFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('~$') || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...collectFiles(full));
    else if (/\.xlsx?$/i.test(entry)) out.push(full);
  }
  return out;
}

function readWorkbook(filePath, rootDir, subject) {
  const wb = XLSX.readFile(filePath);
  const sheetName = findSheet(wb);
  const sheet = wb.Sheets[sheetName];
  if (!sheet) return { rows: [], reason: 'no readable sheet' };

  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  const headerIdx = findHeaderRow(raw);
  if (headerIdx === -1) return { rows: [], reason: `no header row in "${sheetName}"` };

  const cell = makeReader(raw[headerIdx]);

  // topic_area is the first folder below the root; topic is the file name.
  const relative = filePath.slice(rootDir.length + 1);
  const topicArea = relative.split('/')[0];
  const topic = basename(filePath, extname(filePath));

  const rows = [];
  let ordinal = 0;
  for (const row of raw.slice(headerIdx + 1)) {
    const question = cell(row, 'Question');
    if (!question) continue;
    ordinal += 1;

    const { grade, label } = parseGrade(cell(row, 'Estimated GCSE Grade (1-9)', 'Estimated GCSE Grade', 'GCSE Grade'));

    rows.push({
      subject,
      topic_area:      topicArea,
      topic,
      ordinal,
      source_ref:      cell(row, 'Question ID', 'QID'),
      question,
      answer:          cell(row, 'Answer'),
      skill:           cell(row, 'Topic', 'Skill'),
      aqa_code:        cell(row, 'AQA Syllabus Code', 'AQA Spec Code', 'AQA Code'),
      edexcel_code:    cell(row, 'Edexcel Syllabus Code', 'Edexcel Spec Code', 'Edexcel Code'),
      ocr_code:        cell(row, 'OCR Syllabus Code', 'OCR Spec Code', 'OCR Code'),
      calculator:      parseCalculator(cell(row, 'Calculator or Non-Calculator', 'Calculator')),
      solution_steps:  cell(row, 'Step-by-Step Solution', 'Step by Step Solution', 'Solution'),
      hint:            cell(row, 'Helpful Hint', 'Helpful Hints', 'Hint'),
      skill_tags:      parseTags(cell(row, 'Diagnostic Skill Gap Tag', 'Diagnostic Skill Gap Tags')),
      question_type:   cell(row, 'Question Type'),
      difficulty:      cell(row, 'Difficulty'),
      estimated_grade: grade,
      grade_label:     label,
      needs_image:     parseFlag(cell(row, 'Image Needed?', 'Image Needed')),
      needs_table:     parseFlag(cell(row, 'Table Needed?', 'Table Needed')),
      asset_ref:       cell(row, 'Asset Reference', 'Asset Ref'),
      asset_notes:     cell(row, 'Assets Needed / Build Notes', 'Assets Needed', 'Build Notes'),
    });
  }

  return { rows, reason: rows.length ? null : `no question rows under "${sheetName}"` };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const dir = values.dir.replace(/\/+$/, '');
  const subject = values.subject;

  console.log(`\n📂 Reading: ${dir}`);
  console.log(`📚 Subject: ${subject}\n`);

  const files = collectFiles(dir);
  if (!files.length) {
    console.error('No spreadsheets found.');
    process.exit(1);
  }
  console.log(`  ${files.length} spreadsheets\n`);

  const all = [];
  const empty = [];
  for (const file of files) {
    const { rows, reason } = readWorkbook(file, dir, subject);
    if (!rows.length) empty.push([file.slice(dir.length + 1), reason]);
    all.push(...rows);
  }

  // A file that yields nothing is the signature of a layout we don't handle.
  // Say so loudly: silence here is how content goes missing.
  if (empty.length) {
    console.error(`❌ ${empty.length} of ${files.length} files produced no questions:`);
    for (const [name, reason] of empty.slice(0, 15)) console.error(`     ${name} — ${reason}`);
    if (empty.length > 15) console.error(`     …and ${empty.length - 15} more`);
    console.error(`   Fix the reader before seeding; a skipped file is invisible once loaded.`);
    process.exit(1);
  }

  // The unique key is (subject, topic_area, topic, ordinal). Two files with the
  // same name in the same folder would collide and overwrite each other.
  const seen = new Set();
  const clashes = [];
  for (const r of all) {
    const key = `${r.subject} | ${r.topic_area} | ${r.topic} | ${r.ordinal}`;
    if (seen.has(key)) clashes.push(key); else seen.add(key);
  }
  if (clashes.length) {
    console.error(`❌ ${clashes.length} rows share a key and would overwrite each other:`);
    for (const k of [...new Set(clashes)].slice(0, 8)) console.error(`     ${k}`);
    process.exit(1);
  }

  const areas = [...new Set(all.map(r => r.topic_area))].sort();
  const graded = all.filter(r => r.estimated_grade !== null).length;
  console.log(`Total: ${all.length} questions across ${areas.length} topic areas`);
  console.log(`  with a numeric GCSE grade: ${graded}`);
  console.log(`  needing an image or table: ${all.filter(r => r.needs_image || r.needs_table).length}\n`);
  for (const a of areas) console.log(`  ${a.padEnd(30)} ${all.filter(r => r.topic_area === a).length}`);

  if (values.dryrun) {
    console.log('\nFirst few:');
    for (const r of all.slice(0, 5)) {
      console.log(`  [${r.topic_area}/${r.topic}] #${r.ordinal} (grade ${r.estimated_grade ?? '—'}): ${r.question.slice(0, 60)}…`);
    }
    console.log('\nDry run complete. Remove --dryrun to insert.');
    return;
  }

  // Batched: 29k single-row upserts would take an hour and hammer the API.
  const BATCH = 500;
  let written = 0, failed = 0;
  for (let i = 0; i < all.length; i += BATCH) {
    const chunk = all.slice(i, i + BATCH);
    const { error } = await supabase
      .from('question_bank')
      .upsert(chunk, { onConflict: 'subject,topic_area,topic,ordinal' });
    if (error) {
      console.error(`  ❌ rows ${i}–${i + chunk.length}: ${error.message}`);
      failed += chunk.length;
    } else {
      written += chunk.length;
      process.stdout.write(`\r  written ${written}/${all.length}`);
    }
  }
  console.log(`\n\n✅ Done — ${written} written, ${failed} failed`);
}

main().catch(err => { console.error(err); process.exit(1); });
