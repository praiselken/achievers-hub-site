import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';

type Status = 'not_started' | 'in_progress' | 'covered';

interface Topic { id: string; area: string; name: string; }

const STATUS_STYLE: Record<Status, { bg: string; border: string; label: string; text: string }> = {
  not_started: { bg: '#f3f4f6', border: '#e5e7eb', label: 'Not started', text: '#6b7280' },
  in_progress: { bg: '#FAEEDA', border: '#F0C88A', label: 'In progress',  text: '#BA7517' },
  covered:     { bg: '#EAF3DE', border: '#C8E49A', label: 'Covered',      text: '#4A8A14' },
};

const SUBJECTS = ['maths', 'economics'] as const;

export default function ParentSpecTab() {
  const [activeSubject, setActiveSubject] = useState<'maths' | 'economics'>('maths');
  const [topics, setTopics]       = useState<Topic[]>([]);
  const [progress, setProgress]   = useState<Record<string, Status>>({});
  const [loading, setLoading]     = useState(true);
  const [childLinked, setChildLinked] = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: link } = await supabase
        .from('parent_child_links').select('child_id').eq('parent_id', user.id).limit(1).single();

      if (!link?.child_id) { setLoading(false); return; }
      setChildLinked(true);
      const childId = link.child_id;

      const [topicsRes, progressRes] = await Promise.all([
        supabase.from('topics').select('id,area,name').eq('subject', activeSubject).order('area').order('name'),
        supabase.from('topic_progress').select('topic_id,status').eq('user_id', childId),
      ]);

      const prog: Record<string, Status> = {};
      for (const p of progressRes.data ?? []) prog[p.topic_id] = p.status;
      setTopics(topicsRes.data ?? []);
      setProgress(prog);
      setLoading(false);
    }
    load();
  }, [activeSubject]);

  const covered    = topics.filter(t => (progress[t.id] ?? 'not_started') === 'covered').length;
  const inProgress = topics.filter(t => (progress[t.id] ?? 'not_started') === 'in_progress').length;
  const pct = topics.length ? Math.round((covered / topics.length) * 100) : 0;
  const areas = [...new Set(topics.map(t => t.area))];

  if (!childLinked && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-2">No child linked yet</h2>
        <p className="font-body text-sm text-gray-500 max-w-xs">Link your child's account from the Overview tab to see their spec coverage here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Spec Tracker</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5">Every topic on the spec and your child's coverage.</p>
      </div>

      {/* Subject switcher */}
      <div className="flex gap-2">
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => setActiveSubject(s)}
            className="px-4 py-2 rounded-xl font-body font-semibold text-sm capitalize transition-all"
            style={activeSubject === s
              ? { background: '#FAEEDA', color: '#7A4D0F', border: '1.5px solid #F0C88A' }
              : { background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
            {s === 'maths' ? '📐 Maths' : '📊 Economics'}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Covered',     value: covered,                              color: '#4A8A14', bg: '#EAF3DE' },
          { label: 'In progress', value: inProgress,                           color: '#BA7517', bg: '#FAEEDA' },
          { label: 'Not started', value: topics.length - covered - inProgress, color: '#6b7280', bg: '#f9fafb' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-orange-100 text-center">
            <div className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="font-body text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-5 border border-orange-100">
        <div className="flex justify-between items-center mb-2">
          <span className="font-body text-sm font-semibold text-gray-700">Overall coverage</span>
          <span className="font-display font-bold text-lg" style={{ color: '#BA7517' }}>{pct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
               style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #F0C88A, #BA7517)' }} />
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
          const areaCovered = areaTopics.filter(t => (progress[t.id] ?? 'not_started') === 'covered').length;
          return (
            <div key={area} className="bg-white rounded-2xl p-5 border border-orange-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-body font-bold text-gray-900 text-sm">{area}</h2>
                <span className="font-body text-xs text-gray-400">{areaCovered}/{areaTopics.length}</span>
              </div>
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div className="h-full rounded-full" style={{ width: `${areaTopics.length ? (areaCovered / areaTopics.length) * 100 : 0}%`, background: '#BA7517' }} />
              </div>
              <div className="flex flex-wrap gap-2">
                {areaTopics.map(t => {
                  const status = progress[t.id] ?? 'not_started';
                  const s = STATUS_STYLE[status];
                  return (
                    <span key={t.id}
                      className="px-3 py-1.5 rounded-lg border font-body text-xs font-medium"
                      style={{ background: s.bg, borderColor: s.border, color: s.text }}>
                      {t.name}
                    </span>
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
