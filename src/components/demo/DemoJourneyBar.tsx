/**
 * The membership journey, as a rail you can see and click.
 *
 * Without this the walkthrough was invisible: `/demo` lands on the dashboard,
 * the dashboard has no link to Pricing, and so the whole paid journey could only
 * be found by someone who had been told the URLs. A reviewer should not need a
 * covering email to find the thing they are reviewing.
 *
 * It also gives "Step 3 of 4" something to refer to. Every step stays clickable
 * — this is a review tool, and a reviewer wants to jump straight to the screen
 * they are arguing about rather than replay the whole thing each time.
 */

import { Link, useLocation } from 'react-router-dom';
import { isDemoMode } from '../../lib/demoMode';

interface Step {
  label: string;
  to: string;
  /** Pathnames that count as being on this step. */
  matches: string[];
}

const JOURNEY_STEPS: Step[] = [
  { label: 'Choose a plan', to: '/pricing', matches: ['/pricing'] },
  { label: 'Review', to: '/checkout?plan=student_complete', matches: ['/checkout'] },
  { label: 'Payment', to: '/demo/payment?plan=student_complete', matches: ['/demo/payment'] },
  {
    label: 'Your membership',
    to: '/dashboard/settings',
    matches: ['/dashboard/settings', '/demo/billing-portal'],
  },
];

export function DemoJourneyBar() {
  const { pathname } = useLocation();

  // Session storage, so this cannot render on a real visitor's pricing page.
  if (!isDemoMode()) return null;

  const activeIndex = JOURNEY_STEPS.findIndex((step) =>
    step.matches.some((match) => pathname.startsWith(match)),
  );
  if (activeIndex === -1) return null;

  return (
    <nav
      aria-label="Membership walkthrough"
      className="border-b border-amber-200 bg-amber-100/70"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2">
        <span className="mr-2 shrink-0 text-[11px] font-extrabold uppercase tracking-[0.1em] text-amber-900/70">
          Walkthrough
        </span>
        {JOURNEY_STEPS.map((step, index) => {
          const active = index === activeIndex;
          return (
            <Link
              key={step.label}
              to={step.to}
              aria-current={active ? 'step' : undefined}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                active
                  ? 'bg-amber-900 text-white'
                  : 'text-amber-900/80 hover:bg-amber-200'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-extrabold ${
                  active ? 'bg-white/25 text-white' : 'bg-amber-900/15 text-amber-900'
                }`}
              >
                {index + 1}
              </span>
              {step.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
