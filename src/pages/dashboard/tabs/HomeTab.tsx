import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useSubjects, type SubjectRow } from '../../../lib/useSubjects';
import { useSubject } from '../DashboardLayout';
import { checkAndAwardAchievements } from '../../../lib/xp';
import { isDemoMode } from '../../../lib/demoMode';
import { DEMO_PROFILE, getDemoMetrics, getDemoSubjectProgress } from '../../../lib/demoData';

interface GlobalStats {
  streak: number;
  longestStreak: number;
  dailyDoneToday: boolean;
  avgMastery: number | null;
  papersDone: number;
  achievementCount: number;
}

interface SubjectProgress extends SubjectRow {
  totalTopics: number;
  coveredTopics: number;
  pct: number;
  lastPracticed: string | null;
}

const DEFAULT_STATS: GlobalStats = {
  streak: 0, longestStreak: 0, dailyDoneToday: false, avgMastery: null, papersDone: 0, achievementCount: 0,
};

export default function HomeTab() {
  const { subject, setSubject } = useSubject();
  const { activeSubjects } = useSubjects();
  const navigate = useNavigate();

  const [stats, setStats] = useState<GlobalStats>(DEFAULT_STATS);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    async function load() {
      if (isDemoMode()) {
        setDisplayName(DEMO_PROFILE.display_name);
        const metrics = getDemoMetrics();
        setStats({
          streak: metrics.streakDays,
          longestStreak: metrics.longestStreak,
          dailyDoneToday: false,
          avgMastery: metrics.avgMastery,
          papersDone: metrics.papersLogged,
          achievementCount: metrics.unlockedCount,
        });
        setSubjectProgress(activeSubjects.map(s => ({ ...s, ...getDemoSubjectProgress(s.slug) })));
        setLoading(false);
        return;
      }
      if (!supabase || activeSubjects.length === 0) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const profileRes = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
      if (profileRes.data?.display_name) setDisplayName(profileRes.data.display_name);

      await checkAndAwardAchievements(user.id);

      const [streakRes, sessionsRes, masteryRes, papersRes, achievementsRes] = await Promise.all([
        supabase.from('streaks').select('*').eq('user_id', user.id).single(),
        supabase.from('daily_sessions').select('completed_at').eq('user_id', user.id).eq('subject', subject).order('completed_at', { ascending: false }).limit(30),
        supabase.from('topic_progress').select('score_avg, attempts').eq('user_id', user.id).gt('attempts', 0),
        supabase.from('past_paper_logs').select('score, max_score').eq('user_id', user.id),
        supabase.from('user_achievements').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      const today = new Date().toDateString();
      const dailyDoneToday = sessionsRes.data?.some(
        s => new Date(s.completed_at).toDateString() === today
      ) ?? false;

      const masteryRows = masteryRes.data ?? [];
      const avgMastery = masteryRows.length
        ? Math.round(masteryRows.reduce((a, r) => a + Number(r.score_avg), 0) / masteryRows.length)
        : null;

      const paperScores = papersRes.data ?? [];

      setStats({
        streak: streakRes.data?.current_streak ?? 0,
        longestStreak: streakRes.data?.longest_streak ?? 0,
        dailyDoneToday,
        avgMastery,
        papersDone: paperScores.length,
        achievementCount: achievementsRes.count ?? 0,
      });

      const perSubject = await Promise.all(activeSubjects.map(async (s): Promise<SubjectProgress> => {
        const [totalRes, progressRes] = await Promise.all([
          supabase!.from('topics').select('id', { count: 'exact', head: true }).eq('subject', s.slug),
          supabase!.from('topic_progress').select('status, last_practiced, topics!inner(subject)').eq('user_id', user.id).eq('topics.subject', s.slug),
        ]);
        const totalTopics = totalRes.count ?? 0;
        const rows = progressRes.data ?? [];
        const coveredTopics = rows.filter(r => r.status === 'covered').length;
        const lastPracticed = rows.reduce<string | null>((latest, r) => {
          if (!r.last_practiced) return latest;
          return !latest || r.last_practiced > latest ? r.last_practiced : latest;
        }, null);
        return {
          ...s,
          totalTopics,
          coveredTopics,
          pct: totalTopics > 0 ? Math.round((coveredTopics / totalTopics) * 100) : 0,
          lastPracticed,
        };
      }));
      setSubjectProgress(perSubject);
      setLoading(false);
    }
    load();
  }, [subject, activeSubjects.length]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const overallPct = subjectProgress.length
    ? Math.round(subjectProgress.reduce((a, s) => a + s.pct, 0) / subjectProgress.length)
    : 0;

  function goToSubject(slug: string) {
    setSubject(slug as typeof subject);
    navigate('/dashboard/topics');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="font-body text-sm text-gray-400">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="rounded-2xl p-6 md:p-7"
           style={{ background: 'linear-gradient(135deg, var(--purple-dark) 0%, #6B4A80 100%)' }}>
        <h1 className="font-display font-bold text-white text-2xl md:text-3xl">
          {greeting}{displayName ? `, ${displayName}` : ''} 👋
        </h1>
        <p className="font-body text-sm mt-1" style={{ color: '#E4CFEE' }}>
          {stats.streak > 0
            ? `You're on a ${stats.streak}-day streak — keep it going.`
            : "Ready to build your streak today?"}
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔥</span>
            <span className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider">Streak</span>
          </div>
          <div className="font-display font-bold text-3xl text-gray-900">{stats.streak}</div>
          <div className="font-body text-xs text-gray-400 mt-1">day{stats.streak !== 1 ? 's' : ''} · best: {stats.longestStreak}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Avg mastery</div>
          <div className="font-display font-bold text-3xl text-gray-900">
            {stats.avgMastery !== null ? `${stats.avgMastery}%` : '—'}
          </div>
          <div className="font-body text-xs text-gray-400 mt-1">across all topics practised</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Daily 5</div>
          <div className="font-display font-bold text-lg" style={{ color: stats.dailyDoneToday ? '#4A8A14' : 'var(--purple-dark)' }}>
            {stats.dailyDoneToday ? 'Done today' : 'Not yet'}
          </div>
          <div className="font-body text-xs text-gray-400 mt-1">{stats.papersDone} paper{stats.papersDone !== 1 ? 's' : ''} logged</div>
        </div>

        <Link to="/dashboard/achievements" className="bg-white rounded-2xl p-5 border border-gray-100 no-underline hover-lift transition-all" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <div className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Achievements</div>
          <div className="font-display font-bold text-3xl text-gray-900">{stats.achievementCount}</div>
          <div className="font-body text-xs text-gray-400 mt-1">unlocked</div>
        </Link>
      </div>

      {/* Daily 5 CTA */}
      {!stats.dailyDoneToday ? (
        <div className="rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-5"
             style={{ background: 'linear-gradient(135deg, var(--purple-faint) 0%, #EDE0F4 100%)', border: '1px solid var(--purple-light)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'white' }}>⚡</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg" style={{ color: 'var(--purple-dark)' }}>Your Daily 5 is ready</h3>
            <p className="font-body text-sm mt-0.5" style={{ color: 'var(--purple)' }}>
              5 targeted questions. 15 minutes. Builds your streak.
            </p>
          </div>
          <Link to="/dashboard/daily5" className="btn-glow-purple text-sm no-underline px-5 py-3 whitespace-nowrap" style={{ borderRadius: '12px' }}>
            Start Daily 5 →
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl p-6 flex items-center gap-5" style={{ background: '#EAF3DE', border: '1px solid #C8E49A' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 bg-white">✅</div>
          <div>
            <h3 className="font-display font-bold text-lg text-green-800">Daily 5 complete!</h3>
            <p className="font-body text-sm text-green-700 mt-0.5">Come back tomorrow to keep your streak going.</p>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Continue where you left off */}
          <div>
            <h2 className="font-body font-bold text-gray-700 text-sm uppercase tracking-wider mb-3">Continue where you left off</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjectProgress.map(s => (
                <button key={s.slug} onClick={() => goToSubject(s.slug)}
                  className="bg-white rounded-2xl p-5 border border-gray-100 text-left hover-lift transition-all"
                  style={{ boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                         style={{ background: `${s.color}22` }}>{s.icon}</div>
                    <div>
                      <div className="font-body font-bold text-gray-900 text-sm">{s.name}</div>
                      <div className="font-body text-xs text-gray-400">{s.coveredTopics} of {s.totalTopics} topics covered</div>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color ?? 'var(--purple)' }} />
                  </div>
                  <div className="font-body text-xs text-gray-400 mt-2">{s.pct}% complete</div>
                </button>
              ))}
            </div>
          </div>

          {/* Today's Plan */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
            <h2 className="font-body font-bold text-gray-900 mb-4">Today's Plan</h2>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Complete your Daily 5', done: stats.dailyDoneToday, link: '/dashboard/daily5' },
                { label: 'Review a topic in Practice', done: subjectProgress.some(s => s.coveredTopics > 0), link: '/dashboard/topics' },
                { label: 'Log a past paper score', done: stats.papersDone > 0, link: '/dashboard/papers' },
                { label: 'Check your Spec Mapper', done: false, link: '/dashboard/spec' },
              ].map(item => (
                <Link key={item.label} to={item.link} className="flex items-center gap-3 no-underline group">
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

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
            <h2 className="font-body font-bold text-gray-900 mb-4">Your Progress Overview</h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#F3F0F8" strokeWidth="10" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--purple)" strokeWidth="10"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - overallPct / 100)}`}
                          strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display font-bold text-xl text-gray-900">{overallPct}%</span>
                </div>
              </div>
              <div className="flex-1 w-full flex flex-col gap-3">
                {subjectProgress.map(s => (
                  <div key={s.slug}>
                    <div className="flex justify-between font-body text-xs text-gray-500 mb-1">
                      <span>{s.name}</span>
                      <span>{s.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color ?? 'var(--purple)' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-5 border border-gray-100" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
            <h2 className="font-body font-bold text-gray-900 text-sm mb-3">Recent Notifications</h2>
            <p className="font-body text-xs text-gray-400">You'll see achievement unlocks and reminders here soon.</p>
          </div>

          <div className="rounded-2xl p-5 border" style={{ background: '#FAFAFA', borderColor: '#F0F0F0' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🤖</span>
              <h2 className="font-body font-bold text-gray-500 text-sm">Ask Archi</h2>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-gray-400" style={{ background: '#EEE' }}>Coming soon</span>
            </div>
            <p className="font-body text-xs text-gray-400">Ask for explanations, hints and practice questions.</p>
          </div>

          <div className="rounded-2xl p-5 border" style={{ background: '#FAFAFA', borderColor: '#F0F0F0' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🌱</span>
              <h2 className="font-body font-bold text-gray-500 text-sm">Think. Speak. Grow.</h2>
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-gray-400" style={{ background: '#EEE' }}>Coming soon</span>
            </div>
            <p className="font-body text-xs text-gray-400">Daily reflections to build your mindset.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
