import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useSubject } from '../DashboardLayout';

type Status = 'not_started' | 'in_progress' | 'covered';

interface Topic {
  id: string;
  area: string;
  name: string;
  exam_board: string | null;
}

const STATUS_STYLE: Record<Status, { bg: string; border: string; label: string; text: string }> = {
  not_started: { bg: '#f3f4f6', border: '#e5e7eb', label: 'Not started', text: '#6b7280' },
  in_progress: { bg: '#FAEEDA', border: '#F0C88A', label: 'In progress',  text: '#BA7517' },
  covered:     { bg: '#EAF3DE', border: '#C8E49A', label: 'Covered',      text: '#4A8A14' },
};

// Canonical strand order — topics are sorted within these groups
const STRAND_ORDER: Record<string, string[]> = {
  maths: [
    'Number',
    'Algebra',
    'Ratio, proportion and rates of change',
    'Geometry and measures',
    'Probability',
    'Statistics',
  ],
  economics: [
    'Microeconomics',
    'Macroeconomics',
    'International economics',
    'The national and global economy',
  ],
};

function sortedStrands(areas: string[], subject: string): string[] {
  const order = STRAND_ORDER[subject] ?? [];
  return [
    ...order.filter(s => areas.includes(s)),
    ...areas.filter(s => !order.includes(s)).sort(),
  ];
}

export default function SpecMapperTab() {
  const navigate = useNavigate();
  const { subject } = useSubject();
  const [topics, setTopics]         = useState<Topic[]>([]);
  const [progress, setProgress]     = useState<Record<string, Status>>({});
  const [loading, setLoading]       = useState(true);
  const [examBoard, setExamBoard]   = useState<string | null>(null);
  const [boardFilter, setBoardFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [profileRes, topicsRes, progressRes] = await Promise.all([
        supabase.from('profiles').select('exam_board').eq('id', user.id).single(),
        supabase.from('topics').select('id, area, name, exam_board').eq('subject', subject).order('area').order('name'),
        supabase.from('topic_progress').select('topic_id, status').eq('user_id', user.id),
      ]);

      const board = profileRes.data?.exam_board ?? null;
      setExamBoard(board);
      if (board) setBoardFilter(board);

      const prog: Record<string, Status> = {};
      for (const p of progressRes.data ?? []) prog[p.topic_id] = p.status;

      setTopics(topicsRes.data ?? []);
      setProgress(prog);
      setLoading(false);
    }
    load();
  }, [subject]);

  // Filter topics by exam board (show shared topics + board-specific ones)
  const visibleTopics = boardFilter === 'all'
    ? topics
    : topics.filter(t => !t.exam_board || t.exam_board === boardFilter);

  const covered    = visibleTopics.filter(t => (progress[t.id] ?? 'not_started') === 'covered').length;
  const inProgress = visibleTopics.filter(t => (progress[t.id] ?? 'not_started') === 'in_progress').length;
  const pct = visibleTopics.length ? Math.round((covered / visibleTopics.length) * 100) : 0;

  const rawAreas = [...new Set(visibleTopics.map(t => t.area))];
  const areas = sortedStrands(rawAreas, subject);

  // Detect if any topics have exam_board set (to decide whether to show filter)
  const hasExamBoardData = topics.some(t => t.exam_board);
  const availableBoards = [...new Set(topics.map(t => t.exam_board).filter(Boolean))] as string[];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-gray-900">Spec Mapper</h1>
          <p className="font-body text-sm text-gray-500 mt-0.5 capitalize">
            {subject} · see every topic on the spec and how much you've covered.
          </p>
        </div>
        {/* Exam board filter — only show if topics have board data */}
        {hasExamBoardData && (
          <div className="flex items-center gap-2">
            <span className="font-body text-xs font-semibold text-gray-400">Board:</span>
            <div className="flex gap-1.5">
              {['all', ...availableBoards].map(b => (
                <button key={b} onClick={() => setBoardFilter(b)}
                  className="px-3 py-1.5 rounded-lg font-body font-semibold text-xs transition-all capitalize"
                  style={boardFilter === b
                    ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }
                    : { background: '#f9fafb', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
                  {b === 'all' ? 'All' : b}
                </button>
              ))}
            </div>
          </div>
        )}
        {examBoard && (
          <span className="font-body text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                style={{ background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1px solid var(--purple-light)' }}>
            {examBoard}
          </span>
        )}
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Covered',     value: covered,                              color: '#4A8A14', bg: '#EAF3DE' },
          { label: 'In progress', value: inProgress,                           color: '#BA7517', bg: '#FAEEDA' },
          { label: 'Not started', value: visibleTopics.length - covered - inProgress, color: '#6b7280', bg: '#f9fafb' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
            <div className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="font-body text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <span className="font-body text-sm font-semibold text-gray-700">Overall coverage</span>
          <span className="font-display font-bold text-lg" style={{ color: 'var(--purple-dark)' }}>{pct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
               style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--purple-light), var(--purple))' }} />
        </div>
        <p className="font-body text-xs text-gray-400 mt-2">{covered} of {visibleTopics.length} topics covered</p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {Object.entries(STATUS_STYLE).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border" style={{ background: v.bg, borderColor: v.border }} />
            <span className="font-body text-xs text-gray-500">{v.label}</span>
          </div>
        ))}
      </div>

      {/* Spec grid by strand */}
      {loading ? (
        <p className="font-body text-sm text-gray-400 text-center py-8">Loading…</p>
      ) : visibleTopics.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-body text-sm text-gray-500">No topics found for this subject yet.</p>
        </div>
      ) : (
        areas.map(area => {
          const areaTopics = visibleTopics.filter(t => t.area === area);
          const areaCovered = areaTopics.filter(t => (progress[t.id] ?? 'not_started') === 'covered').length;
          return (
            <div key={area} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-body font-bold text-gray-900 text-sm">{area}</h2>
                <span className="font-body text-xs text-gray-400">{areaCovered}/{areaTopics.length}</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full transition-all"
                     style={{ width: `${areaTopics.length ? (areaCovered / areaTopics.length) * 100 : 0}%`,
                              background: 'var(--purple)' }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {areaTopics.map(t => {
                  const status = progress[t.id] ?? 'not_started';
                  const s = STATUS_STYLE[status];
                  return (
                    <button key={t.id} onClick={() => navigate('/dashboard/topics')}
                      title={`${t.name} — ${s.label}`}
                      className="px-3 py-1.5 rounded-lg border font-body text-xs font-medium transition-all hover:opacity-80"
                      style={{ background: s.bg, borderColor: s.border, color: s.text }}>
                      {t.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
