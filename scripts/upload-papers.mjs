/**
 * upload-papers.mjs
 *
 * Walks a local folder of past papers, uploads each PDF to Supabase Storage,
 * and inserts a record into the past_papers table.
 *
 * Usage:
 *   node scripts/upload-papers.mjs --dir "/path/to/Maths/Past Papers" --subject maths
 *   node scripts/upload-papers.mjs --dir "/path/to/Economics/Past Papers" --subject economics
 *
 * Expected Drive folder structure (after download + unzip):
 *   Past Papers/
 *     AQA Maths/
 *       2024/
 *         June/
 *           Paper 1 (Higher)/
 *             2024 June Paper 1 Higher Non-Calculator - Question Paper.pdf
 *             2024 June Paper 1 Higher Non-Calculator - Mark Scheme.pdf
 *             2024 June Paper 1 Higher Non-Calculator - Examiners Report.pdf
 *           Paper 1 (Foundation)/
 *             ...
 *         November/
 *           ...
 *       2023/
 *         ...
 *     Edexcel Maths/
 *       ...
 *     OCR Maths/
 *       ...
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import { parseArgs } from 'util';

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL     = process.env.VITE_SUPABASE_URL     || 'https://tylqvznkuoywcouyiadc.supabase.co';
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY  || '';  // needs service_role key for storage uploads
const BUCKET           = 'past-papers';

// ── Parse args ────────────────────────────────────────────────────────────────
const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    dir:     { type: 'string' },
    subject: { type: 'string', default: 'maths' },
    dryrun:  { type: 'boolean', default: false },
  },
});

if (!values.dir) {
  console.error('Usage: node scripts/upload-papers.mjs --dir "/path/to/Past Papers" --subject maths');
  process.exit(1);
}

if (!SUPABASE_SERVICE) {
  console.error('Set SUPABASE_SERVICE_KEY env var (service_role key from Supabase → Settings → API)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

// ── Helpers ───────────────────────────────────────────────────────────────────
function walkDir(dir) {
  const results = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full));
    } else if (extname(name).toLowerCase() === '.pdf') {
      results.push(full);
    }
  }
  return results;
}

function parsePaperPath(filePath, baseDir, subject) {
  // Normalise path relative to base
  const rel = filePath.replace(baseDir, '').replace(/^[\\/]/, '');
  const parts = rel.split(/[\\/]/);

  // Expected: [board folder, year, sitting, paper+tier folder, filename.pdf]
  // e.g.    : ["AQA Maths", "2024", "June", "Paper 1 (Higher)", "2024 June...pdf"]
  if (parts.length < 5) return null;

  const [boardFolder, yearStr, sitting, paperFolder, filename] = parts;

  // Board
  const boardMap = { aqa: 'AQA', edexcel: 'Edexcel', ocr: 'OCR' };
  const boardKey = Object.keys(boardMap).find(k => boardFolder.toLowerCase().includes(k));
  const exam_board = boardMap[boardKey] ?? boardFolder;

  const year = parseInt(yearStr);
  if (isNaN(year)) return null;

  // Paper number
  const paperMatch = paperFolder.match(/paper\s*(\d)/i);
  const paper_number = paperMatch ? parseInt(paperMatch[1]) : 1;

  // Tier
  const paper_type = /higher/i.test(paperFolder) ? 'higher' : 'foundation';

  // File type
  let fileType = 'question';
  if (/mark.?scheme/i.test(filename))  fileType = 'mark_scheme';
  if (/examin/i.test(filename))         fileType = 'examiner';

  // Storage path
  const storagePath = `${subject}/${exam_board.toLowerCase()}/${year}/${sitting.toLowerCase()}/paper-${paper_number}-${paper_type}-${fileType}.pdf`;

  // Human title
  const title = `${exam_board} ${subject.charAt(0).toUpperCase() + subject.slice(1)} ${year} ${sitting} — Paper ${paper_number} ${paper_type.charAt(0).toUpperCase() + paper_type.slice(1)}`;

  return { exam_board, year, sitting: sitting.toLowerCase(), paper_number, paper_type, title, fileType, storagePath };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const subject = values.subject;
  const baseDir = values.dir;
  console.log(`\n📂 Scanning: ${baseDir}`);
  console.log(`📚 Subject:  ${subject}\n`);

  const allPdfs = walkDir(baseDir);
  console.log(`Found ${allPdfs.length} PDFs\n`);

  // Group by paper (question + mark scheme + examiner share a DB row)
  const papers = {}; // key = storagePath without fileType suffix

  for (const filePath of allPdfs) {
    const meta = parsePaperPath(filePath, baseDir, subject);
    if (!meta) { console.warn(`⚠️  Could not parse: ${filePath}`); continue; }

    const key = `${meta.exam_board}|${meta.year}|${meta.sitting}|${meta.paper_number}|${meta.paper_type}`;
    if (!papers[key]) {
      papers[key] = {
        subject,
        exam_board: meta.exam_board,
        year: meta.year,
        paper_number: meta.paper_number,
        paper_type: meta.paper_type,
        title: meta.title,
        pdf_url: null,
        mark_scheme_url: null,
        examiner_url: null,
        files: [],
      };
    }
    papers[key].files.push({ filePath, fileType: meta.fileType, storagePath: meta.storagePath });
  }

  console.log(`Identified ${Object.keys(papers).length} unique papers\n`);
  if (values.dryrun) {
    for (const [k, p] of Object.entries(papers)) {
      console.log(`  ${p.title}`);
      for (const f of p.files) console.log(`    [${f.fileType}] → ${f.storagePath}`);
    }
    console.log('\nDry run complete. Remove --dryrun to upload.');
    return;
  }

  let uploaded = 0, skipped = 0, errors = 0;

  for (const [, paper] of Object.entries(papers)) {
    for (const { filePath, fileType, storagePath } of paper.files) {
      process.stdout.write(`  Uploading ${storagePath} … `);
      try {
        const fileBuffer = readFileSync(filePath);
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, fileBuffer, { contentType: 'application/pdf', upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

        if (fileType === 'question')    paper.pdf_url          = publicUrl;
        if (fileType === 'mark_scheme') paper.mark_scheme_url  = publicUrl;
        if (fileType === 'examiner')    paper.examiner_url     = publicUrl;

        console.log('✅');
        uploaded++;
      } catch (err) {
        console.log(`❌ ${err.message}`);
        errors++;
      }
    }

    // Insert/upsert DB record
    const { error: dbErr } = await supabase.from('past_papers').upsert({
      subject: paper.subject,
      exam_board: paper.exam_board,
      year: paper.year,
      paper_number: paper.paper_number,
      paper_type: paper.paper_type,
      title: paper.title,
      pdf_url: paper.pdf_url,
      mark_scheme_url: paper.mark_scheme_url,
      examiner_url: paper.examiner_url,
    }, { onConflict: 'subject,exam_board,year,paper_number,paper_type' });

    if (dbErr) console.error(`  DB error for ${paper.title}: ${dbErr.message}`);
    else console.log(`  📝 DB record saved: ${paper.title}`);
  }

  console.log(`\n✅ Done — ${uploaded} uploaded, ${skipped} skipped, ${errors} errors`);
}

main().catch(console.error);
