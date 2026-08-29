import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BarChart3, BookOpen, FileText, Sparkles, Sprout } from 'lucide-react';
import { ArchiAvatar } from '../../../components/marketing/ArchiAvatar';
import { GROW_ACTIONS, todaysReflection } from '../../../lib/tsg';
import { loadGrades } from '../../../lib/grades';
import { supabase } from '../../../lib/supabase';
import { useSubjects, type SubjectRow } from '../../../lib/useSubjects';
import { useSubject } from '../DashboardLayout';
import { checkAndAwardAchievements } from '../../../lib/xp';
import { isDemoMode } from '../../../lib/demoMode';
import { getDemoMetrics, getDemoSubjectProgress } from '../../../lib/demoData';

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

  useEffect(() => {
    async function load() {
      if (isDemoMode()) {
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


  const grades = loadGrades(subject);
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
        <p className="text-sm text-[var(--color-ink-500)]">Loading your dashboard…</p>
      </div>
    );
  }

  // The four dashboard states defined in the client's Think. Speak. Grow. brief.
  const reflection = todaysReflection();
  const nextStep = !stats.dailyDoneToday
    ? {
        eyebrow: 'Your next step',
        title: 'Complete today’s Daily 5.',
        copy: 'Five personalised questions, then a clear recommendation for what to do next.',
        cta: { label: 'Start Daily 5', href: '/dashboard/daily5' },
        tone: 'daily' as const,
      }
    : !reflection
      ? {
          eyebrow: 'Think. Speak. Grow.',
          title: 'Reflect on today’s learning and choose what to do next.',
          copy: 'One minute, entirely optional, and never counted against you.',
          cta: { label: 'Start Think. Speak. Grow.', href: '/dashboard/tsg' },
          tone: 'grow' as const,
        }
      : !reflection.actionCompleted
        ? {
            eyebrow: 'Today’s growth action',
            title: GROW_ACTIONS.find((a) => a.id === reflection.action)?.label ?? 'Your next step is saved.',
            copy: 'You chose this after today’s reflection.',
            cta: { label: 'Do this now', href: '/dashboard/tsg' },
            tone: 'grow' as const,
          }
        : {
            eyebrow: 'You followed through',
            title: 'You reviewed the feedback and tried again independently.',
            copy: 'That is today’s Think. Speak. Grow. complete.',
            cta: { label: 'Open My Growth Journey', href: '/dashboard/tsg' },
            tone: 'progress' as const,
          };

  const tiles: { label: string; value: string; note: string; href?: string }[] = [
    { label: 'Streak', value: String(stats.streak), note: `day${stats.streak === 1 ? '' : 's'} · best ${stats.longestStreak}` },
    { label: 'Average mastery', value: stats.avgMastery !== null ? `${stats.avgMastery}%` : '—', note: 'across topics practised' },
    { label: 'Past papers', value: String(stats.papersDone), note: 'logged so far', href: '/dashboard/papers' },
    { label: 'Achievements', value: String(stats.achievementCount), note: 'unlocked', href: '/dashboard/achievements' },
  ];

  const tools = [
    { label: 'Daily 5', copy: 'Five questions for this subject', href: '/dashboard/daily5', tone: 'daily', icon: Sparkles },
    { label: 'Practice', copy: 'Knowledge cards, lessons and questions', href: '/dashboard/topics', tone: 'topic', icon: BookOpen },
    { label: 'Past papers', copy: 'Turn marks into topic priorities', href: '/dashboard/papers', tone: 'past', icon: FileText },
    { label: 'Progress', copy: 'See what to revise next', href: '/dashboard/spec', tone: 'progress', icon: BarChart3 },
    { label: 'Think. Speak. Grow.', copy: 'Reflect, choose and act', href: '/dashboard/tsg', tone: 'grow', icon: Sprout },
  ] as const;

  return (
    <div className="flex flex-col gap-5">

      {/* Your next step */}
      <section className={`feature-${nextStep.tone} overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[var(--shadow-soft-lg)]`}>
        <div className="feature-tinted-surface px-6 py-6 sm:px-9 sm:py-8">
          <p className="text-xs font-extrabold uppercase tracking-[.14em] feature-accent-text">{nextStep.eyebrow}</p>
          <h1 className="mt-2 max-w-2xl font-display text-2xl font-extrabold leading-snug text-[var(--color-ink-900)] sm:text-3xl">
            {nextStep.title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-ink-600)]">{nextStep.copy}</p>
          <Link
            to={nextStep.cta.href}
            className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-6 font-bold text-white transition hover:bg-[var(--color-primary-700)]"
          >
            {nextStep.cta.label} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Grades — working, target and the topic picture between them.
          Pathway tiers stay internal and are deliberately not shown here. */}
      <section className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-[1fr_1fr_1.4fr]">
        <div className="bg-white p-5">
          <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[var(--color-ink-500)]">Working grade</p>
          {grades.working !== null ? (
            <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-[var(--color-ink-900)]">{grades.working}</p>
          ) : (
            <p className="mt-2 font-display text-xl font-extrabold text-[var(--color-ink-300)]">Not set</p>
          )}
          <p className="mt-1 text-xs leading-5 text-[var(--color-ink-500)]">What you are working at now</p>
        </div>

        <div className="bg-white p-5">
          <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[var(--color-ink-500)]">Target grade</p>
          {grades.target !== null ? (
            <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-[var(--color-primary-600)]">{grades.target}</p>
          ) : (
            <p className="mt-2 font-display text-xl font-extrabold text-[var(--color-ink-300)]">Not set</p>
          )}
          <p className="mt-1 text-xs leading-5 text-[var(--color-ink-500)]">What you are aiming for</p>
        </div>

        <div className="bg-white p-5">
          {grades.working === null || grades.target === null ? (
            <>
              <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[var(--color-ink-500)]">Set your grades</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-ink-500)]">
                Add your working and target grade so your Daily 5 and recommendations match where you are.
              </p>
              <Link to="/dashboard/settings" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary-600)] hover:underline">
                Set them now <ArrowRight size={15} />
              </Link>
            </>
          ) : (
            <>
              <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[var(--color-ink-500)]">Topic progress</p>
              <p className="mt-2 text-sm leading-6 text-[var(--color-ink-700)]">
                {grades.target > grades.working
                  ? `You are ${grades.target - grades.working} grade${grades.target - grades.working === 1 ? '' : 's'} from your target. Topic coverage is at ${overallPct}%.`
                  : `You are working at your target grade. Topic coverage is at ${overallPct}%.`}
              </p>
              <Link to="/dashboard/settings" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-primary-600)] hover:underline">
                Update grades <ArrowRight size={15} />
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Evidence tiles */}
      <section className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => {
          const inner = (
            <>
              <p className="text-xs font-extrabold uppercase tracking-[.12em] text-[var(--color-ink-500)]">{t.label}</p>
              <p className="mt-2 font-display text-3xl font-extrabold tabular-nums text-[var(--color-ink-900)]">{t.value}</p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-ink-500)]">{t.note}</p>
            </>
          );
          return t.href ? (
            <Link key={t.label} to={t.href} className="bg-white p-5 transition hover:bg-[var(--color-primary-50)]">{inner}</Link>
          ) : (
            <div key={t.label} className="bg-white p-5">{inner}</div>
          );
        })}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <div className="flex flex-col gap-5">

          {/* Continue where you left off */}
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 className="font-display text-lg font-extrabold text-[var(--color-ink-900)]">Continue where you left off</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {subjectProgress.map((s) => (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => goToSubject(s.slug)}
                  className="rounded-2xl border border-slate-200 p-5 text-left transition hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-50)]/40"
                >
                  <p className="text-sm font-extrabold text-[var(--color-ink-900)]">{s.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-ink-500)]">
                    {s.coveredTopics} of {s.totalTopics} topics covered
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[var(--color-primary-500)]" style={{ width: `${s.pct}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-bold tabular-nums text-[var(--color-ink-500)]">{s.pct}% complete</p>
                </button>
              ))}
            </div>
          </section>

          {/* Learning tools */}
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7">
            <h2 className="font-display text-lg font-extrabold text-[var(--color-ink-900)]">Your learning tools</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {tools.map((t) => (
                <Link
                  key={t.label}
                  to={t.href}
                  className={`feature-${t.tone} feature-tinted-surface feature-accent-border flex flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/70 feature-accent-text">
                    <t.icon size={19} />
                  </span>
                  <p className="mt-4 text-sm font-extrabold text-[var(--color-ink-900)]">{t.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-ink-600)]">{t.copy}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-5">

          {/* Syllabus progress */}
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-lg font-extrabold text-[var(--color-ink-900)]">Syllabus progress</h2>
            <div className="mt-5 flex items-center gap-5">
              <div className="relative h-24 w-24 shrink-0">
                <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-primary-50)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none" stroke="var(--color-primary-500)" strokeWidth="10"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - overallPct / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-display text-xl font-extrabold tabular-nums text-[var(--color-ink-900)]">{overallPct}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                {subjectProgress.map((s) => (
                  <div key={s.slug}>
                    <div className="flex justify-between text-xs font-semibold text-[var(--color-ink-500)]">
                      <span>{s.name.replace(/^GCSE\s+/, '')}</span>
                      <span className="tabular-nums">{s.pct}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[var(--color-primary-400)]" style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-5 text-xs leading-5 text-[var(--color-ink-500)]">
              Progress reflects a pattern of results over time, not any single answer.
            </p>
          </section>

          {/* Ask Archi — not built yet */}
          <section className="rounded-[1.75rem] border border-dashed border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2">
              <ArchiAvatar size={22} />
              <h2 className="text-sm font-extrabold text-[var(--color-ink-700)]">Ask Archi</h2>
              <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--color-ink-500)]">
                Coming soon
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--color-ink-500)]">
              Step-by-step help that starts with a hint, so you keep the thinking.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
