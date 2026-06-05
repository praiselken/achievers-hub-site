import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { MATHS_TOPICS, ECONOMICS_TOPICS, type Subject } from '../../../constants/specTopics';

type Status = 'not_started' | 'in_progress' | 'covered';

const STATUS_STYLE: Record<Status, { bg: string; border: string; label: string }> = {
  not_started: { bg: '#f3f4f6', border: '#e5e7eb', label: 'Not started' },
  in_progress: { bg: '#FAEEDA', border: '#F0C88A', label: 'In progress' },
  covered:     { bg: '#EAF3DE', border: '#C8E49A', label: 'Covered' },
};

export default function SpecMapperTab() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject>('maths');
  const [progress, setProgress] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);

  const topics = subject === 'maths' ? MATHS_TOPICS : ECONOMICS_TOPICS;

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from('topic_progress').select('topic_id, status').eq('user_id', user.id);
      const prog: Record<string, Status> = {};
      for (const p of data ?? []) prog[p.topic_id] = p.status;
      setProgress(prog);
      setLoading(false);
    }
    load();
  }, []);

  const covered    = topics.filter(t => (progress[t.id] ?? 'not_started') === 'covered').length;
  const inProgress = topics.filter(t => (progress[t.id] ?? 'not_started') === 'in_progress').length;
  const pct = Math.round((covered / topics.length) * 100);

  const areas = [...new Set(topics.map(t => t.area))];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">Spec Mapper</h1>
          <p className="font-body text-sm text-gray-500 mt-0.5">See every topic on the spec and how much you've covered.</p>
        </div>
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

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Covered',     value: covered,                         color: '#4A8A14', bg: '#EAF3DE' },
          { label: 'In progress', value: inProgress,                      color: '#BA7517', bg: '#FAEEDA' },
          { label: 'Not started', value: topics.length - covered - inProgress, color: '#6b7280', bg: '#f9fafb' },
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
        <p className="font-body text-xs text-gray-400 mt-2">{covered} of {topics.length} topics covered</p>
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

      {/* Spec grid by area */}
      {loading ? (
        <p className="font-body text-sm text-gray-400 text-center py-8">Loading…</p>
      ) : (
        areas.map(area => {
          const areaTopics = topics.filter(t => t.area === area);
          const areaCovered = areaTopics.filter(t => progress[t.id] === 'covered').length;
          return (
            <div key={area} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-body font-bold text-gray-900 text-sm">{area}</h2>
                <span className="font-body text-xs text-gray-400">{areaCovered}/{areaTopics.length}</span>
              </div>
              {/* Mini progress bar */}
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full" style={{ width: `${(areaCovered / areaTopics.length) * 100}%`, background: 'var(--purple)' }} />
              </div>
              {/* Topic tiles */}
              <div className="flex flex-wrap gap-2">
                {areaTopics.map(t => {
                  const status = progress[t.id] ?? 'not_started';
                  const s = STATUS_STYLE[status];
                  return (
                    <button
                      key={t.id}
                      onClick={() => navigate('/dashboard/topics')}
                      title={`${t.name} — ${s.label}`}
                      className="px-3 py-1.5 rounded-lg border font-body text-xs font-medium transition-all hover:opacity-80"
                      style={{ background: s.bg, borderColor: s.border, color: status === 'covered' ? '#4A8A14' : status === 'in_progress' ? '#BA7517' : '#6b7280' }}>
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
