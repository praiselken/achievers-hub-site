import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { PATHWAYS } from '../../../constants/specTopics';
import { useSubject } from '../DashboardLayout';

interface Stats {
  streak: number;
  longestStreak: number;
  dailyDoneToday: boolean;
  pathway: string;
  topicsCovered: number;
  papersDone: number;
  avgScore: number | null;
}

const DEFAULT_STATS: Stats = {
  streak: 0, longestStreak: 0, dailyDoneToday: false,
  pathway: 'foundation_plus', topicsCovered: 0, papersDone: 0, avgScore: null,
};

export default function HomeTab() {
  const { subject } = useSubject();
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [totalTopics, setTotalTopics] = useState(0);

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [streakRes, diagnosticRes, topicsRes, sessionsRes, papersRes, totalRes] = await Promise.all([
        supabase.from('streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('diagnostic_results').select('pathway').eq('user_id', user.id).eq('subject', subject).order('taken_at', { ascending: false }).limit(1).single(),
        supabase.from('topic_progress').select('topic_id').eq('user_id', user.id).eq('status', 'covered'),
        supabase.from('daily_sessions').select('completed_at, score, total').eq('user_id', user.id).eq('subject', subject).order('completed_at', { ascending: false }).limit(30),
        supabase.from('past_paper_logs').select('score, max_score').eq('user_id', user.id),
        supabase.from('topics').select('id', { count: 'exact', head: true }).eq('subject', subject),
      ]);

      setTotalTopics(totalRes.count ?? 0);

      const today = new Date().toDateString();
      const dailyDoneToday = sessionsRes.data?.some(
        s => new Date(s.completed_at).toDateString() === today
      ) ?? false;

      const scores = papersRes.data ?? [];
      const avgScore = scores.length
        ? Math.round(scores.reduce((a, s) => a + (s.score / s.max_score) * 100, 0) / scores.length)
        : null;

      setStats({
        streak: streakRes.data?.current_streak ?? 0,
        longestStreak: streakRes.data?.longest_streak ?? 0,
        dailyDoneToday,
        pathway: diagnosticRes.data?.pathway ?? 'foundation_plus',
        topicsCovered: topicsRes.data?.length ?? 0,
        papersDone: scores.length,
        avgScore,
      });
      setLoading(false);
    }
    load();
  }, []);

  const pathwayInfo = PATHWAYS.find(p => p.key === stats.pathway) ?? PATHWAYS[2];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-gray-900 text-2xl md:text-3xl">{greeting} 👋</h1>
        <p className="font-body text-gray-500 mt-1 text-sm">Here's where you are today.</p>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔥</span>
            <span className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider">Streak</span>
          </div>
          <div className="font-display font-bold text-4xl text-gray-900">{stats.streak}</div>
          <div className="font-body text-xs text-gray-400 mt-1">day{stats.streak !== 1 ? 's' : ''} in a row · best: {stats.longestStreak}</div>
        </div>

        {/* Pathway */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pathway</div>
          <div className="font-display font-bold text-lg" style={{ color: pathwayInfo.color }}>{pathwayInfo.label}</div>
          <div className="font-body text-xs text-gray-400 mt-1">Grades {pathwayInfo.grades}</div>
        </div>

        {/* Topics covered */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Topics covered</div>
          <div className="font-display font-bold text-3xl text-gray-900">{stats.topicsCovered}</div>
          <div className="font-body text-xs text-gray-400 mt-1">of {totalTopics} total</div>
        </div>

        {/* Avg score */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Avg paper score</div>
          <div className="font-display font-bold text-3xl text-gray-900">
            {stats.avgScore !== null ? `${stats.avgScore}%` : '—'}
          </div>
          <div className="font-body text-xs text-gray-400 mt-1">{stats.papersDone} paper{stats.papersDone !== 1 ? 's' : ''} logged</div>
        </div>
      </div>

      {/* Daily 5 CTA */}
      {!stats.dailyDoneToday ? (
        <div className="rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5"
             style={{ background: 'linear-gradient(135deg, var(--purple-faint) 0%, #EDE0F4 100%)', border: '1px solid var(--purple-light)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
               style={{ background: 'white' }}>⚡</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--purple-dark)' }}>Your Daily 5 is ready</h3>
            <p className="font-body text-sm mt-0.5" style={{ color: 'var(--purple)' }}>
              5 targeted questions. 15 minutes. Builds your streak and feeds your pathway.
            </p>
          </div>
          <Link to="/dashboard/daily5"
            className="btn-glow-purple text-sm no-underline px-5 py-3 whitespace-nowrap"
            style={{ borderRadius: '12px' }}>
            Start Daily 5 →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl p-6 flex items-center gap-5"
             style={{ background: '#EAF3DE', border: '1px solid #C8E49A' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-white">✅</div>
          <div>
            <h3 className="font-display font-bold text-lg text-green-800">Daily 5 complete!</h3>
            <p className="font-body text-sm text-green-700 mt-0.5">Come back tomorrow to keep your streak going.</p>
          </div>
        </div>
      )}

      {/* Quick access */}
      <div>
        <h2 className="font-body font-bold text-gray-700 text-sm uppercase tracking-wider mb-3">Quick access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/dashboard/topics', icon: '📚', title: 'Topic Hub', sub: 'Browse and revise any topic', color: 'var(--purple-faint)', border: 'var(--purple-light)' },
            { to: '/dashboard/papers', icon: '📄', title: 'Past Papers', sub: 'Download and log your scores', color: '#FAEEDA', border: '#F0C88A' },
            { to: '/dashboard/spec',   icon: '🗺️', title: 'Spec Mapper', sub: 'See your full coverage', color: '#EAF3DE', border: '#C8E49A' },
          ].map(card => (
            <Link key={card.to} to={card.to}
              className="bg-white rounded-2xl p-5 border no-underline flex items-start gap-4 hover-lift transition-all"
              style={{ borderColor: card.border, boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: card.color }}>
                {card.icon}
              </div>
              <div>
                <div className="font-body font-bold text-gray-900 text-sm">{card.title}</div>
                <div className="font-body text-xs text-gray-400 mt-0.5">{card.sub}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting started checklist (shown until all done) */}
      {!loading && stats.streak === 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <h2 className="font-body font-bold text-gray-900 mb-4">Get started checklist</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Complete your first Daily 5', done: stats.dailyDoneToday, link: '/dashboard/daily5' },
              { label: 'Explore a topic in the Topic Hub', done: stats.topicsCovered > 0, link: '/dashboard/topics' },
              { label: 'Download and log a past paper', done: stats.papersDone > 0, link: '/dashboard/papers' },
              { label: 'View your Spec Mapper', done: false, link: '/dashboard/spec' },
            ].map(item => (
              <Link key={item.label} to={item.link}
                className="flex items-center gap-3 no-underline group">
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                     style={{ borderColor: item.done ? '#78B828' : 'var(--purple-light)', background: item.done ? '#78B828' : 'white' }}>
                  {item.done && <svg viewBox="0 0 12 12" className="w-3 h-3" fill="white"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className={`font-body text-sm ${item.done ? 'line-through text-gray-400' : 'text-gray-700 group-hover:text-purple-700'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
