import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  Check,
  Clock3,
  Eye,
  Flag,
  Lightbulb,
  PenLine,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useSubject } from '../DashboardLayout';
import { awardXp, checkAndAwardAchievements } from '../../../lib/xp';
import { isDemoMode } from '../../../lib/demoMode';
import { DEMO_DAILY_QUESTIONS } from '../../../lib/demoData';
import { Workbook } from '../../../components/workbook/Workbook';

type Phase = 'intro' | 'question' | 'complete';

interface Question {
  id: string;
  question_number: number;
  question: string;
  answer: string;
  marks: number | null;
  topic_title: string | null;
  difficulty: string | null;
  skill_type: string | null;
  solution_steps: string | null;
  hints: string | null;
}

// The mix behind each slot — this is what the "Why this question?" panel explains.
const Q_LABELS = [
  { label: 'At your level' },
  { label: 'At your level' },
  { label: 'At your level' },
  { label: 'Weak topic focus' },
  { label: 'Stretch' },
];

export default function DailyFiveTab() {
  const { subject } = useSubject();
  const [phase, setPhase]           = useState<Phase>('intro');
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [current, setCurrent]       = useState(0);
  const [revealed, setRevealed]     = useState(false);
  const [answers, setAnswers]       = useState<(boolean | null)[]>([]);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [hintOpen, setHintOpen]     = useState(false);
  const [workbookOpen, setWorkbookOpen] = useState(false);
  const [flagged, setFlagged]       = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemoMode()) {
        const qs = DEMO_DAILY_QUESTIONS[subject] ?? [];
        setAlreadyDone(false);
        setQuestions(qs);
        setAnswers(new Array(qs.length).fill(null));
        setLoading(false);
        return;
      }
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const today = new Date().toISOString().slice(0, 10);
      const { data: done } = await supabase
        .from('daily_sessions').select('id')
        .eq('user_id', user.id).eq('subject', subject)
        .gte('completed_at', today).limit(1);

      if (done && done.length > 0) { setAlreadyDone(true); setLoading(false); return; }
      setAlreadyDone(false);

      // Load today's questions for this subject
      const now = new Date();
      const month = now.toLocaleString('en-GB', { month: 'long' });
      const day   = now.getDate();

      const { data: qs } = await supabase
        .from('questions').select('*')
        .eq('subject', subject).eq('month', month).eq('day', day)
        .order('question_number');

      setQuestions(qs ?? []);
      setAnswers(new Array(qs?.length ?? 0).fill(null));
      setLoading(false);
    }
    load();
  }, [subject]);

  function goToQuestion(next: number) {
    setCurrent(next);
    setRevealed(false);
    setHintOpen(false);
    setWorkbookOpen(false);
  }

  function startSession() {
    setAnswers(new Array(questions.length).fill(null));
    goToQuestion(0);
    setPhase('question');
  }

  async function finish(finalAnswers: (boolean | null)[]) {
    if (isDemoMode() || !supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const score = finalAnswers.filter(Boolean).length;
    const { data: session } = await supabase.from('daily_sessions').insert({
      user_id: user.id, subject, score, total: questions.length,
      questions: questions.map((q, i) => ({ id: q.id, correct: finalAnswers[i] })),
    }).select('id').single();

    if (session) {
      await awardXp(user.id, 'daily5', session.id, 10);
      if (score > 0) await awardXp(user.id, 'daily5_correct', session.id, score * 2);
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', user.id).single();
    if (!streak) {
      await supabase.from('streaks').insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_active: today });
    } else {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = streak.last_active === yesterday.toISOString().slice(0, 10);
      const newCurrent = wasYesterday ? streak.current_streak + 1 : 1;
      await supabase.from('streaks').update({
        current_streak: newCurrent,
        longest_streak: Math.max(newCurrent, streak.longest_streak),
        last_active: today,
      }).eq('user_id', user.id);
    }

    await checkAndAwardAchievements(user.id);
  }

  function handleSelfMark(correct: boolean) {
    const updated = [...answers];
    updated[current] = correct;
    setAnswers(updated);
  }

  function advance() {
    if (current === questions.length - 1) {
      finish(answers);
      setPhase('complete');
    } else {
      goToQuestion(current + 1);
    }
  }

  const score = answers.filter(Boolean).length;

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><p className="text-slate-400">Loading…</p></div>;
  }

  if (alreadyDone) {
    return (
      <section className="overflow-hidden rounded-[2rem] bg-[var(--color-primary-900)] p-8 text-white shadow-[var(--shadow-soft-lg)] sm:p-12">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-success-400)] text-[var(--color-primary-900)]">
          <Check size={29} strokeWidth={3} />
        </span>
        <p className="mt-7 text-xs font-extrabold uppercase tracking-[.16em] text-white/55">Daily 5 complete</p>
        <h1 className="mt-2 max-w-xl font-display text-4xl font-extrabold leading-tight">Today&apos;s session is done.</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-white/70">
          Come back tomorrow to keep your streak going, or keep working on a topic in the meantime.
        </p>
        <Link to="/dashboard/topics" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-accent-400)] px-6 font-bold text-[var(--color-ink-900)]">
          Practise a topic <ArrowRight size={18} />
        </Link>
      </section>
    );
  }

  if (questions.length === 0) {
    return (
      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-10 text-center shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-xl font-extrabold text-[var(--color-ink-900)]">No questions for today</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--color-ink-500)]">
          Today&apos;s Daily 5 questions haven&apos;t been uploaded yet. Check back soon.
        </p>
      </section>
    );
  }

  if (phase === 'intro') {
    return (
      <section className="mx-auto max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-7 text-center shadow-[var(--shadow-soft-lg)] sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--feature-daily-bg)] text-[var(--feature-daily-strong)]">
          <Sparkles size={26} />
        </span>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[.14em] text-[var(--feature-daily-strong)]">Today&apos;s focus</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-[var(--color-ink-900)]">Your Daily 5</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-ink-500)]">
          <span className="capitalize">{subject}</span> · {questions.length} questions · Work it out, reveal the answer, then mark yourself honestly.
        </p>
        <ul className="mt-7 grid gap-2 text-left">
          {questions.map((q, i) => (
            <li key={q.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-extrabold text-slate-400">{i + 1}</span>
              <span className="text-sm font-bold text-[var(--color-ink-700)]">{q.topic_title ?? `Question ${i + 1}`}</span>
              <span className="ml-auto text-xs font-bold text-[var(--color-ink-500)]">{(Q_LABELS[i] ?? Q_LABELS[0]).label}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={startSession}
          className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-7 font-bold text-white shadow-sm transition hover:bg-[var(--color-primary-700)]"
        >
          Start Daily 5 <ArrowRight size={18} />
        </button>
      </section>
    );
  }

  if (phase === 'complete') {
    const wrongTopics = questions
      .filter((_, i) => !answers[i] && questions[i].topic_title)
      .map(q => q.topic_title!)
      .filter((t, i, a) => a.indexOf(t) === i);

    return (
      <section className="overflow-hidden rounded-[2rem] bg-[var(--color-primary-900)] text-white shadow-[var(--shadow-soft-lg)]">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.2fr_.8fr] lg:p-12">
          <div>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-success-400)] text-[var(--color-primary-900)]">
              <Check size={29} strokeWidth={3} />
            </span>
            <p className="mt-7 text-xs font-extrabold uppercase tracking-[.16em] text-white/55">Daily 5 complete</p>
            <h1 className="mt-2 max-w-xl font-display text-4xl font-extrabold leading-tight sm:text-5xl">
              Five questions done. That&apos;s today&apos;s momentum.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/70">
              You scored {score} out of {questions.length} in {subject}. Your answers have refined what the Hub recommends next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard/topics" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-accent-400)] px-6 font-bold text-[var(--color-ink-900)]">
                {wrongTopics.length > 0 ? 'Revise the topics you missed' : 'Practise your next topic'} <ArrowRight size={18} />
              </Link>
              <Link to="/dashboard/papers" className="inline-flex min-h-12 items-center rounded-xl border border-white/20 px-6 font-bold hover:bg-white/5">
                Try a past paper
              </Link>
            </div>
            {wrongTopics.length > 0 && (
              <p className="mt-4 text-sm text-white/60">
                Worth another look: {wrongTopics.slice(0, 3).join(', ')}{wrongTopics.length > 3 ? ` and ${wrongTopics.length - 3} more` : ''}.
              </p>
            )}
          </div>
          <aside className="rounded-3xl bg-white/10 p-6 sm:p-7">
            <p className="text-sm font-bold text-white/60">Today&apos;s evidence</p>
            <p className="mt-3 font-display text-6xl font-extrabold">{score}<span className="text-3xl text-white/40">/{questions.length}</span></p>
            <div className="mt-7 space-y-3">
              {questions.map((item, itemIndex) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${answers[itemIndex] ? 'bg-[var(--color-success-400)] text-[var(--color-primary-900)]' : 'bg-white/15 text-white/70'}`}>
                    {answers[itemIndex] ? <Check size={15} strokeWidth={3} /> : <X size={14} />}
                  </span>
                  <span className="min-w-0 truncate text-sm font-semibold">{item.topic_title ?? `Question ${itemIndex + 1}`}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    );
  }

  const q = questions[current];
  const qMeta = Q_LABELS[current] ?? Q_LABELS[0];
  const marked = answers[current];
  const isFlagged = flagged.includes(q.id);

  // Split on newlines or "Step N" so uploaded working renders as numbered steps.
  const solutionSteps: string[] = q.solution_steps
    ? q.solution_steps
        .split(/\n|(?=Step \d)/i)
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  return (
    <>
      <header className="rounded-[1.75rem] border border-slate-200 bg-white px-4 py-4 shadow-[var(--shadow-soft)] sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--feature-daily-bg)] text-[var(--feature-daily-strong)]">
              <Sparkles size={21} />
            </span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[var(--feature-daily-strong)]">Today&apos;s focus</p>
              <h1 className="font-display text-2xl font-extrabold">Your Daily 5</h1>
            </div>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-[var(--color-ink-500)]">
            <Clock3 size={16} /> {Math.max(2, (questions.length - current) * 2)} min left
          </span>
        </div>
        <nav className="mt-5 grid gap-2" style={{ gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))` }} aria-label="Daily 5 progress">
          {questions.map((item, itemIndex) => {
            const itemResult = answers[itemIndex];
            const active = itemIndex === current;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => itemIndex < current && goToQuestion(itemIndex)}
                disabled={itemIndex > current}
                aria-current={active ? 'step' : undefined}
                aria-label={`Question ${itemIndex + 1}: ${item.topic_title ?? ''}`}
                className={`group flex min-w-0 items-center gap-2 rounded-xl border px-2 py-2.5 text-left transition sm:px-3 ${
                  active
                    ? 'border-[var(--color-primary-300)] bg-[var(--color-primary-50)]'
                    : itemResult !== null
                      ? 'border-[var(--color-success-300)] bg-[var(--color-success-50)]'
                      : 'border-slate-200 bg-slate-50'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${active ? 'bg-[var(--color-primary-600)] text-white' : itemResult !== null ? 'bg-[var(--color-success-400)] text-white' : 'bg-white text-slate-400'}`}>
                  {itemResult !== null ? <Check size={14} strokeWidth={3} /> : itemIndex + 1}
                </span>
                <span className={`hidden truncate text-xs font-bold md:block ${active ? 'text-[var(--color-primary-700)]' : 'text-[var(--color-ink-500)]'}`}>
                  {item.topic_title ?? `Q${itemIndex + 1}`}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_270px]">
        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[var(--shadow-soft-lg)]">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--feature-daily-bg)] px-3 py-1 text-xs font-extrabold text-[var(--feature-daily-strong)]">{qMeta.label}</span>
                {q.topic_title && (
                  <span className="rounded-full bg-[var(--color-primary-50)] px-3 py-1 text-xs font-extrabold text-[var(--color-primary-600)]">{q.topic_title}</span>
                )}
                {q.marks != null && (
                  <span className="text-xs font-bold text-[var(--color-ink-500)]">{q.marks} {q.marks === 1 ? 'mark' : 'marks'}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFlagged((value) => value.includes(q.id) ? value.filter((id) => id !== q.id) : [...value, q.id])}
                aria-pressed={isFlagged}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${isFlagged ? 'bg-rose-50 text-rose-700' : 'text-[var(--color-ink-500)] hover:bg-slate-50'}`}
              >
                <Flag size={15} fill={isFlagged ? 'currentColor' : 'none'} /> {isFlagged ? 'Flagged' : 'Flag for review'}
              </button>
            </div>
            <h2 className="mt-5 max-w-4xl font-display text-2xl font-extrabold leading-snug text-[var(--color-ink-900)] sm:text-3xl">{q.question}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink-500)]">
              {revealed ? 'Compare your working with the model answer, then mark yourself.' : 'Work it out on paper or in the working space, then reveal the answer.'}
            </p>
          </div>

          <div className="min-h-[410px] bg-[#fcfcfd] p-5 sm:p-8">
            {!revealed ? (
              workbookOpen ? (
                <Workbook
                  open
                  onClose={() => setWorkbookOpen(false)}
                  storageKey={`daily5:${q.id}`}
                  title={q.topic_title ? `Daily 5 — ${q.topic_title}` : 'Daily 5'}
                />
              ) : (
                <div className="flex min-h-56 max-w-2xl flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]"><PenLine size={22} /></span>
                  <p className="mt-4 font-display text-lg font-extrabold text-[var(--color-ink-900)]">Work it out first</p>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-ink-500)]">
                    Open the workbook for squared paper, a ruler, a protractor and a compass.
                  </p>
                  <button
                    type="button"
                    onClick={() => setWorkbookOpen(true)}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-primary-200)] bg-white px-5 text-sm font-bold text-[var(--color-primary-700)] transition hover:bg-[var(--color-primary-50)]"
                  >
                    <PenLine size={16} /> Open workbook
                  </button>
                </div>
              )
            ) : (
              <div className="max-w-3xl space-y-4">
                <div className="overflow-hidden rounded-2xl border border-[var(--color-success-300)]">
                  <div className="flex items-center gap-2 bg-[var(--color-success-50)] px-5 py-3">
                    <Check size={16} strokeWidth={3} className="text-[var(--color-success-600)]" />
                    <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-success-600)]">Model answer</p>
                  </div>
                  <div className="bg-white px-5 py-4">
                    <p className="text-sm leading-7 text-[var(--color-ink-700)]">{q.answer}</p>
                  </div>
                </div>

                {solutionSteps.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-[var(--color-primary-200)]">
                    <div className="flex items-center gap-2 bg-[var(--color-primary-50)] px-5 py-3">
                      <PenLine size={16} className="text-[var(--color-primary-600)]" />
                      <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-primary-600)]">Step-by-step working</p>
                    </div>
                    <div className="flex flex-col gap-3 bg-white px-5 py-4">
                      {solutionSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-600)] text-xs font-bold text-white">{i + 1}</span>
                          <p className="text-sm leading-7 text-[var(--color-ink-700)]">{step.replace(/^step\s*\d+[:\s]*/i, '')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {marked === null && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-extrabold text-[var(--color-ink-700)]">How did you do?</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => handleSelfMark(true)}
                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-[var(--color-success-300)] bg-[var(--color-success-50)] font-bold text-[var(--color-success-600)] transition hover:bg-[var(--color-success-100)]"
                      >
                        <Check size={17} strokeWidth={3} /> I got it right
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelfMark(false)}
                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 font-bold text-amber-800 transition hover:bg-amber-100"
                      >
                        <RotateCcw size={16} /> Not this time
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {marked !== null && (
              <div className={`mt-5 max-w-4xl rounded-2xl border p-5 ${marked ? 'border-[var(--color-success-300)] bg-[var(--color-success-50)]' : 'border-amber-200 bg-amber-50'}`} role="status">
                <div className="flex gap-3">
                  <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${marked ? 'bg-[var(--color-success-400)] text-white' : 'bg-amber-400 text-amber-950'}`}>
                    {marked ? <Check size={17} strokeWidth={3} /> : <RotateCcw size={16} />}
                  </span>
                  <div>
                    <p className="font-extrabold">{marked ? 'That’s right' : 'Let’s take another look'}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-ink-700)]">
                      {marked
                        ? 'Logged as secure. This feeds into what the Hub recommends next.'
                        : `Noted${q.topic_title ? ` against ${q.topic_title}` : ''}. We'll bring this topic back into your practice.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <footer className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <button
              type="button"
              disabled={current === 0}
              onClick={() => goToQuestion(current - 1)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-[var(--color-ink-500)] hover:bg-slate-50 disabled:opacity-30"
            >
              <ArrowLeft size={17} /> Previous
            </button>
            {!revealed ? (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-7 font-bold text-white shadow-sm transition hover:bg-[var(--color-primary-700)]"
              >
                Reveal answer <Eye size={18} />
              </button>
            ) : (
              <button
                type="button"
                disabled={marked === null}
                onClick={advance}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-7 font-bold text-white shadow-sm transition hover:bg-[var(--color-primary-700)] disabled:cursor-not-allowed disabled:opacity-35"
              >
                {current === questions.length - 1 ? 'See my results' : 'Next question'} <ArrowRight size={18} />
              </button>
            )}
          </footer>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-soft)]">
            <p className="px-2 text-xs font-extrabold uppercase tracking-[.14em] text-[var(--color-ink-500)]">Question tools</p>
            <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-1">
              <ToolButton icon={<Lightbulb size={18} />} label="Show a hint" disabled={!q.hints} active={hintOpen} onClick={() => setHintOpen((value) => !value)} />
              <ToolButton icon={<PenLine size={18} />} label="Workbook" active={workbookOpen} onClick={() => setWorkbookOpen(true)} />
              <ToolButton icon={<Calculator size={18} />} label="Calculator" note="Allowed" onClick={() => undefined} />
              <ToolButton icon={<BookOpen size={18} />} label="Formula sheet" onClick={() => undefined} />
            </div>
            {hintOpen && q.hints && (
              <div className="mt-3 rounded-2xl bg-[var(--feature-daily-bg)] p-4 text-sm leading-6 text-[var(--color-ink-700)]">
                <p className="font-extrabold text-[var(--feature-daily-strong)]">One hint</p>
                <p className="mt-1">{q.hints}</p>
              </div>
            )}
          </section>
          <section className="rounded-3xl bg-[var(--color-primary-900)] p-5 text-white">
            <div className="flex items-center gap-2 text-[var(--color-accent-300)]">
              <BarChart3 size={18} /><span className="text-xs font-extrabold uppercase tracking-wide">Why this question?</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Chosen from your recent evidence to balance retrieval, a weaker topic and one stretch question.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}

function ToolButton({ icon, label, note, active, disabled, onClick }: {
  icon: React.ReactNode;
  label: string;
  note?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]' : 'hover:bg-slate-50'}`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-[var(--color-primary-600)] text-white' : 'bg-slate-100 text-[var(--color-ink-500)]'}`}>{icon}</span>
      <span className="min-w-0 flex-1">{label}</span>
      {note && <span className="hidden text-[10px] text-[var(--color-success-600)] xl:block">{note}</span>}
    </button>
  );
}
