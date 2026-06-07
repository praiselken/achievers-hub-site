import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useSubject } from '../DashboardLayout';

type Status = 'not_started' | 'in_progress' | 'covered';

interface Topic {
  id: string;
  subject: string;
  area: string;
  name: string;
  description: string | null;
  key_points: string[] | null;
  exam_tip: string | null;
  practice_q: string | null;
  practice_a: string | null;
  video_url: string | null;
  command: string | null;
  card_format: string;
  pathway_min: string;
  status: Status;
  score_avg: number;
  attempts: number;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string }> = {
  not_started: { label: 'Not started', color: '#9ca3af', bg: '#f9fafb',  border: '#e5e7eb' },
  in_progress: { label: 'In progress', color: '#BA7517', bg: '#FAEEDA',  border: '#F0C88A' },
  covered:     { label: 'Covered',     color: '#4A8A14', bg: '#EAF3DE',  border: '#C8E49A' },
};

function PracticeQuestion({ q, a }: { q: string; a: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50">
        <p className="font-body text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Practice question</p>
        <p className="font-body text-sm text-gray-800">{q}</p>
      </div>
      {show ? (
        <div className="px-4 py-3" style={{ background: '#EAF3DE' }}>
          <p className="font-body text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#4A8A14' }}>Model answer</p>
          <p className="font-body text-sm" style={{ color: '#3B6D11' }}>{a}</p>
        </div>
      ) : (
        <button onClick={() => setShow(true)}
          className="w-full px-4 py-2.5 font-body text-sm font-semibold text-left hover:bg-gray-50 transition-colors"
          style={{ color: 'var(--purple)' }}>
          Show model answer →
        </button>
      )}
    </div>
  );
}

function StudyCard({ topic, onMark }: { topic: Topic; onMark: (id: string, s: Status) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[topic.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all"
         style={{ boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>

      {/* Card header — always visible */}
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-body font-bold text-gray-900 text-sm">{topic.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-gray-400">{topic.area}</span>
            {topic.command && (
              <>
                <span className="text-gray-200">·</span>
                <span className="font-body text-xs font-semibold" style={{ color: 'var(--purple)' }}>{topic.command}</span>
              </>
            )}
          </div>
        </div>
        {topic.attempts > 0 && (
          <span className="font-mono text-xs font-bold text-gray-400 flex-shrink-0">{Math.round(topic.score_avg)}%</span>
        )}
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
             className="w-4 h-4 text-gray-300 flex-shrink-0 transition-transform"
             style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M5 8l5 5 5-5"/>
        </svg>
      </button>

      {/* Expanded study card content */}
      {open && (
        <div className="border-t border-gray-50">

          {/* Description / rule */}
          {topic.description && (
            <div className="px-5 pt-4 pb-2">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                {topic.card_format === 'definition' ? 'Definition' : 'The rule'}
              </p>
              <p className="font-body text-sm text-gray-700 leading-relaxed">{topic.description}</p>
            </div>
          )}

          {/* Key points / steps */}
          {topic.key_points && topic.key_points.length > 0 && (
            <div className="px-5 py-3">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                {topic.card_format === 'worked_example' ? 'How to do it' : 'Key points'}
              </p>
              <ol className="flex flex-col gap-2">
                {topic.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                          style={{ background: 'var(--purple)' }}>{i + 1}</span>
                    <span className="font-body text-sm text-gray-700">{pt}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Exam tip */}
          {topic.exam_tip && (
            <div className="mx-5 my-3 rounded-xl px-4 py-3"
                 style={{ background: 'var(--purple-faint)', border: '1px solid var(--purple-light)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">💡</span>
                <p className="font-body text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--purple)' }}>
                  Exam tip
                </p>
              </div>
              <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--purple-dark)' }}>{topic.exam_tip}</p>
            </div>
          )}

          {/* Practice question */}
          {topic.practice_q && (
            <div className="px-5 py-3">
              <PracticeQuestion q={topic.practice_q} a={topic.practice_a ?? ''} />
            </div>
          )}

          {/* Video */}
          {topic.video_url && (
            <div className="px-5 pb-4">
              <a href={topic.video_url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 font-body text-sm font-semibold no-underline"
                 style={{ color: 'var(--purple)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--purple-faint)' }}>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" style={{ color: 'var(--purple)' }}>
                    <path d="M4 3.5l9 4.5-9 4.5V3.5z"/>
                  </svg>
                </span>
                Watch video explanation
              </a>
            </div>
          )}

          {/* Mark as */}
          <div className="px-5 py-4 border-t border-gray-50 flex items-center gap-2 flex-wrap">
            <span className="font-body text-xs text-gray-400">Mark as:</span>
            {(['not_started', 'in_progress', 'covered'] as Status[]).map(s => (
              <button key={s} onClick={() => onMark(topic.id, s)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all border"
                style={topic.status === s
                  ? { background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color, borderColor: STATUS_CONFIG[s].border }
                  : { borderColor: '#e5e7eb', color: '#9ca3af', background: 'transparent' }}>
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopicHubTab() {
  const { subject } = useSubject();
  const [search, setSearch]   = useState('');
  const [topics, setTopics]   = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<Status | 'all'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [topicsRes, progressRes] = await Promise.all([
        supabase.from('topics').select('*').eq('subject', subject).order('area').order('name'),
        supabase.from('topic_progress').select('*').eq('user_id', user.id),
      ]);

      const progMap: Record<string, { status: Status; score_avg: number; attempts: number }> = {};
      for (const p of progressRes.data ?? []) {
        progMap[p.topic_id] = { status: p.status, score_avg: p.score_avg, attempts: p.attempts };
      }

      setTopics((topicsRes.data ?? []).map(t => ({
        ...t,
        status:    progMap[t.id]?.status    ?? 'not_started',
        score_avg: progMap[t.id]?.score_avg ?? 0,
        attempts:  progMap[t.id]?.attempts  ?? 0,
      })));
      setLoading(false);
    }
    load();
  }, [subject]);

  async function handleMark(topicId: string, status: Status) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('topic_progress')
      .upsert({ user_id: user.id, topic_id: topicId, status }, { onConflict: 'user_id,topic_id' });
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, status } : t));
  }

  const filtered = topics.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.area.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const covered = topics.filter(t => t.status === 'covered').length;
  const areas = [...new Set(filtered.map(t => t.area))];

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Topic Hub</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5 capitalize">
          {subject} · {covered}/{topics.length} topics covered
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4"
           style={{ boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>
        <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all"
               style={{ width: `${topics.length ? (covered / topics.length) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, var(--purple-light), var(--purple))' }} />
        </div>
        <span className="font-body text-sm font-bold flex-shrink-0" style={{ color: 'var(--purple-dark)' }}>
          {topics.length ? Math.round((covered / topics.length) * 100) : 0}%
        </span>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
               className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="9" cy="9" r="6"/><path d="M15 15l-3-3"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search topics…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 font-body text-sm bg-white outline-none"
            onFocus={e => e.currentTarget.style.borderColor = 'var(--purple)'}
            onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'} />
        </div>
        <div className="flex gap-1.5">
          {(['all', 'not_started', 'in_progress', 'covered'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl font-body text-xs font-semibold transition-all capitalize whitespace-nowrap"
              style={filter === f
                ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }
                : { background: 'white', color: '#9ca3af', border: '1.5px solid #e5e7eb' }}>
              {f === 'all' ? 'All' : f === 'not_started' ? 'Not started' : f === 'in_progress' ? 'In progress' : 'Covered'}
            </button>
          ))}
        </div>
      </div>

      {/* Topics by area */}
      {loading ? (
        <p className="font-body text-sm text-gray-400 text-center py-12">Loading topics…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-body text-sm text-gray-500">No topics match your search.</p>
        </div>
      ) : (
        areas.map(area => {
          const areaTopics = filtered.filter(t => t.area === area);
          if (!areaTopics.length) return null;
          const areaCovered = areaTopics.filter(t => t.status === 'covered').length;
          return (
            <div key={area}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-body font-bold text-sm text-gray-500 uppercase tracking-wider">{area}</h2>
                <span className="font-body text-xs text-gray-400">{areaCovered}/{areaTopics.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {areaTopics.map(t => (
                  <StudyCard key={t.id} topic={t} onMark={handleMark} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
