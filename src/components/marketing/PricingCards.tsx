import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatPence, PLANS, type PlanId } from '../../lib/plans';
import { paymentsAvailable } from '../../lib/billing';

/**
 * Names, prices and features come from src/lib/plans.ts so that this, the
 * checkout screen and the membership panel can never quote different figures.
 * What stays here is presentation only.
 */
const CARDS: {
  id: Exclude<PlanId, 'tutor'>;
  tone: string;
  button: string;
  badge?: string;
  /** Where the button goes while paid membership is not open yet. */
  fallbackHref: string;
  fallbackAction: string;
}[] = [
  {
    id: 'free',
    tone: 'border-slate-200 bg-white',
    button: 'border border-[var(--color-primary-300)] bg-white text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)]',
    fallbackHref: '/signup?plan=free',
    fallbackAction: 'Start learning free',
  },
  {
    id: 'student_complete',
    tone: 'border-2 border-[var(--color-primary-500)] bg-white shadow-[var(--shadow-soft-lg)]',
    button: 'bg-[var(--color-accent-500)] text-white hover:bg-[var(--color-accent-600)]',
    badge: 'Most popular',
    fallbackHref: '/start-free-trial',
    fallbackAction: 'Try Complete free',
  },
  {
    id: 'family',
    tone: 'border border-orange-100 bg-[var(--color-accent-50)]',
    button: 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]',
    fallbackHref: '/start-free-trial?plan=family',
    fallbackAction: 'Start a family trial',
  },
];

export function PricingCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {CARDS.map((card) => {
        const plan = PLANS[card.id];
        // Free Starter never goes through checkout. The paid cards only do once
        // the Stripe account is live — until then they route to the no-card
        // trial, rather than to a checkout that would dead-end.
        const paid = card.id !== 'free' && paymentsAvailable();
        const href = paid ? `/checkout?plan=${plan.id}` : card.fallbackHref;
        const action = paid ? `Choose ${plan.name}` : card.fallbackAction;

        return (
          <article key={plan.id} className={`relative flex flex-col rounded-[2rem] p-7 sm:p-8 ${card.tone}`}>
            {card.badge && (
              <span className="absolute right-6 top-6 rounded-full bg-[var(--color-primary-100)] px-3 py-1 text-xs font-bold text-[var(--color-primary-700)]">
                {card.badge}
              </span>
            )}
            <p className="text-base font-extrabold text-[var(--color-primary-700)]">{plan.name}</p>
            <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
              <span className="font-display text-5xl font-extrabold text-[var(--color-ink-900)]">
                {formatPence(plan.basePence)}
              </span>
              <span className="pb-1 text-sm font-semibold text-[var(--color-ink-500)]">{plan.suffix}</span>
            </div>
            <p className="mt-4 min-h-14 text-sm leading-6 text-[var(--color-ink-500)]">{plan.description}</p>
            <ul className="mt-7 flex-1 space-y-3">
              {plan.features.slice(0, compact ? 4 : plan.features.length).map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-[var(--color-ink-700)]">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--color-success-500)]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              to={href}
              className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-center font-bold transition ${card.button}`}
            >
              {action}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
