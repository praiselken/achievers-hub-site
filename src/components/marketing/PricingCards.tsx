import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const plans = [
  {
    name: 'Free Starter',
    price: '£0',
    suffix: 'forever',
    description: 'A useful starting point for students who want to explore before paying.',
    features: [
      'GCSE Maths and Economics',
      'One Daily 5 each week',
      'Selected Knowledge Cards and Lessons',
      'Limited practice and Archi hints',
      'A simple progress snapshot',
    ],
    href: '/signup?plan=free',
    action: 'Start learning free',
    tone: 'border-slate-200 bg-white',
    button: 'border border-[var(--color-primary-300)] bg-white text-[var(--color-primary-700)] hover:bg-[var(--color-primary-50)]',
  },
  {
    name: 'Student Complete',
    price: '£17.99',
    suffix: 'per month',
    description: 'The complete personalised revision plan for one student.',
    features: [
      'Personalised Daily 5',
      'Full Topic Hub and syllabus tracking',
      'Past Paper Hub and question-level analysis',
      'Step-by-step Archi support',
      'Linked parent and tutor views',
    ],
    href: '/start-free-trial',
    action: 'Try Complete free',
    tone: 'border-2 border-[var(--color-primary-500)] bg-white shadow-[var(--shadow-soft-lg)]',
    button: 'bg-[var(--color-accent-500)] text-white hover:bg-[var(--color-accent-600)]',
    badge: 'Most popular',
  },
  {
    name: 'Family',
    price: '£27.98',
    suffix: 'per month for two',
    description: 'Complete access for siblings, with every learning history kept separate.',
    features: [
      'Everything in Student Complete',
      '£9.99 for each additional student',
      'One combined family dashboard',
      'Separate subjects, goals and progress',
      'Exact total shown before payment',
    ],
    href: '/start-free-trial?plan=family',
    action: 'Start a family trial',
    tone: 'border border-orange-100 bg-[var(--color-accent-50)]',
    button: 'bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]',
  },
] as const;

export function PricingCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan) => (
        <article key={plan.name} className={`relative flex flex-col rounded-[2rem] p-7 sm:p-8 ${plan.tone}`}>
          {'badge' in plan && (
            <span className="absolute right-6 top-6 rounded-full bg-[var(--color-primary-100)] px-3 py-1 text-xs font-bold text-[var(--color-primary-700)]">
              {plan.badge}
            </span>
          )}
          <p className="text-base font-extrabold text-[var(--color-primary-700)]">{plan.name}</p>
          <div className="mt-4 flex flex-wrap items-end gap-x-2 gap-y-1">
            <span className="font-display text-5xl font-extrabold text-[var(--color-ink-900)]">{plan.price}</span>
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
            to={plan.href}
            className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 py-3 text-center font-bold transition ${plan.button}`}
          >
            {plan.action}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </article>
      ))}
    </div>
  );
}
