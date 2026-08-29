/**
 * The plan catalogue — names, prices and what each one unlocks.
 *
 * This is the browser's copy. It exists so the pricing page, the checkout
 * screen and the membership panel all quote the same figures, and so the
 * client can change wording in one place.
 *
 * IT IS NOT WHAT GETS CHARGED. The Stripe price identifiers live only on the
 * server (netlify/lib/plans.mts, read from environment variables). The browser
 * sends a plan id and a seat count; the server decides what that costs. If the
 * two ever disagree the server wins, which is the whole point — a page the user
 * can edit must never be able to name its own price.
 *
 * Keep PlanId in step with:
 *   - netlify/lib/plans.mts        (price lookup)
 *   - supabase/migrations/0003_add_subscriptions.sql  (plan_id check constraint)
 */

export type PlanId = 'free' | 'student_complete' | 'family' | 'tutor';

/**
 * What a plan unlocks. Several plans can grant the same tier — Family is
 * Student Complete for more than one child — so gating checks the tier, never
 * the plan id.
 */
export type Tier = 'free' | 'complete' | 'tutor';

export interface Plan {
  id: PlanId;
  name: string;
  tier: Tier;
  /** Monthly cost in pence, for the seats included in the base price. */
  basePence: number;
  /** How many students the base price covers. */
  includedSeats: number;
  /** Monthly cost in pence of each student beyond `includedSeats`, if allowed. */
  extraSeatPence: number | null;
  /** Upper limit on seats. Guards the seat picker; the server checks it too. */
  maxSeats: number;
  suffix: string;
  description: string;
  features: readonly string[];
  /** Which signup role this plan is aimed at. Used to order the pricing page. */
  audience: 'student' | 'tutor';
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free Starter',
    tier: 'free',
    basePence: 0,
    includedSeats: 1,
    extraSeatPence: null,
    maxSeats: 1,
    suffix: 'forever',
    description: 'A useful starting point for students who want to explore before paying.',
    features: [
      'GCSE Maths and Economics',
      'One Daily 5 each week',
      'Selected Knowledge Cards and Lessons',
      'Limited practice and Archi hints',
      'A simple progress snapshot',
    ],
    audience: 'student',
  },
  student_complete: {
    id: 'student_complete',
    name: 'Student Complete',
    tier: 'complete',
    basePence: 1799,
    includedSeats: 1,
    extraSeatPence: null,
    maxSeats: 1,
    suffix: 'per month',
    description: 'The complete personalised revision plan for one student.',
    features: [
      'Personalised Daily 5',
      'Full Topic Hub and syllabus tracking',
      'Past Paper Hub and question-level analysis',
      'Step-by-step Archi support',
      'Linked parent and tutor views',
    ],
    audience: 'student',
  },
  family: {
    id: 'family',
    name: 'Family',
    tier: 'complete',
    basePence: 2798,
    includedSeats: 2,
    extraSeatPence: 999,
    // Five children is already generous; beyond that it is a conversation, not
    // a self-serve checkout.
    maxSeats: 5,
    suffix: 'per month for two',
    description: 'Complete access for siblings, with every learning history kept separate.',
    features: [
      'Everything in Student Complete',
      '£9.99 for each additional student',
      'One combined family dashboard',
      'Separate subjects, goals and progress',
      'Exact total shown before payment',
    ],
    audience: 'student',
  },
  tutor: {
    id: 'tutor',
    name: 'Tutor Membership',
    tier: 'tutor',
    basePence: 3999,
    includedSeats: 25,
    extraSeatPence: null,
    maxSeats: 25,
    suffix: 'per month',
    description: 'Professional tools for tutors supporting up to 25 students.',
    features: [
      'Up to 25 active students',
      'Tutor-initiated student invitations',
      'Full question-level analysis and QLA reports',
      'Homework, attendance, bookings and files',
      'Invoice and payment records',
    ],
    audience: 'tutor',
  },
};

/** How long the no-card trial lasts. Quoted in the marketing copy — keep in step. */
export const TRIAL_DAYS = 7;

/** The plan the no-card trial gives a taste of. */
export const TRIAL_PLAN: PlanId = 'student_complete';

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === 'string' && value in PLANS;
}

/**
 * Total monthly cost in pence for a plan at a given seat count.
 *
 * Mirrored by `monthlyTotalPence` in netlify/lib/plans.mts. The server recomputes
 * it rather than trusting this; the browser's copy exists so the Family card can
 * keep its promise to show the exact total before payment.
 */
export function monthlyTotalPence(planId: PlanId, seats = 1): number {
  const plan = PLANS[planId];
  const extra = Math.max(0, clampSeats(planId, seats) - plan.includedSeats);
  return plan.basePence + extra * (plan.extraSeatPence ?? 0);
}

export function clampSeats(planId: PlanId, seats: number): number {
  const plan = PLANS[planId];
  if (!Number.isFinite(seats)) return plan.includedSeats;
  return Math.min(plan.maxSeats, Math.max(plan.includedSeats, Math.trunc(seats)));
}

/** £17.99, £0 — no trailing ".00" on whole pounds, which reads oddly in a heading. */
export function formatPence(pence: number): string {
  const pounds = pence / 100;
  return pence % 100 === 0 ? `£${pounds.toFixed(0)}` : `£${pounds.toFixed(2)}`;
}
