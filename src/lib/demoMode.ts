import { clearDemoBilling } from './demoBilling';

const KEY = 'ah_demo_mode';

export function isDemoMode(): boolean {
  return typeof window !== 'undefined' && sessionStorage.getItem(KEY) === '1';
}

export function enterDemoMode() {
  sessionStorage.setItem(KEY, '1');
  seedDemoGrades();
}

const DEMO_GRADE_SUBJECTS = ['maths', 'economics'] as const;

function gradeKey(subject: string) {
  return `grades:${subject}`;
}

/**
 * Real grades live in the `student_grades` table; the demo keeps them in local
 * storage so it writes nothing to the database. Seeding them matters because
 * otherwise the demo opens on "Not set" and the feature looks unfinished.
 */
function seedDemoGrades() {
  const demo: Record<string, { working: number; target: number }> = {
    maths: { working: 5, target: 7 },
    economics: { working: 4, target: 6 },
  };
  for (const [subject, grades] of Object.entries(demo)) {
    try {
      localStorage.setItem(gradeKey(subject), JSON.stringify(grades));
    } catch {
      // Storage unavailable — the demo just shows the unset state.
    }
  }
}

export function exitDemoMode() {
  sessionStorage.removeItem(KEY);
  // The demonstration's payment journey goes with it, so a real sign-in never
  // inherits a pretend membership.
  clearDemoBilling();
  // Same reasoning for the seeded grades. Nothing real is stored under these
  // keys any more, so clearing them cannot discard a student's own choice.
  for (const subject of DEMO_GRADE_SUBJECTS) {
    try {
      localStorage.removeItem(gradeKey(subject));
    } catch {
      // Nothing to do — the values are only ever read back in demo mode.
    }
  }
}
