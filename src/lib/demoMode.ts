import { clearDemoBilling } from './demoBilling';

const KEY = 'ah_demo_mode';

export function isDemoMode(): boolean {
  return typeof window !== 'undefined' && sessionStorage.getItem(KEY) === '1';
}

export function enterDemoMode() {
  sessionStorage.setItem(KEY, '1');
  seedDemoGrades();
}

/**
 * Grades live in local storage until the database migration runs, so the demo
 * has to seed them or it opens on an empty "Not set" state that makes the
 * feature look unfinished. Only fills blanks — never overwrites a real choice.
 */
function seedDemoGrades() {
  const demo: Record<string, { working: number; target: number }> = {
    maths: { working: 5, target: 7 },
    economics: { working: 4, target: 6 },
  };
  for (const [subject, grades] of Object.entries(demo)) {
    const key = `grades:${subject}`;
    try {
      if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(grades));
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
}
