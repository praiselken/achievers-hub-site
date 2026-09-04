/**
 * Grades, tiers and how a topic is judged.
 *
 * Rules from the client's build decisions: B1 for how tier falls out of grade,
 * D2 for what counts as weak, D4 for stretch and the estimated working grade,
 * E1 for topic status.
 */

import type { Attempt, Band, Question, Student, Tier, TopicStatus } from './types';

/** Where Foundation stops and Higher starts. Grade 5 belongs to both. */
export const CROSSOVER_GRADE = 5;

/** D2: below this over a meaningful run of attempts is a weak topic. */
export const WEAK_BELOW = 0.6;
/** D2: at or above this is secure. */
export const SECURE_AT = 0.8;
/** D2: fewer attempts than this is not yet evidence. */
export const MIN_ATTEMPTS_FOR_JUDGEMENT = 3;
/** D2: judged on the most recent few rather than all history. */
export const RECENT_WINDOW = 5;

export function tierForGrade(grade: number): Tier {
  if (grade < CROSSOVER_GRADE) return 'foundation';
  if (grade > CROSSOVER_GRADE) return 'higher';
  return 'crossover';
}

/**
 * The tier a student is working in. A Foundation student stays in Foundation
 * until they are secure around grade 5 and their target points at Higher, at
 * which point Higher content can start appearing (D4).
 */
export function studentTier(student: Student): Tier {
  if (student.workingGrade > CROSSOVER_GRADE) return 'higher';
  if (student.workingGrade === CROSSOVER_GRADE && student.targetGrade > CROSSOVER_GRADE) return 'crossover';
  return 'foundation';
}

/** Higher-only means a Foundation student should never see it, however thin
 *  the bank gets (D7). A question spanning the crossover is not Higher-only. */
export function isHigherOnly(q: Question): boolean {
  return q.gradeMin > CROSSOVER_GRADE;
}

/** Whether this student is allowed this question at all. This is a hard filter:
 *  D7 says tier is never relaxed to fill a slot. */
export function isAccessible(q: Question, student: Student): boolean {
  if (q.subject !== student.subject) return false;
  if (isHigherOnly(q) && studentTier(student) === 'foundation') return false;
  if (student.coveredTopicIds && !student.coveredTopicIds.includes(q.topicId)) return false;
  return true;
}

/** D4: roughly one grade above where they are, capped at the target so the
 *  stretch stays reachable rather than discouraging. */
export function stretchGrade(student: Student): number {
  return Math.min(student.workingGrade + 1, student.targetGrade, 9);
}

export function coversGrade(q: Question, grade: number): boolean {
  return q.gradeMin <= grade && grade <= q.gradeMax;
}

function recent(attempts: Attempt[], window = RECENT_WINDOW): Attempt[] {
  return [...attempts]
    .sort((a, b) => (a.on < b.on ? 1 : a.on > b.on ? -1 : 0))
    .slice(0, window);
}

export function accuracy(attempts: Attempt[]): number {
  if (attempts.length === 0) return 0;
  return attempts.filter((a) => a.correct).length / attempts.length;
}

/**
 * Attempts for one topic, or one topic and skill pair. The client asked for
 * topic plus skill "where possible", so passing a skill narrows it and
 * omitting it falls back to the topic as a whole.
 */
export function attemptsFor(history: Attempt[], topicId: string, skill?: string | null): Attempt[] {
  return history.filter(
    (a) => a.topicId === topicId && (skill == null || a.skill === skill),
  );
}

export function bandFor(history: Attempt[], topicId: string, skill?: string | null): Band {
  const run = recent(attemptsFor(history, topicId, skill));
  if (run.length === 0) return 'developing';
  const acc = accuracy(run);
  if (acc >= SECURE_AT) return 'secure';
  if (acc < WEAK_BELOW) return 'weak';
  return 'developing';
}

/**
 * D2. Weak needs both a low score and enough attempts to mean anything. The
 * early warning rule catches a topic going wrong before there is enough
 * evidence to call it: two of the last three wrong earns extra weight now
 * rather than after another two sessions.
 */
export function isWeak(history: Attempt[], topicId: string, skill?: string | null): boolean {
  const all = attemptsFor(history, topicId, skill);
  const run = recent(all);
  if (run.length >= MIN_ATTEMPTS_FOR_JUDGEMENT && accuracy(run) < WEAK_BELOW) return true;
  return hasEarlyWarning(history, topicId, skill);
}

/** Two of the last three wrong. Weights the topic up without yet labelling it. */
export function hasEarlyWarning(history: Attempt[], topicId: string, skill?: string | null): boolean {
  const last3 = recent(attemptsFor(history, topicId, skill), 3);
  if (last3.length < 3) return false;
  return last3.filter((a) => !a.correct).length >= 2;
}

/** Days between two ISO dates. */
export function daysBetween(from: string, to: string): number {
  const ms = Date.parse(to) - Date.parse(from);
  return Math.floor(ms / 86_400_000);
}

/**
 * E1's four statuses. "Secure" needs recent accuracy plus evidence the student
 * held onto it: a correct attempt at least a week after an earlier correct one
 * on the same topic. Retrieval that survives a gap is the point of the ladder.
 */
export function topicStatus(history: Attempt[], topicId: string): TopicStatus {
  const all = attemptsFor(history, topicId);
  if (all.length === 0) return 'not_started';
  if (all.length < 5) return 'in_progress';

  const acc = accuracy(recent(all));
  if (acc >= SECURE_AT && hasSpacedSuccess(all)) return 'secure';
  if (acc >= WEAK_BELOW) return 'covered';
  return 'in_progress';
}

/** A correct attempt that came at least a week after a previous correct one. */
export function hasSpacedSuccess(attempts: Attempt[], gapDays = 7): boolean {
  const correct = attempts
    .filter((a) => a.correct)
    .map((a) => a.on)
    .sort();
  for (let i = 1; i < correct.length; i++) {
    if (daysBetween(correct[i - 1], correct[i]) >= gapDays) return true;
  }
  return false;
}

/**
 * D4's estimated working grade. Deliberately conservative: it moves on a
 * pattern across topics, never on one bad session, and it checks whether a
 * single weak topic is dragging the picture down before lowering anything.
 *
 * Returns the grade the platform believes they are working at. The grade the
 * student entered and their target are left untouched.
 */
export function estimateWorkingGrade(student: Student, history: Attempt[]): number {
  const current = student.workingGrade;

  // "Around the current level" means within a grade of it. Attempts that do not
  // record a grade are counted, since older history predates the tagging.
  const atLevel = history.filter(
    (a) => a.grade == null || Math.abs(a.grade - current) <= 1,
  );
  if (atLevel.length < 10) return current;

  const run = recent(atLevel, 20);
  const acc = accuracy(run);
  const topics = [...new Set(run.map((a) => a.topicId))];
  const weakTopics = topics.filter((t) => isWeak(history, t));

  // Up: a sustained run at the level, across more than one topic.
  if (run.length >= 15 && acc >= 0.75 && topics.length >= 2 && weakTopics.length <= 1) {
    return Math.min(current + 1, 9);
  }

  // Down: struggling broadly, not just on one topic they have not met properly.
  if (run.length >= 10 && acc < 0.5 && weakTopics.length >= 2) {
    return Math.max(current - 1, 1);
  }

  return current;
}
