/**
 * Exam questions for a Topic Hub topic, from the `question_bank` table.
 *
 * Deliberately not the `questions` table: that one is Daily 5, keyed on
 * month/day/number. This is the topic-organised bank — ~29,000 maths questions
 * seeded by scripts/seed-question-bank.mjs, with no calendar position at all.
 *
 * Two things about this data drive the whole module:
 *
 * 1. **Over a third of the bank is unanswerable as it stands.** 10,648 rows set
 *    `needs_image` or `needs_table`, naming a diagram that was never drawn.
 *    Those are excluded here rather than shown as a question with a missing
 *    figure. That is the single largest content gap on the project.
 *
 * 2. **The two tables disagree about how a topic is written.** `topics.name`
 *    says "Algebra: changing the subject"; `question_bank.topic` says "Algebra
 *    changing the subject", and elsewhere the difference is an en-dash against
 *    a hyphen. Matching the strings exactly finds questions for only 75 of the
 *    489 maths topics — and silently shows "none yet" for the other 414. See
 *    `topicMatches` for how that is resolved.
 */

import { supabase } from './supabase';
import { isDemoMode } from './demoMode';
import { DEMO_EXAM_QUESTIONS } from './demoData';

export interface ExamQuestion {
  id: string;
  question: string;
  answer: string | null;
  hint: string | null;
  solutionSteps: string | null;
  /** What the question tests, e.g. "Solve a two-step linear inequality". */
  skill: string | null;
  estimatedGrade: number | null;
  calculator: 'calculator' | 'non_calculator' | 'either' | null;
  sourceRef: string | null;
}

/* ------------------------------------------------------------------ *
 * Matching a topic to its questions
 * ------------------------------------------------------------------ */

/**
 * Both sides of the comparison, reduced to the letters and digits that actually
 * carry the meaning. "Algebra: changing the subject" and "Algebra changing the
 * subject" both become "algebra changing the subject".
 */
function normaliseTopic(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

/**
 * An ILIKE pattern that is guaranteed to match every row this topic should
 * match, by replacing each run of punctuation and spacing with a wildcard.
 *
 * It is a *superset*, not the answer: `Trigonometry%sine%graph` also matches
 * "Trigonometry cosine graph", and `Circles%area` also matches "Circles segment
 * area". Across the real bank this over-matches on 29 of 489 topics and misses
 * on none — so it works as a cheap server-side filter that `topicMatches` then
 * makes exact. Sending the wrong questions to a student would be worse than
 * sending none, so the second check is not optional.
 */
function ilikePattern(topicName: string): string {
  return topicName.trim().replace(/[^a-zA-Z0-9]+/g, '%');
}

/** The authoritative check, applied to whatever the pattern query returned. */
function topicMatches(topicName: string, bankTopic: string): boolean {
  return normaliseTopic(topicName) === normaliseTopic(bankTopic);
}

/* ------------------------------------------------------------------ *
 * Loading
 * ------------------------------------------------------------------ */

interface BankRow {
  id: string;
  topic: string;
  question: string;
  answer: string | null;
  hint: string | null;
  solution_steps: string | null;
  skill: string | null;
  estimated_grade: number | null;
  calculator: string | null;
  source_ref: string | null;
  needs_image: boolean;
  needs_table: boolean;
}

// One unbroken literal on purpose: supabase-js parses this string at the type
// level, and a concatenation defeats it — the rows then come back typed as
// GenericStringError[] and every field access has to be cast away.
const COLUMNS = 'id, topic, question, answer, hint, solution_steps, skill, estimated_grade, calculator, source_ref, needs_image, needs_table';

const CALCULATOR_VALUES = ['calculator', 'non_calculator', 'either'] as const;

function fromRow(row: BankRow): ExamQuestion {
  const calculator = CALCULATOR_VALUES.find(v => v === row.calculator) ?? null;
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    hint: row.hint,
    solutionSteps: row.solution_steps,
    skill: row.skill,
    estimatedGrade: row.estimated_grade,
    calculator,
    sourceRef: row.source_ref,
  };
}

/**
 * Every usable exam question for one topic, in the order the source sheet had
 * them. Returns an empty array rather than throwing — a topic with no questions
 * and a database that cannot be reached look the same to the student, and both
 * are handled by the same "nothing here yet" state.
 *
 * The bank is public-select, so this works for a signed-out preview too.
 */
export async function loadExamQuestions(
  subject: string,
  topicName: string,
): Promise<ExamQuestion[]> {
  if (isDemoMode()) return DEMO_EXAM_QUESTIONS[topicName] ?? [];
  if (!supabase) return [];

  const pattern = ilikePattern(topicName);
  if (!pattern.replace(/%/g, '')) return [];

  try {
    const { data, error } = await supabase
      .from('question_bank')
      .select(COLUMNS)
      .eq('subject', subject)
      .ilike('topic', pattern)
      // The diagrams these rows depend on do not exist yet.
      .eq('needs_image', false)
      .eq('needs_table', false)
      .order('topic_area')
      .order('topic')
      .order('ordinal');

    if (error || !data) return [];

    return (data as BankRow[])
      .filter(row => topicMatches(topicName, row.topic))
      .map(fromRow);
  } catch {
    return [];
  }
}

/** Human-readable calculator rule, or null when the source did not say. */
export function calculatorLabel(q: ExamQuestion): string | null {
  switch (q.calculator) {
    case 'calculator':     return 'Calculator';
    case 'non_calculator': return 'Non-calculator';
    case 'either':         return 'Calculator optional';
    default:               return null;
  }
}
