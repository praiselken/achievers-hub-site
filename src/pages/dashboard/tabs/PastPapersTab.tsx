import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface Paper {
  id: string;
  subject: string;
  exam_board: string;
  year: number;
  paper_number: number;
  paper_type: string;
  title: string;
  pdf_url: string | null;
  mark_scheme_url: string | null;
  examiner_url: string | null;
}

interface PaperLog {
  paper_id: string;
  score: number;
  max_score: number;
  logged_at: string;
}

const SUBJECTS = ['All', 'Maths', 'Economics'];
const BOARDS   = ['All', 'AQA', 'Edexcel', 'OCR'];
const YEARS    = ['All', '2024', '2023', '2022', '2021', '2019'];

function ScoreModal({ paper, onClose, onSave }: {
  paper: Paper;
  onClose: () => void;
  onSave: (score: number, max: number, notes: string) => void;
}) {
  const [score, setScore] = useState('');
  const [max, setMax] = useState('80');
  const [notes, setNotes] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
      <div className="bg-white rounded-3xl p-7 w-full max-w-md" style={{ boxShadow: '0 24px 64px rgba(28,28,46,0.18)' }}>
        <h3 className="font-display font-bold text-xl text-gray-900 mb-1">Log your score</h3>
        <p className="font-body text-sm text-gray-500 mb-6">{paper.title}</p>
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="font-body text-xs font-semibold text-gray-600 mb-1 block">Your score</label>
            <input type="number" value={score} onChange={e => setScore(e.target.value)} min="0"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-sm outline-none"
              placeholder="e.g. 64"
              onFocus={e => e.currentTarget.style.borderColor = 'var(--purple)'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
          </div>
          <div className="flex-1">
            <label className="font-body text-xs font-semibold text-gray-600 mb-1 block">Out of</label>
            <input type="number" value={max} onChange={e => setMax(e.target.value)} min="1"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-sm outline-none"
              onFocus={e => e.currentTarget.style.borderColor = 'var(--purple)'}
              onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
          </div>
        </div>
        {score && max && (
          <div className="rounded-xl px-4 py-3 mb-4 text-center"
               style={{ background: 'var(--purple-faint)', border: '1px solid var(--purple-light)' }}>
            <span className="font-display font-bold text-2xl" style={{ color: 'var(--purple-dark)' }}>
              {Math.round((parseInt(score) / parseInt(max)) * 100)}%
            </span>
          </div>
        )}
        <div className="mb-5">
          <label className="font-body text-xs font-semibold text-gray-600 mb-1 block">Notes (optional)</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="What did you find hard? What went well?"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-sm outline-none resize-none"
            onFocus={e => e.currentTarget.style.borderColor = 'var(--purple)'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 font-body font-semibold text-sm text-gray-600">
            Cancel
          </button>
          <button
            onClick={() => { if (score && max) { onSave(parseInt(score), parseInt(max), notes); onClose(); } }}
            disabled={!score || !max}
            className="flex-1 py-3 rounded-xl font-body font-semibold text-sm text-white disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)' }}>
            Save score
          </button>
        </div>
      </div>
    </div>
  );
}

function PaperCard({ paper, log, onLog }: { paper: Paper; log?: PaperLog; onLog: () => void }) {
  const pct = log ? Math.round((log.score / log.max_score) * 100) : null;
  const scoreColor = pct === null ? '' : pct >= 70 ? '#4A8A14' : pct >= 50 ? '#BA7517' : '#D85A30';

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-body font-bold text-gray-900 text-sm">{paper.title}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: paper.paper_type === 'higher' ? '#EAF3DE' : '#EDE0F4',
                           color: paper.paper_type === 'higher' ? '#4A8A14' : '#7A5489' }}>
              {paper.paper_type === 'higher' ? 'Higher' : 'Foundation'}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body text-xs text-gray-400">{paper.exam_board}</span>
            <span className="text-gray-300">·</span>
            <span className="font-body text-xs text-gray-400">{paper.year}</span>
            <span className="text-gray-300">·</span>
            <span className="font-body text-xs text-gray-400">Paper {paper.paper_number}</span>
          </div>
        </div>
        {pct !== null && (
          <div className="text-right flex-shrink-0">
            <div className="font-display font-bold text-xl" style={{ color: scoreColor }}>{pct}%</div>
            <div className="font-body text-[10px] text-gray-400">{log!.score}/{log!.max_score}</div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {paper.pdf_url ? (
          <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer"
             className="flex items-center gap-1.5 font-body text-xs font-semibold px-3 py-1.5 rounded-lg no-underline transition-all"
             style={{ background: 'var(--purple-faint)', color: 'var(--purple-dark)' }}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M8 3v8M4 8l4 4 4-4"/><path d="M3 13h10"/></svg>
            Download paper
          </a>
        ) : (
          <span className="font-body text-xs text-gray-300 px-3 py-1.5 rounded-lg border border-dashed border-gray-200">
            PDF coming soon
          </span>
        )}
        {paper.mark_scheme_url && (
          <a href={paper.mark_scheme_url} target="_blank" rel="noopener noreferrer"
             className="font-body text-xs font-semibold px-3 py-1.5 rounded-lg no-underline"
             style={{ background: '#EAF3DE', color: '#4A8A14' }}>
            Mark scheme
          </a>
        )}
        <button onClick={onLog}
          className="font-body text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
          style={{ borderColor: pct !== null ? 'var(--purple-light)' : '#e5e7eb', color: pct !== null ? 'var(--purple)' : '#6b7280' }}>
          {pct !== null ? 'Update score' : 'Log my score'}
        </button>
      </div>
    </div>
  );
}

export default function PastPapersTab() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [logs, setLogs] = useState<Record<string, PaperLog>>({});
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [boardFilter, setBoardFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [logTarget, setLogTarget] = useState<Paper | null>(null);

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const [papersRes, logsRes] = await Promise.all([
        supabase.from('past_papers').select('*').order('year', { ascending: false }),
        supabase.from('past_paper_logs').select('*').eq('user_id', user.id),
      ]);
      setPapers(papersRes.data ?? []);
      const logMap: Record<string, PaperLog> = {};
      for (const l of logsRes.data ?? []) logMap[l.paper_id] = l;
      setLogs(logMap);
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(paper: Paper, score: number, max: number, notes: string) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const existing = logs[paper.id];
    if (existing) {
      await supabase.from('past_paper_logs').update({ score, max_score: max, notes }).eq('paper_id', paper.id).eq('user_id', user.id);
    } else {
      await supabase.from('past_paper_logs').insert({ user_id: user.id, paper_id: paper.id, score, max_score: max, notes });
    }
    setLogs(prev => ({ ...prev, [paper.id]: { paper_id: paper.id, score, max_score: max, notes, logged_at: new Date().toISOString() } }));
  }

  const filtered = papers.filter(p =>
    (subjectFilter === 'All' || p.subject.toLowerCase() === subjectFilter.toLowerCase()) &&
    (boardFilter   === 'All' || p.exam_board === boardFilter) &&
    (yearFilter    === 'All' || p.year === parseInt(yearFilter))
  );

  const logsCount = Object.keys(logs).length;
  const avgPct = logsCount > 0
    ? Math.round(Object.values(logs).reduce((a, l) => a + (l.score / l.max_score) * 100, 0) / logsCount)
    : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Past Papers</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5">Download, attempt, then log your score to track improvement.</p>
      </div>

      {/* Stats */}
      {logsCount > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Papers logged</div>
            <div className="font-display font-bold text-3xl text-gray-900">{logsCount}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Average score</div>
            <div className="font-display font-bold text-3xl" style={{ color: avgPct && avgPct >= 70 ? '#4A8A14' : 'var(--purple-dark)' }}>
              {avgPct !== null ? `${avgPct}%` : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Subject', opts: SUBJECTS, val: subjectFilter, set: setSubjectFilter },
          { label: 'Board',   opts: BOARDS,   val: boardFilter,   set: setBoardFilter },
          { label: 'Year',    opts: YEARS,    val: yearFilter,    set: setYearFilter },
        ].map(f => (
          <div key={f.label} className="flex items-center gap-1.5">
            <span className="font-body text-xs text-gray-500">{f.label}:</span>
            <select value={f.val} onChange={e => f.set(e.target.value)}
              className="font-body text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1.5 outline-none bg-white"
              style={{ color: 'var(--purple-dark)' }}>
              {f.opts.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Papers */}
      {loading ? (
        <p className="font-body text-sm text-gray-400 text-center py-12">Loading papers…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📄</div>
          <h3 className="font-display font-bold text-gray-900 mb-2">Papers coming soon</h3>
          <p className="font-body text-sm text-gray-500 max-w-sm mx-auto">
            Past papers are being uploaded to the platform. Check back shortly — or adjust the filters above.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(p => (
            <PaperCard key={p.id} paper={p} log={logs[p.id]} onLog={() => setLogTarget(p)} />
          ))}
        </div>
      )}

      {logTarget && (
        <ScoreModal paper={logTarget} onClose={() => setLogTarget(null)}
          onSave={(s, m, n) => handleSave(logTarget, s, m, n)} />
      )}
    </div>
  );
}
