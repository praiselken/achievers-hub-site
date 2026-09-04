/**
 * Choosing the five.
 *
 * Maths gets the client's mix: two at the student's level, one weak topic, one
 * spaced retrieval and one stretch, shuffled so nobody can tell which is which.
 * Economics gets her five exam skills in a fixed order, because there the order
 * is the structure and shuffling would destroy it.
 *
 * Every slot resolves through the fallback chain in D7. Subject, covered
 * content and tier are never relaxed to fill a gap; everything else gives way
 * in order, ending at the day-indexed questions she already authored.
 */

import type {
  Attempt, EconSlot, FallbackRung, Question, Rng, Selection, SlotKind, Student,
} from './types';
import { coversGrade, isAccessible, isWeak, stretchGrade } from './grading';
import { dueTopicIds, isDue } from './spacing';

/** Below this many attempts the platform does not know enough to personalise,
 *  so the student gets the authored default set (D1). Needs the client's
 *  confirmation; she gave the principle but not the number. */
export const PERSONALISE_AFTER_ATTEMPTS = 20;

const ECON_SLOTS: EconSlot[] = [
  'multiple_choice',
  'definition',
  'calculate',
  'data_or_diagram',
  'explain_chain',
];

export function shouldPersonalise(history: Attempt[]): boolean {
  return history.length >= PERSONALISE_AFTER_ATTEMPTS;
}

/** Deterministic PRNG so a shuffle can be reproduced in a test. */
export function seededRng(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface Intent {
  slot: SlotKind;
  grade: number;
  /** Topics this slot would rather use, best first. */
  preferred: string[];
  econSlot?: EconSlot;
}

interface Context {
  student: Student;
  history: Attempt[];
  today: string;
  used: Set<string>;
}

function attemptsForQuestion(history: Attempt[], questionId: string): Attempt[] {
  return history.filter((a) => a.questionId === questionId);
}

/** Walk the rungs of D7 in order and take the first question that fits. */
const RUNGS: FallbackRung[] = [
  'ideal',
  'same_topic_skill',
  'same_topic',
  'other_due_topic',
  'default_daily5',
];

function matches(q: Question, intent: Intent, rung: FallbackRung, ctx: Context): boolean {
  if (ctx.used.has(q.id)) return false;
  if (!isAccessible(q, ctx.student)) return false;

  // Economics keeps its slot structure until the very last resort.
  if (intent.econSlot && rung !== 'default_daily5' && q.econSlot !== intent.econSlot) return false;

  const onPreferredTopic = intent.preferred.length === 0 || intent.preferred.includes(q.topicId);
  const attempts = attemptsForQuestion(ctx.history, q.id);

  switch (rung) {
    case 'ideal':
      return onPreferredTopic && coversGrade(q, intent.grade) && isDue(attempts, ctx.today);
    case 'same_topic_skill':
      return (
        onPreferredTopic &&
        (coversGrade(q, intent.grade) ||
          coversGrade(q, intent.grade - 1) ||
          coversGrade(q, intent.grade + 1)) &&
        isDue(attempts, ctx.today)
      );
    case 'same_topic':
      return onPreferredTopic;
    case 'other_due_topic':
      return coversGrade(q, intent.grade) || coversGrade(q, intent.grade - 1);
    case 'default_daily5':
      return q.isDefault === true;
  }
}

function resolve(intent: Intent, pool: Question[], ctx: Context): Selection | null {
  for (const rung of RUNGS) {
    const hit = pool.find((q) => matches(q, intent, rung, ctx));
    if (hit) {
      ctx.used.add(hit.id);
      return { question: hit, slot: intent.slot, via: rung };
    }
  }
  return null;
}

/** Topics the student is weak on, weakest signal first. */
export function weakTopics(history: Attempt[]): string[] {
  const topics = [...new Set(history.map((a) => a.topicId))];
  return topics.filter((t) => isWeak(history, t));
}

function mathsIntents(student: Student, history: Attempt[], today: string): Intent[] {
  const weak = weakTopics(history);
  const due = dueTopicIds(history, today);
  return [
    { slot: 'at_level', grade: student.workingGrade, preferred: [] },
    { slot: 'at_level', grade: student.workingGrade, preferred: [] },
    { slot: 'weak_topic', grade: student.workingGrade, preferred: weak },
    { slot: 'retrieval', grade: student.workingGrade, preferred: due },
    { slot: 'stretch', grade: stretchGrade(student), preferred: [] },
  ];
}

function econIntents(student: Student, history: Attempt[], today: string): Intent[] {
  const weak = weakTopics(history);
  const due = dueTopicIds(history, today);
  // Topics still respond to strengths, weaknesses and retrieval, but the slot
  // structure is what fixes the order.
  const preferred = [...new Set([...weak, ...due])];
  return ECON_SLOTS.map((econSlot) => ({
    slot: econSlot,
    grade: student.workingGrade,
    preferred,
    econSlot,
  }));
}

export interface SelectOptions {
  today: string;
  rng?: Rng;
  /** Force the authored default set, whatever the history says. Free plans get
   *  the default Daily 5 (D1). */
  forceDefault?: boolean;
}

/**
 * The five questions for one student on one day. Returns fewer than five only
 * when the pool genuinely cannot supply them, which is the signal the coverage
 * view exists to surface.
 */
export function selectDailyFive(
  student: Student,
  pool: Question[],
  history: Attempt[],
  options: SelectOptions,
): Selection[] {
  const { today, rng = Math.random, forceDefault = false } = options;
  const accessible = pool.filter((q) => isAccessible(q, student));

  if (forceDefault || !shouldPersonalise(history)) {
    return defaultFive(accessible);
  }

  const ctx: Context = { student, history, today, used: new Set() };
  const intents =
    student.subject === 'economics'
      ? econIntents(student, history, today)
      : mathsIntents(student, history, today);

  const picked = intents
    .map((intent) => resolve(intent, accessible, ctx))
    .filter((s): s is Selection => s !== null);

  // Maths hides which slot is which. Economics keeps its order, because the
  // sequence of skills is the point.
  return student.subject === 'economics' ? picked : shuffle(picked, rng);
}

/** The authored day-indexed set, for free students and anyone the platform does
 *  not yet know. Falls back to whatever is accessible if none are marked.
 *  Callers pass a pool already narrowed to today's date. */
function defaultFive(accessible: Question[]): Selection[] {
  const defaults = accessible.filter((q) => q.isDefault);
  const source = defaults.length > 0 ? defaults : accessible;
  return source.slice(0, 5).map((question) => ({
    question,
    slot: 'at_level' as SlotKind,
    via: 'default_daily5' as FallbackRung,
  }));
}
