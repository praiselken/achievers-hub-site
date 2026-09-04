import { describe, expect, it } from 'vitest';
import {
  estimateWorkingGrade, hasEarlyWarning, isAccessible, isHigherOnly, isWeak,
  stretchGrade, studentTier, tierForGrade, topicStatus,
} from './grading';
import { isDue, LADDER_DAYS, scheduleFor } from './spacing';
import { seededRng, selectDailyFive, shouldPersonalise, weakTopics } from './select';
import type { Attempt, Question, Student } from './types';

const foundationStudent: Student = { subject: 'maths', workingGrade: 4, targetGrade: 6 };
const higherStudent: Student = { subject: 'maths', workingGrade: 7, targetGrade: 9 };

function q(id: string, over: Partial<Question> = {}): Question {
  return {
    id, subject: 'maths', topicId: 'algebra', gradeMin: 4, gradeMax: 4, ...over,
  };
}

function attempt(over: Partial<Attempt> = {}): Attempt {
  return { questionId: 'q1', topicId: 'algebra', correct: true, on: '2026-09-01', ...over };
}

/** n attempts on a topic, alternating by a correctness pattern. */
function history(topicId: string, pattern: boolean[], startDay = 1): Attempt[] {
  return pattern.map((correct, i) =>
    attempt({
      questionId: `${topicId}-${i}`,
      topicId,
      correct,
      on: `2026-09-${String(startDay + i).padStart(2, '0')}`,
    }),
  );
}

describe('tiers, from grade (B1)', () => {
  it('splits at grade 5, which belongs to both', () => {
    expect(tierForGrade(4)).toBe('foundation');
    expect(tierForGrade(5)).toBe('crossover');
    expect(tierForGrade(6)).toBe('higher');
  });

  it('treats a question as Higher-only when it starts above the crossover', () => {
    expect(isHigherOnly(q('a', { gradeMin: 6, gradeMax: 8 }))).toBe(true);
    expect(isHigherOnly(q('b', { gradeMin: 4, gradeMax: 7 }))).toBe(false);
  });

  it('keeps a Foundation student in Foundation until secure at 5 with a Higher target', () => {
    expect(studentTier({ subject: 'maths', workingGrade: 4, targetGrade: 8 })).toBe('foundation');
    expect(studentTier({ subject: 'maths', workingGrade: 5, targetGrade: 8 })).toBe('crossover');
    expect(studentTier({ subject: 'maths', workingGrade: 5, targetGrade: 5 })).toBe('foundation');
  });

  it('never lets a Foundation student see Higher-only content', () => {
    const higherOnly = q('h', { gradeMin: 7, gradeMax: 9 });
    expect(isAccessible(higherOnly, foundationStudent)).toBe(false);
    expect(isAccessible(higherOnly, higherStudent)).toBe(true);
  });

  it('respects Spec Mapper coverage for Economics', () => {
    const macro = q('m', { subject: 'economics', topicId: 'inflation' });
    const student: Student = {
      subject: 'economics', workingGrade: 5, targetGrade: 7, coveredTopicIds: ['demand'],
    };
    expect(isAccessible(macro, student)).toBe(false);
  });
});

describe('stretch (D4)', () => {
  it('goes one grade up but never past the target', () => {
    expect(stretchGrade({ subject: 'maths', workingGrade: 5, targetGrade: 7 })).toBe(6);
    expect(stretchGrade({ subject: 'maths', workingGrade: 6, targetGrade: 6 })).toBe(6);
  });
});

describe('weak topics (D2)', () => {
  it('needs at least three attempts before calling a topic weak', () => {
    expect(isWeak(history('algebra', [false, false]), 'algebra')).toBe(false);
  });

  it('calls it weak below 60 per cent over a real run', () => {
    expect(isWeak(history('algebra', [false, false, false, true, true]), 'algebra')).toBe(true);
    expect(isWeak(history('algebra', [true, true, true, true, false]), 'algebra')).toBe(false);
  });

  it('raises an early warning on two of the last three, before there is enough evidence', () => {
    const h = history('algebra', [true, false, false]);
    expect(hasEarlyWarning(h, 'algebra')).toBe(true);
    expect(isWeak(h, 'algebra')).toBe(true);
  });
});

describe('topic status (E1)', () => {
  it('reports not started, then in progress', () => {
    expect(topicStatus([], 'algebra')).toBe('not_started');
    expect(topicStatus(history('algebra', [true, true]), 'algebra')).toBe('in_progress');
  });

  it('reports covered at five attempts and 60 per cent', () => {
    expect(topicStatus(history('algebra', [true, true, true, false, true]), 'algebra')).toBe('covered');
  });

  it('only reports secure when success survived a gap', () => {
    const packed = history('algebra', [true, true, true, true, true]);
    expect(topicStatus(packed, 'algebra')).toBe('covered');

    const spaced: Attempt[] = [
      attempt({ questionId: 'a1', on: '2026-08-01' }),
      attempt({ questionId: 'a2', on: '2026-08-02' }),
      attempt({ questionId: 'a3', on: '2026-08-03' }),
      attempt({ questionId: 'a4', on: '2026-08-04' }),
      attempt({ questionId: 'a5', on: '2026-08-20' }),
    ];
    expect(topicStatus(spaced, 'algebra')).toBe('secure');
  });
});

describe('spaced retrieval (D3 and D6)', () => {
  it('starts a correct first answer a week out', () => {
    const s = scheduleFor([attempt({ correct: true, on: '2026-09-01' })]);
    expect(s?.intervalDays).toBe(7);
    expect(s?.dueOn).toBe('2026-09-08');
  });

  it('drops a wrong answer to the next day', () => {
    const s = scheduleFor([attempt({ correct: false, on: '2026-09-01' })]);
    expect(s?.intervalDays).toBe(1);
    expect(s?.dueOn).toBe('2026-09-02');
  });

  it('climbs the client’s ladder after a mistake: 1, 3, 7, 14, 30', () => {
    const days: number[] = [];
    const run: Attempt[] = [attempt({ correct: false, on: '2026-09-01' })];
    days.push(scheduleFor(run)!.intervalDays);
    for (let i = 0; i < 4; i++) {
      run.push(attempt({ correct: true, on: `2026-09-0${i + 2}` }));
      days.push(scheduleFor(run)!.intervalDays);
    }
    expect(days).toEqual([1, 3, 7, 14, 30]);
  });

  it('steps back rather than resetting when a known answer slips', () => {
    const run = [
      attempt({ correct: true, on: '2026-09-01' }),
      attempt({ correct: true, on: '2026-09-08' }),
      attempt({ correct: false, on: '2026-09-22' }),
    ];
    expect(scheduleFor(run)!.intervalDays).toBe(LADDER_DAYS[2]);
  });

  it('treats anything unattempted as due', () => {
    expect(isDue([], '2026-09-04')).toBe(true);
  });
});

describe('estimated working grade (D4)', () => {
  it('holds still until there is enough evidence', () => {
    const h = history('algebra', [true, true, true]);
    expect(estimateWorkingGrade(foundationStudent, h)).toBe(4);
  });

  it('moves up on a sustained run across more than one topic', () => {
    const h = [
      ...history('algebra', Array(8).fill(true), 1),
      ...history('number', Array(8).fill(true), 10),
    ];
    expect(estimateWorkingGrade(foundationStudent, h)).toBe(5);
  });

  it('does not move down when only one topic is weak', () => {
    const h = [
      ...history('algebra', [false, false, false, false, false], 1),
      ...history('number', [true, true, true, true, true], 10),
    ];
    expect(estimateWorkingGrade(foundationStudent, h)).toBe(4);
  });

  it('ignores attempts pitched well away from the student’s level', () => {
    // Twenty correct answers, but all of them two grades below. That is not
    // evidence of readiness to move up.
    const easy = history('algebra', Array(20).fill(true)).map((a) => ({ ...a, grade: 2 }));
    expect(estimateWorkingGrade(foundationStudent, easy)).toBe(4);
  });
});

describe('selecting the five (D1 and D7)', () => {
  const pool: Question[] = [
    q('at-1', { topicId: 'algebra', gradeMin: 4, gradeMax: 4 }),
    q('at-2', { topicId: 'number', gradeMin: 4, gradeMax: 4 }),
    q('at-3', { topicId: 'ratio', gradeMin: 4, gradeMax: 4 }),
    q('weak-1', { topicId: 'fractions', gradeMin: 4, gradeMax: 4 }),
    q('stretch-1', { topicId: 'geometry', gradeMin: 5, gradeMax: 5 }),
    q('higher-only', { topicId: 'surds', gradeMin: 7, gradeMax: 9 }),
    q('default-1', { topicId: 'number', gradeMin: 4, gradeMax: 4, isDefault: true }),
  ];

  const busy: Attempt[] = [
    ...history('fractions', [false, false, false], 1),
    ...history('algebra', Array(20).fill(true), 4),
  ];

  it('gives new students the authored default set', () => {
    expect(shouldPersonalise([])).toBe(false);
    const five = selectDailyFive(foundationStudent, pool, [], { today: '2026-09-04' });
    expect(five.every((s) => s.via === 'default_daily5')).toBe(true);
  });

  it('personalises once there is enough history', () => {
    const five = selectDailyFive(foundationStudent, pool, busy, {
      today: '2026-09-30', rng: seededRng(1),
    });
    expect(five.length).toBe(5);
    expect(five.some((s) => s.via !== 'default_daily5')).toBe(true);
  });

  it('never repeats a question within a session', () => {
    const five = selectDailyFive(foundationStudent, pool, busy, {
      today: '2026-09-30', rng: seededRng(7),
    });
    expect(new Set(five.map((s) => s.question.id)).size).toBe(five.length);
  });

  it('will not reach for Higher-only content to fill a slot', () => {
    const thin = [q('only-higher', { topicId: 'surds', gradeMin: 7, gradeMax: 9 })];
    const five = selectDailyFive(foundationStudent, thin, busy, { today: '2026-09-30' });
    expect(five).toHaveLength(0);
  });

  it('finds the weak topic for the weak slot', () => {
    const five = selectDailyFive(foundationStudent, pool, busy, {
      today: '2026-09-30', rng: seededRng(3),
    });
    const weakPick = five.find((s) => s.slot === 'weak_topic');
    expect(weakTopics(busy)).toContain('fractions');
    expect(weakPick?.question.topicId).toBe('fractions');
  });

  it('keeps the Economics skill order rather than shuffling it', () => {
    const econStudent: Student = { subject: 'economics', workingGrade: 5, targetGrade: 7 };
    const econPool: Question[] = [
      q('e1', { subject: 'economics', topicId: 'demand', gradeMin: 5, gradeMax: 5, econSlot: 'multiple_choice' }),
      q('e2', { subject: 'economics', topicId: 'demand', gradeMin: 5, gradeMax: 5, econSlot: 'definition' }),
      q('e3', { subject: 'economics', topicId: 'demand', gradeMin: 5, gradeMax: 5, econSlot: 'calculate' }),
      q('e4', { subject: 'economics', topicId: 'demand', gradeMin: 5, gradeMax: 5, econSlot: 'data_or_diagram' }),
      q('e5', { subject: 'economics', topicId: 'demand', gradeMin: 5, gradeMax: 5, econSlot: 'explain_chain' }),
    ];
    const econHistory = history('demand', Array(20).fill(true), 1);
    const five = selectDailyFive(econStudent, econPool, econHistory, { today: '2026-09-30' });
    expect(five.map((s) => s.slot)).toEqual([
      'multiple_choice', 'definition', 'calculate', 'data_or_diagram', 'explain_chain',
    ]);
  });

  it('records which rung of the fallback produced each question', () => {
    const five = selectDailyFive(foundationStudent, pool, busy, {
      today: '2026-09-30', rng: seededRng(5),
    });
    for (const pick of five) {
      expect(['ideal', 'same_topic_skill', 'same_topic', 'other_due_topic', 'default_daily5'])
        .toContain(pick.via);
    }
  });
});
