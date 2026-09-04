/**
 * Spaced retrieval.
 *
 * The client gave two ladders: one for a question got wrong (D3, 1 → 3 → 7 →
 * 14 → 30 days) and one for a question got right (D6, 7 → 14 → 30 → 45–60).
 * They are the same ladder entered at different rungs, which is how this is
 * modelled: a correct first encounter starts at 7 days, an incorrect one drops
 * to the bottom, every later correct climbs a rung and every later mistake
 * steps back down.
 */

import type { Attempt } from './types';
import { daysBetween } from './grading';

export const LADDER_DAYS = [1, 3, 7, 14, 30, 45, 60];

/** D6: a question answered correctly first time starts a week out. */
const FIRST_CORRECT_RUNG = 2;

export interface Schedule {
  /** Position on the ladder. */
  rung: number;
  /** Days that rung waits. */
  intervalDays: number;
  /** ISO date it next becomes eligible. */
  dueOn: string;
}

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Walk a question's attempt history and work out when it should come round
 * again. A wrong answer steps back rather than resetting to zero, so a student
 * who slips on something they knew is not dragged back to daily drilling.
 */
export function scheduleFor(attempts: Attempt[]): Schedule | null {
  const ordered = [...attempts].sort((a, b) => (a.on < b.on ? -1 : a.on > b.on ? 1 : 0));
  if (ordered.length === 0) return null;

  let rung = ordered[0].correct ? FIRST_CORRECT_RUNG : 0;
  for (let i = 1; i < ordered.length; i++) {
    rung = ordered[i].correct
      ? Math.min(rung + 1, LADDER_DAYS.length - 1)
      : Math.max(rung - 1, 0);
  }

  const last = ordered[ordered.length - 1];
  const intervalDays = LADDER_DAYS[rung];
  return { rung, intervalDays, dueOn: addDays(last.on, intervalDays) };
}

/** Whether this question is eligible again on the given date. Anything never
 *  attempted is always eligible. */
export function isDue(attempts: Attempt[], today: string): boolean {
  const schedule = scheduleFor(attempts);
  if (!schedule) return true;
  return daysBetween(schedule.dueOn, today) >= 0;
}

/**
 * Questions whose retrieval slot has come round, soonest-overdue first. The
 * client prefers a different question on the same topic to the identical one,
 * so callers should treat this as a list of topics to revisit rather than a
 * list of exact questions to re-serve.
 */
export function dueQuestionIds(history: Attempt[], today: string): string[] {
  const byQuestion = new Map<string, Attempt[]>();
  for (const a of history) {
    const list = byQuestion.get(a.questionId) ?? [];
    list.push(a);
    byQuestion.set(a.questionId, list);
  }

  const due: { id: string; overdueBy: number }[] = [];
  for (const [id, attempts] of byQuestion) {
    const schedule = scheduleFor(attempts);
    if (!schedule) continue;
    const overdueBy = daysBetween(schedule.dueOn, today);
    if (overdueBy >= 0) due.push({ id, overdueBy });
  }

  return due.sort((a, b) => b.overdueBy - a.overdueBy).map((d) => d.id);
}

/** Topics with something due, most overdue first. This is what the retrieval
 *  slot actually picks from. */
export function dueTopicIds(history: Attempt[], today: string): string[] {
  const seen = new Set<string>();
  const topics: string[] = [];
  for (const id of dueQuestionIds(history, today)) {
    const topicId = history.find((a) => a.questionId === id)?.topicId;
    if (topicId && !seen.has(topicId)) {
      seen.add(topicId);
      topics.push(topicId);
    }
  }
  return topics;
}
