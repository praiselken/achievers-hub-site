import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';

interface ChildStats {
  streak: number;
  longestStreak: number;
  topicsCovered: number;
  dailyDoneToday: boolean;
  recentSessions: { subject: string; score: number; total: number; completed_at: string }[];
  avgPaperScore: number | null;
  papersDone: number;
}

const DEFAULT: ChildStats = {
  streak: 0, longestStreak: 0, topicsCovered: 0, dailyDoneToday: false,
  recentSessions: [], avgPaperScore: null, papersDone: 0,
};

function StatCard({ icon, label, value, sub, accent }: {
  icon: string; label: string; value: string | number; sub: string; accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-orange-100" style={{ boxShadow: '0 2px 12px rgba(186,117,23,0.06)' }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="font-body text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>{label}</span>
      </div>
      <div className="font-display font-bold text-3xl text-gray-900">{value}</div>
      <div className="font-body text-xs text-gray-400 mt-1">{sub}</div>
    </div>
  );
}

export default function ParentOverviewTab() {
  const [stats, setStats]       = useState<ChildStats>(DEFAULT);
  const [loading, setLoading]   = useState(true);
  const [childLinked, setChildLinked] = useState(false);
  const [codeInput, setCodeInput]     = useState('');
  const [codeError, setCodeError]     = useState('');
  const [linking, setLinking]         = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Check if parent has linked a child
      const { data: link } = await supabase
        .from('parent_child_links')
        .select('child_id')
        .eq('parent_id', user.id)
        .limit(1)
        .single();

      if (!link?.child_id) { setLoading(false); return; }
      setChildLinked(true);

      const childId = link.child_id;
      const today   = new Date().toDateString();

      const [streakRes, topicsRes, sessionsRes, papersRes] = await Promise.all([
        supabase.from('streaks').select('*').eq('user_id', childId).single(),
        supabase.from('topic_progress').select('id').eq('user_id', childId).eq('status', 'covered'),
        supabase.from('daily_sessions').select('subject,score,total,completed_at').eq('user_id', childId).order('completed_at', { ascending: false }).limit(10),
        supabase.from('past_paper_logs').select('score,max_score').eq('user_id', childId),
      ]);

      const sessions = sessionsRes.data ?? [];
      const papers   = papersRes.data ?? [];

      setStats({
        streak:          streakRes.data?.current_streak ?? 0,
        longestStreak:   streakRes.data?.longest_streak ?? 0,
        topicsCovered:   topicsRes.data?.length ?? 0,
        dailyDoneToday:  sessions.some(s => new Date(s.completed_at).toDateString() === today),
        recentSessions:  sessions,
        avgPaperScore:   papers.length
          ? Math.round(papers.reduce((a, p) => a + (p.score / p.max_score) * 100, 0) / papers.length)
          : null,
        papersDone: papers.length,
      });
      setLoading(false);
    }
    load();
  }, []);

  async function claimCode() {
    if (!supabase || !codeInput.trim()) return;
    setLinking(true);
    setCodeError('');
    const code = codeInput.trim().toUpperCase();

    // Find the invite code
    const { data: invite, error } = await supabase
      .from('invite_codes')
      .select('id, student_id, claimed, expires_at')
      .eq('code', code)
      .single();

    if (error || !invite) {
      setCodeError('Code not found. Please check and try again.');
      setLinking(false);
      return;
    }
    if (invite.claimed) {
      setCodeError('This code has already been used.');
      setLinking(false);
      return;
    }
    if (new Date(invite.expires_at) < new Date()) {
      setCodeError('This code has expired. Ask your child to generate a new one.');
      setLinking(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLinking(false); return; }

    // Create the link and mark code as claimed
    await Promise.all([
      supabase.from('parent_child_links').insert({ parent_id: user.id, child_id: invite.student_id }),
      supabase.from('invite_codes').update({ claimed: true }).eq('id', invite.id),
    ]);

    setLinking(false);
    setChildLinked(true);
    // Reload stats
    window.location.reload();
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="font-body text-sm text-gray-400">Loading…</p></div>;
  }

  if (!childLinked) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-gray-900">{greeting} 👋</h1>
          <p className="font-body text-sm text-gray-500 mt-1">Your parent dashboard is ready.</p>
        </div>

        {/* Link child CTA */}
        <div className="bg-white rounded-3xl p-8 border border-orange-100 text-center"
             style={{ boxShadow: '0 4px 24px rgba(186,117,23,0.08)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
               style={{ background: '#FAEEDA' }}>👨‍👩‍👧</div>
          <h2 className="font-display font-bold text-xl text-gray-900 mb-2">Link your child's account</h2>
          <p className="font-body text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
            Once your child signs up and shares their invite code, you'll be able to track their progress, streaks, and topic coverage here.
          </p>
          <div className="flex flex-col gap-3 max-w-xs mx-auto w-full">
            <div className="flex gap-2">
              <input
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value.toUpperCase()); setCodeError(''); }}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="flex-1 font-mono font-bold text-center text-xl px-4 py-3 rounded-xl border outline-none tracking-widest uppercase"
                style={{ borderColor: codeError ? '#FCA5A5' : '#FDE68A', background: '#FFFBF0' }}
                onKeyDown={e => { if (e.key === 'Enter') claimCode(); }}
              />
              <button onClick={claimCode} disabled={linking || codeInput.length < 6}
                className="font-body text-sm font-bold px-5 py-3 rounded-xl text-white transition-all"
                style={{ background: '#D97706', opacity: (linking || codeInput.length < 6) ? 0.6 : 1 }}>
                {linking ? '…' : 'Link'}
              </button>
            </div>
            {codeError && (
              <p className="font-body text-xs text-center" style={{ color: '#991B1B' }}>{codeError}</p>
            )}
            <p className="font-body text-xs text-center text-gray-400">
              Your child can find their code in Settings on their dashboard.
            </p>
          </div>
        </div>

        {/* What you'll see */}
        <div>
          <h2 className="font-body font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">What you'll see once linked</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '🔥', title: 'Daily streak',       sub: 'See if your child is staying consistent every day' },
              { icon: '📚', title: 'Topic coverage',     sub: "Which topics they've covered across Maths and Economics" },
              { icon: '📄', title: 'Past paper scores',  sub: 'Track their improvement over time on past papers' },
              { icon: '📅', title: 'Tutor bookings',     sub: 'View and manage upcoming tutor sessions' },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-5 border border-orange-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                     style={{ background: '#FAEEDA' }}>{c.icon}</div>
                <div>
                  <p className="font-body font-bold text-sm text-gray-900">{c.title}</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5 leading-relaxed">{c.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">{greeting} 👋</h1>
        <p className="font-body text-sm text-gray-500 mt-1">Here's how your child is getting on today.</p>
      </div>

      {/* Daily 5 status banner */}
      {stats.dailyDoneToday ? (
        <div className="rounded-2xl p-5 flex items-center gap-4"
             style={{ background: '#EAF3DE', border: '1px solid #C8E49A' }}>
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-body font-bold text-sm text-green-800">Daily 5 complete today!</p>
            <p className="font-body text-xs text-green-700 mt-0.5">Your child completed their daily revision session.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 flex items-center gap-4"
             style={{ background: '#FAEEDA', border: '1px solid #F0C88A' }}>
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-body font-bold text-sm" style={{ color: '#7A4D0F' }}>Daily 5 not done yet today</p>
            <p className="font-body text-xs mt-0.5" style={{ color: '#BA7517' }}>Encourage your child to complete today's session.</p>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="🔥" label="Streak" value={stats.streak}
          sub={`day${stats.streak !== 1 ? 's' : ''} · best: ${stats.longestStreak}`} accent="#BA7517" />
        <StatCard icon="📚" label="Topics covered" value={stats.topicsCovered}
          sub="topics marked as covered" accent="#4A8A14" />
        <StatCard icon="📄" label="Avg paper score" value={stats.avgPaperScore !== null ? `${stats.avgPaperScore}%` : '—'}
          sub={`${stats.papersDone} paper${stats.papersDone !== 1 ? 's' : ''} logged`} accent="#9970A6" />
        <StatCard icon="⚡" label="Sessions" value={stats.recentSessions.length}
          sub="in the last 10 days" accent="#BA7517" />
      </div>

      {/* Recent sessions */}
      {stats.recentSessions.length > 0 && (
        <div>
          <h2 className="font-body font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Recent Daily 5 sessions</h2>
          <div className="flex flex-col gap-2">
            {stats.recentSessions.map((s, i) => {
              const pct = Math.round((s.score / s.total) * 100);
              const color = pct >= 80 ? '#4A8A14' : pct >= 60 ? '#BA7517' : '#D85A30';
              return (
                <div key={i} className="bg-white rounded-xl px-5 py-3 border border-orange-100 flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-body text-sm font-semibold text-gray-800 capitalize">{s.subject}</p>
                    <p className="font-body text-xs text-gray-400">
                      {new Date(s.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-lg" style={{ color }}>{pct}%</p>
                    <p className="font-body text-xs text-gray-400">{s.score}/{s.total}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="font-body font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Quick access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/parent-dashboard/progress',  icon: '📈', title: 'Full progress',   sub: 'Charts and trend data' },
            { to: '/parent-dashboard/spec',       icon: '🗺️', title: 'Spec coverage',  sub: 'Topic-by-topic breakdown' },
            { to: '/parent-dashboard/bookings',   icon: '📅', title: 'Tutor bookings', sub: 'Upcoming sessions' },
          ].map(c => (
            <Link key={c.to} to={c.to}
              className="bg-white rounded-2xl p-5 border border-orange-100 no-underline flex items-start gap-4 transition-all hover:border-orange-200"
              style={{ boxShadow: '0 2px 8px rgba(186,117,23,0.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: '#FAEEDA' }}>{c.icon}</div>
              <div>
                <p className="font-body font-bold text-sm text-gray-900">{c.title}</p>
                <p className="font-body text-xs text-gray-400 mt-0.5">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
