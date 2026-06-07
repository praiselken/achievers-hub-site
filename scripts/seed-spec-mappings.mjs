/**
 * seed-spec-mappings.mjs
 *
 * Seeds the spec_mappings table from Spec Tracker and Topic Code Excel files.
 *
 * Usage:
 *   node scripts/seed-spec-mappings.mjs --subject maths
 *   node scripts/seed-spec-mappings.mjs --subject economics
 */

import { createClient } from '@supabase/supabase-js';
import { parseArgs } from 'util';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const SUPABASE_URL     = 'https://tylqvznkuoywcouyiadc.supabase.co';
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY || '';

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    subject: { type: 'string', default: 'maths' },
    dryrun:  { type: 'boolean', default: false },
  },
});

if (!SUPABASE_SERVICE) {
  console.error('Set SUPABASE_SERVICE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

function parseBool(val) {
  if (!val) return false;
  return ['yes', 'true', '1', 'y'].includes(val.toString().toLowerCase().trim());
}

function processMaths() {
  const mappings = [];

  // Spec Tracker — one row per topic, three boards per row
  const wb1 = XLSX.readFile('/Users/praiselken/Downloads/Spec Tracker Maths/GCSE Maths Topic Mapping.xlsx');
  const rows1 = XLSX.utils.sheet_to_json(wb1.Sheets['Topic Mapping'], { defval: '' });

  for (const row of rows1) {
    const base = {
      subject:    'maths',
      topic_id:   row['Topic ID']?.toString().trim() || null,
      topic_name: row['Website Topic Title']?.toString().trim() || '',
      strand:     row['Website Strand']?.toString().trim() || null,
      tier:       row['Overall Tier']?.toString().trim() || null,
      calculation_required: false,
      graph_required:       false,
      evaluation_required:  false,
      common_mistake:       null,
      skill_gap_tags:       null,
    };
    if (!base.topic_name) continue;

    for (const board of ['AQA', 'Edexcel', 'OCR']) {
      const ref  = row[`${board} Reference`]?.toString().trim();
      const desc = row[`${board} Description`]?.toString().trim();
      if (!ref && !desc) continue;
      mappings.push({
        ...base,
        exam_board:        board,
        board_reference:   ref || null,
        board_section:     row[`${board} Strand`]?.toString().trim() || null,
        board_description: desc || null,
      });
    }
  }

  // Topic Codes — enrich with AH codes
  const wb2 = XLSX.readFile('/Users/praiselken/Downloads/Topic List Maths/Achievers hub GCSE Maths Topic Codes.xlsx');
  const raw2 = XLSX.utils.sheet_to_json(wb2.Sheets['Topic Codes'], { header: 1, defval: '' });
  const hIdx = raw2.findIndex(r => r.includes('Full Code') || r.includes('Short Code'));
  if (hIdx !== -1) {
    const headers = raw2[hIdx];
    const codeRows = raw2.slice(hIdx + 1).map(r => {
      const obj = {};
      headers.forEach((h, i) => { if (h) obj[h] = r[i] ?? ''; });
      return obj;
    }).filter(r => r['Full Topic Name']);

    for (const row of codeRows) {
      mappings.push({
        subject:          'maths',
        topic_id:         row['Full Code']?.toString().trim() || null,
        topic_name:       row['Full Topic Name']?.toString().trim() || '',
        strand:           row['Strand']?.toString().trim() || null,
        tier:             row['Tier']?.toString().trim() || null,
        exam_board:       'all',
        board_reference:  row['Short Code']?.toString().trim() || null,
        board_section:    null,
        board_description: null,
        calculation_required: false,
        graph_required:       false,
        evaluation_required:  false,
        common_mistake:       null,
        skill_gap_tags:       null,
      });
    }
  }

  return mappings;
}

function processEconomics() {
  const mappings = [];

  // Spec Tracker — Topic Mapping sheet
  const wb1 = XLSX.readFile('/Users/praiselken/Downloads/Spec Tracker Economics/GCSE Economics Topic Mapping.xlsx');
  const rows1 = XLSX.utils.sheet_to_json(wb1.Sheets['Topic Mapping'], { defval: '' });

  for (const row of rows1) {
    const base = {
      subject:             'economics',
      topic_id:            row['Topic ID']?.toString().trim() || null,
      topic_name:          row['Student-Facing Topic Title']?.toString().trim() || '',
      strand:              row['Strand']?.toString().trim() || null,
      tier:                null,
      calculation_required: parseBool(row['Calculation Required?']),
      graph_required:       parseBool(row['Graph Required?']),
      evaluation_required:  parseBool(row['Evaluation Required?']),
      common_mistake:       row['Common Student Mistake']?.toString().trim() || null,
      skill_gap_tags:       row['Diagnostic Skill Gap Tags']?.toString().trim() || null,
    };
    if (!base.topic_name) continue;

    for (const board of ['AQA', 'OCR']) {
      const ref  = row[`${board} Section`]?.toString().trim();
      const desc = row[`${board} Detailed Description`]?.toString().trim();
      if (!ref && !desc) continue;
      mappings.push({
        ...base,
        exam_board:        board,
        board_reference:   ref || null,
        board_section:     row[`${board} Paper`]?.toString().trim() || null,
        board_description: desc || null,
      });
    }
  }

  // Topic Codes — Master Topic Bank
  const wb2 = XLSX.readFile('/Users/praiselken/Downloads/Topic List Economics/Achievers hub GCSE Economics Topic Codes.xlsx');
  const rows2 = XLSX.utils.sheet_to_json(wb2.Sheets['Master Topic Bank'], { defval: '' });

  for (const row of rows2) {
    const topic_name = row['Student-Facing Topic Title']?.toString().trim() || '';
    if (!topic_name) continue;

    for (const board of ['AQA', 'OCR']) {
      const ref  = row[`${board} Section`]?.toString().trim();
      const title = row[`${board} Topic Title`]?.toString().trim();
      if (!ref && !title) continue;
      mappings.push({
        subject:             'economics',
        topic_id:            row['Topic ID']?.toString().trim() || null,
        topic_name,
        strand:              row['Strand']?.toString().trim() || null,
        tier:                null,
        exam_board:          board,
        board_reference:     ref || null,
        board_section:       row[`${board} Paper`]?.toString().trim() || null,
        board_description:   title || null,
        calculation_required: parseBool(row['Calculation Required?']),
        graph_required:       parseBool(row['Graph Required?']),
        evaluation_required:  parseBool(row['Evaluation Required?']),
        common_mistake:       row['Common Student Mistake']?.toString().trim() || null,
        skill_gap_tags:       row['Diagnostic Skill Gap Tags']?.toString().trim() || null,
      });
    }
  }

  return mappings;
}

async function main() {
  const subject = values.subject;
  console.log(`\n📚 Subject: ${subject}\n`);

  const mappings = subject === 'maths' ? processMaths() : processEconomics();
  console.log(`Total: ${mappings.length} spec mappings\n`);

  if (values.dryrun) {
    mappings.slice(0, 10).forEach(m =>
      console.log(`  [${m.exam_board}] ${m.topic_name} — ${m.board_reference || ''}`)
    );
    console.log('\nDry run complete. Remove --dryrun to insert.');
    return;
  }

  let inserted = 0, errors = 0;
  for (const m of mappings) {
    const { error } = await supabase.from('spec_mappings').insert(m);
    if (error) {
      console.error(`  ❌ ${m.topic_name} (${m.exam_board}): ${error.message}`);
      errors++;
    } else {
      console.log(`  ✅ [${m.exam_board}] ${m.topic_name}`);
      inserted++;
    }
  }

  console.log(`\n✅ Done — ${inserted} inserted, ${errors} errors`);
}

main().catch(console.error);
