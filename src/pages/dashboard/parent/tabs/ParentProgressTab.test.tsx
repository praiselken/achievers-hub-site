import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChildGradesCard } from './ParentProgressTab';
import type { Grades } from '../../../../lib/grades';

// Rendered to a string rather than a DOM: the parent dashboard sits behind a
// real session and has no demo mode, so this is the only way to see every
// state of the card without creating accounts on the client's database.
function render(grades: Grades, subject = 'maths') {
  return renderToStaticMarkup(<ChildGradesCard grades={grades} subject={subject} />);
}

describe('ChildGradesCard', () => {
  it('prompts for grades when the child has set neither', () => {
    const html = render({ working: null, target: null });
    expect(html).toContain('set their Maths grades yet');
    expect(html).not.toContain('Working at');
  });

  it('shows both grades and the distance to target', () => {
    const html = render({ working: 5, target: 7 });
    expect(html).toContain('>5<');
    expect(html).toContain('>7<');
    expect(html).toContain('2 grades to go to reach their target.');
  });

  it('uses the singular for one grade', () => {
    expect(render({ working: 6, target: 7 })).toContain('1 grade to go');
  });

  it('says so when the child is at or above target', () => {
    expect(render({ working: 7, target: 7 })).toContain('Working at or above their target.');
    expect(render({ working: 8, target: 7 })).toContain('Working at or above their target.');
  });

  it('shows "Not set" for a missing working grade, and no distance', () => {
    const html = render({ working: null, target: 6 });
    expect(html).toContain('Not set');
    expect(html).toContain('>6<');
    expect(html).not.toContain('to go');
  });

  it('labels the subject', () => {
    expect(render({ working: 4, target: 6 }, 'economics')).toContain('Economics grades');
  });

  it('always says the grades are the child’s own estimate', () => {
    for (const g of [{ working: null, target: null }, { working: 5, target: 7 }] as Grades[]) {
      expect(render(g)).toContain('not a prediction or an official result');
    }
  });
});
