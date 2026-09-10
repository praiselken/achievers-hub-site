/**
 * GCSE working and target grades — the student-facing replacement for the
 * internal pathway tiers (Numeracy … Higher Plus).
 *
 * Per the client's brief, students see their current working grade, their
 * target grade and topic-level progress. The tiers stay internal for question
 * selection and are never shown as a second grading system alongside these.
 *
 * STORAGE: the `student_grades` table, one row per (user, subject). Row-level
 * security scopes it to the owner, with read-only access for a linked parent.
 *
 * Demo mode deliberately stays on local storage and writes nothing here — see
 * `seedDemoGrades` in src/lib/demoMode.ts. Nothing lifts a local value into the
 * database on sign-in: demo seeds those same keys, so a lift would import
 * pretend grades into a real account.
 */

import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { isDemoMode } from './demoMode';

export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const GRADES: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export interface Grades {
  /** What the student is working at now. Null means "not sure yet". */
  working: Grade | null;
  /** What they are aiming for. */
  target: Grade | null;
}

/** No row yet, and the fallback on any error — the same "Not set" state. */
export const EMPTY_GRADES: Grades = { working: null, target: null };

function isGrade(value: unknown): value is Grade {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 9;
}

function toGrades(working: unknown, target: unknown): Grades {
  return {
    working: isGrade(working) ? working : null,
    target: isGrade(target) ? target : null,
  };
}

/* ------------------------------------------------------------------ *
 * Demo mode
 * ------------------------------------------------------------------ */

function demoKey(subject: string) {
  return `grades:${subject}`;
}

function readDemoGrades(subject: string): Grades {
  try {
    const raw = localStorage.getItem(demoKey(subject));
    if (!raw) return EMPTY_GRADES;
    const parsed = JSON.parse(raw) as Partial<Grades>;
    return toGrades(parsed.working, parsed.target);
  } catch {
    return EMPTY_GRADES;
  }
}

function writeDemoGrades(subject: string, grades: Grades) {
  try {
    localStorage.setItem(demoKey(subject), JSON.stringify(grades));
  } catch {
    // Storage unavailable — the selection just isn't remembered.
  }
}

/* ------------------------------------------------------------------ *
 * Loading and saving
 * ------------------------------------------------------------------ */

const COLUMNS = 'working_grade, target_grade';

/**
 * Read the signed-in student's grades for one subject.
 *
 * Never throws: a signed-out user, a missing table or an unreachable project
 * all resolve to "Not set", which prompts rather than showing a wrong grade.
 */
export async function loadGrades(subject: string): Promise<Grades> {
  if (isDemoMode()) return readDemoGrades(subject);
  if (!supabase) return EMPTY_GRADES;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return EMPTY_GRADES;
    const { data } = await supabase
      .from('student_grades')
      .select(COLUMNS)
      .eq('user_id', user.id)
      .eq('subject', subject)
      .maybeSingle();
    return data ? toGrades(data.working_grade, data.target_grade) : EMPTY_GRADES;
  } catch {
    return EMPTY_GRADES;
  }
}

/**
 * Read a linked child's grades, for the parent dashboard. Read-only: the
 * `student_grades_linked_parent_read` policy allows the select and nothing else.
 */
export async function loadGradesFor(userId: string, subject: string): Promise<Grades> {
  if (isDemoMode()) return readDemoGrades(subject);
  if (!supabase) return EMPTY_GRADES;
  try {
    const { data } = await supabase
      .from('student_grades')
      .select(COLUMNS)
      .eq('user_id', userId)
      .eq('subject', subject)
      .maybeSingle();
    return data ? toGrades(data.working_grade, data.target_grade) : EMPTY_GRADES;
  } catch {
    return EMPTY_GRADES;
  }
}

/**
 * Write the grades for one subject. Returns false when nothing was stored, so
 * the caller can say so rather than showing a saved state that isn't real.
 *
 * Upsert on the (user_id, subject) primary key: a student changes these from a
 * picker, so the second change must update the first row, not collide with it.
 */
export async function saveGrades(subject: string, grades: Grades): Promise<boolean> {
  if (isDemoMode()) {
    writeDemoGrades(subject, grades);
    return true;
  }
  if (!supabase) return false;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { error } = await supabase.from('student_grades').upsert({
      user_id: user.id,
      subject,
      working_grade: grades.working,
      target_grade: grades.target,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ *
 * Hook
 * ------------------------------------------------------------------ */

export interface UseGrades {
  grades: Grades;
  loading: boolean;
  /** Save and update in place. False means it did not reach the database. */
  save: (next: Grades) => Promise<boolean>;
}

/**
 * Grades for one subject, re-read whenever the subject changes.
 *
 * What is stored is the subject the grades belong to, not a separate loading
 * flag — so switching subject reads as "loading" immediately, by derivation,
 * rather than briefly showing the previous subject's grades against the new one.
 *
 * `save` updates local state before awaiting the write so the picker responds
 * immediately; a failed write is reported through the return value.
 */
export function useGrades(subject: string): UseGrades {
  const [loaded, setLoaded] = useState<{ subject: string; grades: Grades } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGrades(subject).then((grades) => {
      if (!cancelled) setLoaded({ subject, grades });
    });
    return () => { cancelled = true; };
  }, [subject]);

  const save = useCallback(async (next: Grades) => {
    setLoaded({ subject, grades: next });
    return saveGrades(subject, next);
  }, [subject]);

  const current = loaded?.subject === subject ? loaded : null;
  return {
    grades: current?.grades ?? EMPTY_GRADES,
    loading: current === null,
    save,
  };
}

/* ------------------------------------------------------------------ *
 * Derived
 * ------------------------------------------------------------------ */

/**
 * How far the student is between their working grade and their target.
 * Returns null when either grade is unset, so callers can prompt instead of
 * showing a meaningless 0%.
 */
export function gradeGap(grades: Grades): { steps: number; pct: number } | null {
  if (grades.working === null || grades.target === null) return null;
  const steps = grades.target - grades.working;
  if (steps <= 0) return { steps: 0, pct: 100 };
  // Distance travelled from grade 1 to the target, as a share of the journey.
  const pct = Math.round(((grades.working - 1) / Math.max(1, grades.target - 1)) * 100);
  return { steps, pct: Math.min(100, Math.max(0, pct)) };
}
