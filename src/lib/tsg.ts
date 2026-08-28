/**
 * Think. Speak. Grow. — data model and copy.
 *
 * Follows the client's written specification (Aug 2026): structured, pre-set
 * options only. There is deliberately no free-text input anywhere in this
 * feature, which is what keeps it outside safeguarding-monitoring scope.
 */

export type ThinkChoice =
  | 'kept_trying'
  | 'used_help'
  | 'frustrated'
  | 'stopped_returned'
  | 'unsure';

export type ActionId =
  | 'worked_example'
  | 'ask_archi'
  | 'accessible_question'
  | 'retry_incorrect'
  | 'revision_plan'
  | 'quick_lesson'
  | 'ask_tutor'
  | 'tomorrow';

export interface ThinkOption {
  id: ThinkChoice;
  label: string;
  /** The Speak statement mapped 1:1 to this choice. */
  speak: string;
  /** Behaviour this choice evidences, counted in the Growth Journey. */
  signal: 'retried' | 'asked_help' | 'changed_strategy' | null;
}

export const THINK_OPTIONS: ThinkOption[] = [
  {
    id: 'kept_trying',
    label: 'I kept trying.',
    speak: 'Keeping going gave me useful information, even when I did not get every answer right.',
    signal: 'retried',
  },
  {
    id: 'used_help',
    label: 'I used a hint or asked for help.',
    speak: 'Using help effectively is part of learning. I can use the explanation and then try independently.',
    signal: 'asked_help',
  },
  {
    id: 'frustrated',
    label: 'I became frustrated.',
    speak: 'Feeling frustrated does not mean I have failed. I can slow down, identify the missed step and try again.',
    signal: null,
  },
  {
    id: 'stopped_returned',
    label: 'I stopped and came back.',
    speak: 'Taking a useful pause can help me return with a clearer strategy.',
    signal: 'changed_strategy',
  },
  {
    id: 'unsure',
    label: 'I was not sure what to do.',
    speak: 'Not knowing the next step is a signal to use an example, a hint or a question.',
    signal: null,
  },
];

export interface GrowAction {
  id: ActionId;
  label: string;
  /** Where the action actually goes. Null where the destination isn't built. */
  href: string | null;
  /** Shown when there is nowhere to send the student yet. */
  pending?: string;
}

export const GROW_ACTIONS: GrowAction[] = [
  { id: 'worked_example', label: 'Review one worked example.', href: '/dashboard/topics' },
  { id: 'ask_archi', label: 'Ask Archi to explain the first step.', href: null, pending: 'Archi arrives with the AI tutor.' },
  { id: 'accessible_question', label: 'Try one accessible question first.', href: '/dashboard/topics' },
  { id: 'retry_incorrect', label: 'Retry an incorrect question.', href: '/dashboard/daily5' },
  { id: 'revision_plan', label: 'Add the topic to my revision plan.', href: null, pending: 'Saved — the revision plan is being built.' },
  { id: 'quick_lesson', label: 'Complete a Quick Lesson.', href: null, pending: 'Saved — Quick Lessons are being built.' },
  { id: 'ask_tutor', label: 'Ask my tutor for help.', href: null, pending: 'Saved — tutor requests are being built.' },
  { id: 'tomorrow', label: 'Come back to the topic tomorrow.', href: null, pending: 'Saved to tomorrow’s study plan.' },
];

/** Personalised Think prompts, chosen from what actually happened in the session. */
export function thinkPrompt(ctx: {
  improved?: boolean;
  repeatedError?: boolean;
  usedHint?: boolean;
  stretchAttempted?: boolean;
}): string {
  if (ctx.improved) return 'You improved your percentage score today. What helped you make progress?';
  if (ctx.repeatedError) return 'You made the same error twice. What happened when you noticed it?';
  if (ctx.usedHint) return 'You used a hint and then answered independently. How did the hint help?';
  if (ctx.stretchAttempted) return 'You attempted a question above your usual level. How did you respond when it became difficult?';
  return 'Today’s questions became more difficult as you progressed. How did you respond?';
}

/** Recommend one action from the session, per the spec's selection inputs. */
export function suggestAction(ctx: { think: ThinkChoice; score: number; total: number }): ActionId {
  switch (ctx.think) {
    case 'unsure': return 'worked_example';
    case 'used_help': return 'accessible_question';
    case 'frustrated': return 'accessible_question';
    case 'stopped_returned': return 'tomorrow';
    case 'kept_trying':
    default:
      return ctx.score < ctx.total ? 'retry_incorrect' : 'worked_example';
  }
}

export interface Reflection {
  date: string;            // YYYY-MM-DD
  subject: string;
  topic: string | null;
  think: ThinkChoice;
  speak: string;
  action: ActionId;
  actionCompleted: boolean;
}

const KEY = 'tsg:reflections';

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadReflections(): Reflection[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as Reflection[];
  } catch {
    return [];
  }
}

function save(all: Reflection[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage unavailable — the reflection simply isn't kept.
  }
}

export function saveReflection(r: Reflection) {
  const all = loadReflections().filter((x) => x.date !== r.date);
  save([...all, r]);
}

export function markActionCompleted(date: string) {
  save(loadReflections().map((r) => (r.date === date ? { ...r, actionCompleted: true } : r)));
}

export function todaysReflection(): Reflection | null {
  return loadReflections().find((r) => r.date === todayKey()) ?? null;
}

/** Counts behind "Your growth this month". */
export function growthSummary() {
  const month = todayKey().slice(0, 7);
  const inMonth = loadReflections().filter((r) => r.date.startsWith(month));
  const signalOf = (t: ThinkChoice) => THINK_OPTIONS.find((o) => o.id === t)?.signal ?? null;
  return {
    reflections: inMonth.length,
    actionsChosen: inMonth.length,
    actionsCompleted: inMonth.filter((r) => r.actionCompleted).length,
    topicsRevisited: new Set(inMonth.map((r) => r.topic).filter(Boolean)).size,
    retried: inMonth.filter((r) => signalOf(r.think) === 'retried').length,
    askedHelp: inMonth.filter((r) => signalOf(r.think) === 'asked_help').length,
    changedStrategy: inMonth.filter((r) => signalOf(r.think) === 'changed_strategy').length,
  };
}
