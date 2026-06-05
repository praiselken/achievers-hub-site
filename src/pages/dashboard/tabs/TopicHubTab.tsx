import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { MATHS_TOPICS, ECONOMICS_TOPICS, type SpecTopic, type Subject } from '../../../constants/specTopics';

type Status = 'not_started' | 'in_progress' | 'covered';

interface TopicWithProgress extends SpecTopic {
  status: Status;
  score_avg: number;
  attempts: number;
  key_points?: string[];
  exam_tip?: string;
  practice_q?: string;
  practice_a?: string;
  video_url?: string;
}

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  not_started: { label: 'Not started', color: '#9ca3af', bg: '#f9fafb' },
  in_progress: { label: 'In progress', color: '#BA7517', bg: '#FAEEDA' },
  covered:     { label: 'Covered',     color: '#4A8A14', bg: '#EAF3DE' },
};

function TopicCard({ topic, onMark }: { topic: TopicWithProgress; onMark: (id: string, status: Status) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[topic.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all"
         style={{ boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-body font-bold text-gray-900 text-sm">{topic.name}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
          </div>
          <span className="font-body text-xs text-gray-400">{topic.area}</span>
        </div>
        {topic.attempts > 0 && (
          <span className="font-mono text-xs font-bold text-gray-500 flex-shrink-0">
            {Math.round(topic.score_avg)}%
          </span>
        )}
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
             className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform"
             style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M5 8l5 5 5-5"/>
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-gray-50 pt-4">
          {topic.description && (
            <p className="font-body text-sm text-gray-600 leading-relaxed mb-4">{topic.description}</p>
          )}

          {topic.key_points && Array.isArray(topic.key_points) && topic.key_points.length > 0 && (
            <div className="mb-4">
              <p className="font-body text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Key points</p>
              <ul className="flex flex-col gap-1.5">
                {(topic.key_points as string[]).map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 font-body text-sm text-gray-700">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">•</span>{pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {topic.exam_tip && (
            <div className="rounded-xl px-4 py-3 mb-4" style={{ background: 'var(--purple-faint)', border: '1px solid var(--purple-light)' }}>
              <p className="font-body text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--purple)' }}>Exam tip</p>
              <p className="font-body text-sm" style={{ color: 'var(--purple-dark)' }}>{topic.exam_tip}</p>
            </div>
          )}

          {topic.practice_q && (
            <PracticeQuestion q={topic.practice_q} a={topic.practice_a ?? ''} />
          )}

          {topic.video_url && (
            <a href={topic.video_url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-2 font-body text-sm font-semibold no-underline mt-3"
               style={{ color: 'var(--purple)' }}>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M4 4l12 6-12 6V4z"/></svg>
              Watch video explanation
            </a>
          )}

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <span className="font-body text-xs text-gray-500">Mark as:</span>
            {(['not_started', 'in_progress', 'covered'] as Status[]).map(s => (
              <button key={s} onClick={() => onMark(topic.id, s)}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-all border"
                style={topic.status === s
                  ? { background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color, borderColor: STATUS_CONFIG[s].color }
                  : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PracticeQuestion({ q, a }: { q: string; a: string }) {
  const [showAnswer, setShowAnswer] = useState(false);
  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50">
        <p className="font-body text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Practice question</p>
        <p className="font-body text-sm text-gray-800">{q}</p>
      </div>
      {showAnswer ? (
        <div className="px-4 py-3" style={{ background: '#EAF3DE' }}>
          <p className="font-body text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#4A8A14' }}>Model answer</p>
          <p className="font-body text-sm" style={{ color: '#3B6D11' }}>{a}</p>
        </div>
      ) : (
        <button onClick={() => setShowAnswer(true)}
          className="w-full px-4 py-2.5 font-body text-sm font-semibold text-left transition-colors hover:bg-gray-50"
          style={{ color: 'var(--purple)' }}>
          Show model answer →
        </button>
      )}
    </div>
  );
}

export default function TopicHubTab() {
  const [subject, setSubject] = useState<Subject>('maths');
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState<Record<string, { status: Status; score_avg: number; attempts: number }>>({});
  const [loading, setLoading] = useState(true);
  const [dbTopics, setDbTopics] = useState<Record<string, Partial<SpecTopic>>>({});

  const rawTopics = subject === 'maths' ? MATHS_TOPICS : ECONOMICS_TOPICS;

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [progressRes, topicsRes] = await Promise.all([
        supabase.from('topic_progress').select('*').eq('user_id', user.id),
        supabase.from('topics').select('*').eq('subject', subject),
      ]);

      const prog: Record<string, { status: Status; score_avg: number; attempts: number }> = {};
      for (const p of progressRes.data ?? []) {
        prog[p.topic_id] = { status: p.status, score_avg: p.score_avg, attempts: p.attempts };
      }
      setProgress(prog);

      const db: Record<string, Partial<SpecTopic>> = {};
      for (const t of topicsRes.data ?? []) {
        db[t.id] = t;
      }
      setDbTopics(db);
      setLoading(false);
    }
    load();
  }, [subject]);

  async function handleMark(topicId: string, status: Status) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('topic_progress').upsert({ user_id: user.id, topic_id: topicId, status }, { onConflict: 'user_id,topic_id' });
    setProgress(prev => ({ ...prev, [topicId]: { ...prev[topicId], status } }));
  }

  const topics: TopicWithProgress[] = rawTopics
    .filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.area.toLowerCase().includes(search.toLowerCase()))
    .map(t => ({
      ...t,
      ...(dbTopics[t.id] ?? {}),
      status: progress[t.id]?.status ?? 'not_started',
      score_avg: progress[t.id]?.score_avg ?? 0,
      attempts: progress[t.id]?.attempts ?? 0,
    }));

  const covered = topics.filter(t => t.status === 'covered').length;
  const areas = [...new Set(topics.map(t => t.area))];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Topic Hub</h1>
          <p className="font-body text-sm text-gray-500 mt-0.5">{covered}/{topics.length} topics covered</p>
        </div>
        {/* Subject toggle */}
        <div className="flex gap-2">
          {(['maths', 'economics'] as Subject[]).map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className="px-4 py-2 rounded-xl font-body font-semibold text-sm transition-all capitalize"
              style={subject === s
                ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }
                : { background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4">
        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(covered / topics.length) * 100}%`, background: 'var(--purple)' }} />
        </div>
        <span className="font-body text-sm font-semibold text-gray-600 flex-shrink-0">{Math.round((covered / topics.length) * 100)}%</span>
      </div>

      {/* Search */}
      <div className="relative">
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
             className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
          <circle cx="9" cy="9" r="6"/><path d="M15 15l-3-3"/>
        </svg>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search topics…"
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 font-body text-sm text-gray-900 placeholder-gray-400 outline-none transition-all bg-white"
          onFocus={e => e.currentTarget.style.borderColor = 'var(--purple)'}
          onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
        />
      </div>

      {/* Topics by area */}
      {loading ? (
        <p className="font-body text-sm text-gray-400 text-center py-8">Loading topics…</p>
      ) : (
        areas.map(area => {
          const areaTopics = topics.filter(t => t.area === area);
          if (areaTopics.length === 0) return null;
          return (
            <div key={area}>
              <h2 className="font-body font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">{area}</h2>
              <div className="flex flex-col gap-2">
                {areaTopics.map(t => (
                  <TopicCard key={t.id} topic={t} onMark={handleMark} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
