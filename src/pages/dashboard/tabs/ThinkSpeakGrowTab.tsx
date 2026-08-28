import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Shield, Sprout } from 'lucide-react';
import { useSubject } from '../DashboardLayout';
import {
  GROW_ACTIONS,
  THINK_OPTIONS,
  growthSummary,
  markActionCompleted,
  saveReflection,
  suggestAction,
  thinkPrompt,
  todayKey,
  todaysReflection,
  type ActionId,
  type ThinkChoice,
} from '../../../lib/tsg';

type Step = 'entry' | 'think' | 'speak' | 'grow' | 'done' | 'journey';

const PRIVACY = 'Your exact choices stay private. A linked parent or tutor may see general learning insights and the study action you choose.';
const NOT_A_SERVICE = 'Think. Speak. Grow. is a learning reflection. It is not monitored as a support or emergency service.';

export default function ThinkSpeakGrowTab() {
  const { subject } = useSubject();
  const navigate = useNavigate();
  const existing = todaysReflection();

  const [step, setStep] = useState<Step>(existing ? 'done' : 'entry');
  const [think, setThink] = useState<ThinkChoice | null>(existing?.think ?? null);
  const [action, setAction] = useState<ActionId | null>(existing?.action ?? null);
  const [completed, setCompleted] = useState(existing?.actionCompleted ?? false);

  const thinkOption = THINK_OPTIONS.find((o) => o.id === think) ?? null;
  const chosenAction = GROW_ACTIONS.find((a) => a.id === action) ?? null;
  // Without a completed Daily 5 to read from, the standard prompt applies.
  const prompt = thinkPrompt({});
  const suggested = think ? suggestAction({ think, score: 3, total: 5 }) : null;

  function finish(actionId: ActionId) {
    const option = THINK_OPTIONS.find((o) => o.id === think);
    if (!think || !option) return;
    saveReflection({
      date: todayKey(),
      subject,
      topic: null,
      think,
      speak: option.speak,
      action: actionId,
      actionCompleted: false,
    });
    setAction(actionId);
    setCompleted(false);
    setStep('done');
  }

  function doItNow() {
    if (!chosenAction) return;
    markActionCompleted(todayKey());
    setCompleted(true);
    if (chosenAction.href) navigate(chosenAction.href);
  }

  // ── My Growth Journey ──────────────────────────────────────────────────────
  if (step === 'journey') {
    const g = growthSummary();
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        <button type="button" onClick={() => setStep(existing ? 'done' : 'entry')}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]">
          <ArrowLeft size={16} /> Back
        </button>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[var(--shadow-soft)] sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[var(--feature-grow-strong)]">My Growth Journey</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-[var(--color-ink-900)]">Your growth this month</h1>

          <div className="mt-7 space-y-3">
            {[
              [`You retried a question after feedback`, g.retried],
              [`You asked for useful help`, g.askedHelp],
              [`You changed your strategy`, g.changedStrategy],
            ].map(([label, n]) => (
              <p key={String(label)} className="text-lg leading-8 text-[var(--color-ink-700)]">
                {label} <strong className="text-[var(--color-ink-900)]">{n} {n === 1 ? 'time' : 'times'}</strong>.
              </p>
            ))}
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
            {[
              ['Reflections completed', g.reflections],
              ['Actions selected', g.actionsChosen],
              ['Actions completed', g.actionsCompleted],
              ['Topics revisited', g.topicsRevisited],
            ].map(([label, n]) => (
              <div key={String(label)} className="bg-white p-4">
                <p className="font-display text-2xl font-extrabold text-[var(--color-ink-900)]">{n}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--color-ink-500)]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <PrivacyNote />
      </div>
    );
  }

  // ── Entry card ─────────────────────────────────────────────────────────────
  if (step === 'entry') {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-7 text-center shadow-[var(--shadow-soft-lg)] sm:p-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--feature-grow-bg)] text-[var(--feature-grow-strong)]">
            <Sprout size={26} />
          </span>
          <h1 className="mt-6 font-display text-3xl font-extrabold text-[var(--color-ink-900)]">Take one minute to reflect</h1>
          <p className="mx-auto mt-3 max-w-md text-base leading-7 text-[var(--color-ink-500)]">
            Think about how you approached today&apos;s questions and choose one useful next step.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => setStep('think')}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-7 font-bold text-white transition hover:bg-[var(--color-primary-700)]">
              Start Think. Speak. Grow. <ArrowRight size={18} />
            </button>
            <Link to="/dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 px-7 font-bold text-[var(--color-ink-700)] hover:bg-slate-50">
              Not now
            </Link>
          </div>
          <button type="button" onClick={() => setStep('journey')}
            className="mt-6 text-sm font-bold text-[var(--color-primary-600)] hover:underline">
            Open My Growth Journey
          </button>
        </section>
        <PrivacyNote />
      </div>
    );
  }

  // ── Step 1 · Think ─────────────────────────────────────────────────────────
  if (step === 'think') {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <StepShell step={1} name="Think">
          <h1 className="font-display text-2xl font-extrabold leading-snug text-[var(--color-ink-900)] sm:text-3xl">{prompt}</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-500)]">
            There is no perfect answer. Choose the response that is closest to what actually happened.
          </p>
          <div className="mt-6 grid gap-3">
            {THINK_OPTIONS.map((o) => (
              <button key={o.id} type="button" onClick={() => setThink(o.id)} aria-pressed={think === o.id}
                className={`flex min-h-14 items-center justify-between gap-4 rounded-2xl border p-4 text-left font-semibold transition ${
                  think === o.id
                    ? 'border-[var(--color-primary-400)] bg-[var(--color-primary-50)] ring-2 ring-[var(--color-primary-100)]'
                    : 'border-slate-200 bg-white hover:border-[var(--color-primary-200)]'
                }`}>
                {o.label}
                <span className={`h-5 w-5 shrink-0 rounded-full border-2 ${think === o.id ? 'border-[var(--color-primary-600)] bg-[var(--color-primary-600)]' : 'border-slate-300'}`} />
              </button>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-between gap-3">
            <Link to="/dashboard" className="text-sm font-bold text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]">Not now</Link>
            <button type="button" disabled={!think} onClick={() => setStep('speak')}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-7 font-bold text-white transition hover:bg-[var(--color-primary-700)] disabled:opacity-35">
              Continue to Speak <ArrowRight size={18} />
            </button>
          </div>
        </StepShell>
        <PrivacyNote />
      </div>
    );
  }

  // ── Step 2 · Speak ─────────────────────────────────────────────────────────
  if (step === 'speak' && thinkOption) {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <StepShell step={2} name="Speak">
          <p className="font-display text-lg font-extrabold text-[var(--color-ink-900)]">A useful thought to take forward</p>
          <p className="mt-1 text-sm text-[var(--color-ink-500)]">Say it aloud, whisper it or read it silently.</p>
          <blockquote className="mt-6 rounded-2xl border-l-4 border-[var(--color-primary-500)] bg-[var(--color-primary-50)] p-6">
            <p className="font-display text-xl font-extrabold leading-relaxed text-[var(--color-primary-800)]">{thinkOption.speak}</p>
          </blockquote>
          <div className="mt-7 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setStep('think')}
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]">
              <ArrowLeft size={16} /> Back
            </button>
            <button type="button" onClick={() => setStep('grow')}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-7 font-bold text-white transition hover:bg-[var(--color-primary-700)]">
              Take this thought with me <ArrowRight size={18} />
            </button>
          </div>
        </StepShell>
        <PrivacyNote />
      </div>
    );
  }

  // ── Step 3 · Grow ──────────────────────────────────────────────────────────
  if (step === 'grow') {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <StepShell step={3} name="Grow">
          <h1 className="font-display text-2xl font-extrabold text-[var(--color-ink-900)]">What is one useful next step?</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-500)]">
            Choose one small action. You do not need to fix everything today.
          </p>
          <div className="mt-6 grid gap-3">
            {GROW_ACTIONS.map((a) => (
              <button key={a.id} type="button" onClick={() => setAction(a.id)} aria-pressed={action === a.id}
                className={`flex min-h-14 items-center justify-between gap-3 rounded-2xl border p-4 text-left font-semibold transition ${
                  action === a.id
                    ? 'border-[var(--color-primary-400)] bg-[var(--color-primary-50)] ring-2 ring-[var(--color-primary-100)]'
                    : 'border-slate-200 bg-white hover:border-[var(--color-primary-200)]'
                }`}>
                <span>{a.label}</span>
                {suggested === a.id && (
                  <span className="shrink-0 rounded-full bg-[var(--feature-grow-bg)] px-3 py-1 text-xs font-extrabold text-[var(--feature-grow-strong)]">
                    Suggested
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-7 flex items-center justify-between gap-3">
            <button type="button" onClick={() => setStep('speak')}
              className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]">
              <ArrowLeft size={16} /> Back
            </button>
            <button type="button" disabled={!action} onClick={() => action && finish(action)}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-7 font-bold text-white transition hover:bg-[var(--color-primary-700)] disabled:opacity-35">
              Save my next step <Check size={18} />
            </button>
          </div>
        </StepShell>
        <PrivacyNote />
      </div>
    );
  }

  // ── Completion ─────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="overflow-hidden rounded-[1.75rem] bg-[var(--color-primary-900)] p-7 text-white shadow-[var(--shadow-soft-lg)] sm:p-10">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-success-400)] text-[var(--color-primary-900)]">
          <Check size={28} strokeWidth={3} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold">
          {completed ? 'You followed through' : 'Reflection complete'}
        </h1>
        <p className="mt-3 max-w-lg text-lg leading-8 text-white/70">
          {completed
            ? 'You reviewed the feedback and tried again independently.'
            : 'Growth does not always look like getting everything right. Sometimes it looks like knowing what to do next.'}
        </p>

        {chosenAction && (
          <div className="mt-7 rounded-2xl bg-white/10 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[.14em] text-white/55">Your next step</p>
            <p className="mt-2 font-display text-xl font-extrabold">{chosenAction.label}</p>
            {!chosenAction.href && chosenAction.pending && (
              <p className="mt-2 text-sm text-white/60">{chosenAction.pending}</p>
            )}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {!completed && chosenAction && (
            <button type="button" onClick={doItNow}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-400)] px-6 font-bold text-[var(--color-ink-900)]">
              Do this now <ArrowRight size={18} />
            </button>
          )}
          <Link to="/dashboard"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-6 font-bold hover:bg-white/5">
            Return to dashboard
          </Link>
          <button type="button" onClick={() => setStep('journey')}
            className="inline-flex min-h-12 items-center justify-center rounded-xl px-4 font-bold text-white/70 hover:text-white">
            My Growth Journey
          </button>
        </div>
      </section>
      <PrivacyNote />
    </div>
  );
}

function StepShell({ step, name, children }: { step: number; name: string; children: React.ReactNode }) {
  const steps = ['Think', 'Speak', 'Grow'];
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[var(--shadow-soft-lg)] sm:p-9">
      <div className="mb-6 flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 rounded-xl border px-3 py-2 ${
            i + 1 === step ? 'border-[var(--color-primary-300)] bg-[var(--color-primary-50)]' : 'border-slate-200 bg-slate-50'
          }`}>
            <p className={`text-xs font-extrabold uppercase tracking-wide ${i + 1 === step ? 'text-[var(--color-primary-700)]' : 'text-[var(--color-ink-300)]'}`}>
              {s}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[var(--feature-grow-strong)]">Step {step} · {name}</p>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PrivacyNote() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 text-[var(--color-primary-700)]">
        <Shield size={16} />
        <p className="text-xs font-extrabold uppercase tracking-wide">Who can see this?</p>
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--color-ink-500)]">{PRIVACY}</p>
      <p className="mt-2 text-xs leading-5 text-[var(--color-ink-300)]">{NOT_A_SERVICE}</p>
    </section>
  );
}
