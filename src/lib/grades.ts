/**
 * GCSE working and target grades — the student-facing replacement for the
 * internal pathway tiers (Numeracy … Higher Plus).
 *
 * Per the client's brief, students see their current working grade, their
 * target grade and topic-level progress. The tiers stay internal for question
 * selection and are never shown as a second grading system alongside these.
 *
 * STORAGE: kept in local storage for now so this works before the database
 * migration runs. supabase/migrations/0002_add_student_grades.sql adds the
 * profiles columns; once that is applied this can read and write them instead.
 */

export type Grade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export const GRADES: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export interface Grades {
  /** What the student is working at now. Null means "not sure yet". */
  working: Grade | null;
  /** What they are aiming for. */
  target: Grade | null;
}

const EMPTY: Grades = { working: null, target: null };

function key(subject: string) {
  return `grades:${subject}`;
}

export function loadGrades(subject: string): Grades {
  try {
    const raw = localStorage.getItem(key(subject));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Grades;
    return {
      working: isGrade(parsed.working) ? parsed.working : null,
      target: isGrade(parsed.target) ? parsed.target : null,
    };
  } catch {
    return EMPTY;
  }
}

export function saveGrades(subject: string, grades: Grades) {
  try {
    localStorage.setItem(key(subject), JSON.stringify(grades));
  } catch {
    // Storage unavailable — the selection just isn't remembered.
  }
}

function isGrade(value: unknown): value is Grade {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 9;
}

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
