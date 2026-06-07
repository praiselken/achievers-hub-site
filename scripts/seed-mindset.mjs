/**
 * seed-mindset.mjs
 * Seeds mindset_prompts table from Think, Speak & Grow.xlsx
 */

import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const SUPABASE_URL     = 'https://tylqvznkuoywcouyiadc.supabase.co';
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY || '';

if (!SUPABASE_SERVICE) { console.error('Set SUPABASE_SERVICE_KEY env var'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const THEMES = {
  January:   'New Beginnings & Excellence',
  February:  'Discipline & Consistency',
  March:     'Understanding & Strategy',
  April:     'Confidence & Courage',
  May:       'Endurance & Performance',
  June:      'Progress & Ownership',
  July:      'Identity & Vision',
  August:    'Readiness & Transition',
  September: 'Fresh Start & Focus',
  October:   'Diligence & Depth',
  November:  'Gratitude & Consistency',
  December:  'Reflection & Renewal',
};

const wb = XLSX.readFile('/Users/praiselken/Downloads/Think, Speak & Grow.xlsx');
const prompts = [];

for (const month of MONTHS) {
  const ws = wb.Sheets[month];
  if (!ws) continue;

  const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  // Find the header row (contains 'Day')
  const hIdx = raw.findIndex(r => r[0] === 'Day');
  if (hIdx === -1) continue;

  const dataRows = raw.slice(hIdx + 1);
  for (const row of dataRows) {
    const day       = parseInt(row[0]);
    const confession = row[1]?.toString().trim();
    const reflection = row[2]?.toString().trim();
    if (!day || !confession) continue;
    prompts.push({ month, month_theme: THEMES[month], day, confession, reflection: reflection || null });
  }
}

console.log(`\nTotal: ${prompts.length} prompts\n`);

let inserted = 0, errors = 0;
for (const p of prompts) {
  const { error } = await supabase
    .from('mindset_prompts')
    .upsert(p, { onConflict: 'month,day' });
  if (error) {
    console.error(`  ❌ ${p.month} Day ${p.day}: ${error.message}`);
    errors++;
  } else {
    console.log(`  ✅ ${p.month} Day ${p.day}: ${p.confession.slice(0, 60)}…`);
    inserted++;
  }
}

console.log(`\n✅ Done — ${inserted} inserted, ${errors} errors`);
