import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';

interface Session {
  subject: string;
  score: number;
  total: number;
  completed_at: string;
}

interface PaperLog {
  score: number;
  max_score: number;
  logged_at: string;
  past_papers: { title: string; subject: string; year: number } | null;
}

const SUBJECTS = ['maths', 'economics'] as const;

export default function ParentProgressTab() {
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [papers, setPapers]       = useState<PaperLog[]>([]);
  const [topicStats, setTopicStats] = useState<{ subject: string; covered: number; total: number }[]>([]);
  const [loading, setLoading]     = useState(true);
  const [childLinked, setChildLinked] = useState(false);
  const [activeSubject, setActiveSubject] = useState<'maths' | 'economics'>('maths');

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

      const [sessRes, papersRes, progressRes, topicsRes] = await Promise.all([
        supabase.from('daily_sessions').select('subject,score,total,completed_at').eq('user_id', childId)
          .order('completed_at', { ascending: false }).limit(30),
        supabase.from('past_paper_logs').select('score,max_score,logged_at,past_papers(title,subject,year)')
          .eq('user_id', childId).order('logged_at', { ascending: false }),
        supabase.from('topic_progress').select('topic_id,status').eq('user_id', childId),
        supabase.from('topics').select('id,subject'),
      ]);

      setSessions(sessRes.data ?? []);
      setPapers((papersRes.data ?? []) as unknown as PaperLog[]);

      const progress = progressRes.data ?? [];
      const allTopics = topicsRes.data ?? [];
      const stats = SUBJECTS.map(s => {
        const subTopics = allTopics.filter(t => t.subject === s);
        const covered = subTopics.filter(t => progress.find(p => p.topic_id === t.id && p.status === 'covered')).length;
        return { subject: s, covered, total: subTopics.length };
      });
      setTopicStats(stats);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="font-body text-sm text-gray-400">Loading…</p></div>;
  }

  if (!childLinked) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-4xl mb-4">📈</div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-2">No child linked yet</h2>
        <p className="font-body text-sm text-gray-500 max-w-xs">Link your child's account from the Overview tab to see their progress data here.</p>
      </div>
    );
  }

  const filteredSessions = sessions.filter(s => s.subject === activeSubject);
  const avgDaily = filteredSessions.length
    ? Math.round(filteredSessions.reduce((a, s) => a + (s.score / s.total) * 100, 0) / filteredSessions.length)
    : null;

  const maxBar = 5;
  const recentBarSessions = filteredSessions.slice(0, 10).reverse();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Progress</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5">Your child's performance over time.</p>
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

      {/* Topic coverage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {topicStats.map(ts => {
          const pct = ts.total ? Math.round((ts.covered / ts.total) * 100) : 0;
          return (
            <div key={ts.subject} className="bg-white rounded-2xl p-5 border border-orange-100"
                 style={{ boxShadow: '0 2px 8px rgba(186,117,23,0.05)' }}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-body font-bold text-sm text-gray-900 capitalize">{ts.subject} topics covered</p>
                <span className="font-display font-bold text-lg" style={{ color: '#BA7517' }}>{pct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full transition-all"
                     style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #F0C88A, #BA7517)' }} />
              </div>
              <p className="font-body text-xs text-gray-400">{ts.covered} of {ts.total} topics</p>
            </div>
          );
        })}
      </div>

      {/* Daily 5 trend */}
      <div className="bg-white rounded-2xl p-5 border border-orange-100"
           style={{ boxShadow: '0 2px 8px rgba(186,117,23,0.05)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-body font-bold text-gray-900">Daily 5 scores</h2>
            <p className="font-body text-xs text-gray-400 capitalize">{activeSubject} · last {recentBarSessions.length} sessions</p>
          </div>
          {avgDaily !== null && (
            <div className="text-right">
              <p className="font-display font-bold text-2xl" style={{ color: '#BA7517' }}>{avgDaily}%</p>
              <p className="font-body text-xs text-gray-400">average</p>
            </div>
          )}
        </div>

        {recentBarSessions.length === 0 ? (
          <p className="font-body text-sm text-gray-400 text-center py-8">No sessions recorded yet for {activeSubject}.</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {recentBarSessions.map((s, i) => {
              const pct = (s.score / s.total) * 100;
              const heightPct = (s.score / maxBar) * 100;
              const color = pct >= 80 ? '#4A8A14' : pct >= 60 ? '#BA7517' : '#D85A30';
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="font-mono text-[10px] text-gray-500">{Math.round(pct)}%</span>
                  <div className="w-full rounded-t-lg transition-all" title={`${s.score}/${s.total}`}
                       style={{ height: `${Math.max(heightPct, 8)}%`, background: color, minHeight: 4 }} />
                  <span className="font-body text-[9px] text-gray-400">
                    {new Date(s.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past paper scores */}
      {papers.length > 0 && (
        <div>
          <h2 className="font-body font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Past paper scores</h2>
          <div className="flex flex-col gap-2">
            {papers.map((p, i) => {
              const pct = Math.round((p.score / p.max_score) * 100);
              const color = pct >= 70 ? '#4A8A14' : pct >= 50 ? '#BA7517' : '#D85A30';
              return (
                <div key={i} className="bg-white rounded-xl px-5 py-3 border border-orange-100 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-body text-sm font-semibold text-gray-800">
                      {p.past_papers?.title ?? 'Past paper'}
                    </p>
                    <p className="font-body text-xs text-gray-400 capitalize">
                      {p.past_papers?.subject} · {p.past_papers?.year} ·{' '}
                      {new Date(p.logged_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-lg" style={{ color }}>{pct}%</p>
                    <p className="font-body text-xs text-gray-400">{p.score}/{p.max_score}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {papers.length === 0 && filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">📊</p>
          <p className="font-body text-sm text-gray-500">No data yet — encourage your child to start their Daily 5!</p>
        </div>
      )}
    </div>
  );
}
