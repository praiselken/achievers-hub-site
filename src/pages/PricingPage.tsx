import { Link } from 'react-router-dom';
import { ArrowRight, Check, Minus } from 'lucide-react';
import { Container } from '../components/marketing/Container';
import { PricingCards } from '../components/marketing/PricingCards';
import { paymentsAvailable } from '../lib/billing';
import { formatPence, PLANS } from '../lib/plans';

const tutorPlan = PLANS.tutor;

const tutorRows = [
  ['Monthly price', 'Free', formatPence(PLANS.tutor.basePence)],
  ['Active students', '1', 'Up to 25'],
  ['Who invites', 'Student invites tutor', 'Tutor can invite students'],
  ['Progress summary', 'Included', 'Included'],
  ['Question-level analysis', 'Limited', 'Full'],
  ['Past-paper and QLA reports', 'Summary', 'Full'],
  ['Student alerts', 'Not included', 'Included'],
  ['Homework', 'Not included', 'Included'],
  ['Calendar and bookings', 'Not included', 'Included'],
  ['Attendance', 'Not included', 'Included'],
  ['Files and messaging', 'Not included', 'Included'],
  ['Invoice and payment records', 'Not included', 'Included'],
] as const;

export default function PricingPage() {
  return (
    <main className="mkt flex-1">
      <section className="bg-[var(--color-primary-900)] py-20 text-white lg:py-28">
        <Container className="text-center">
          <p className="text-sm font-extrabold text-[var(--color-accent-300)]">Clear pricing with a useful free level</p>
          <h1 className="mx-auto mt-4 max-w-4xl font-display text-5xl font-extrabold sm:text-6xl">Start free. Choose more support when you need it.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/75">Free Starter has no time limit. Student Complete unlocks the full personalised plan, past-paper analysis and linked adult views.</p>
          <Link to="/signup?plan=free" className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white hover:bg-[var(--color-accent-600)]">Start learning free <ArrowRight size={18} aria-hidden="true" /></Link>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <PricingCards />
          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-6 text-[var(--color-ink-500)]">Student Complete can still be tried for seven days with no payment details. If you do not choose a paid membership, your account returns to Free Starter.</p>
        </Container>
      </section>

      <section id="tutors" className="scroll-mt-24 bg-[#fbfafc] py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary-600)]">For independent tutors</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">Free access for one student, professional tools for up to 25.</h2>
            <p className="mt-4 text-lg leading-8 text-[var(--color-ink-500)]">A student can connect their existing tutor for free. Tutor Membership brings multiple students and tutor-management tools into one place.</p>
          </div>

          <div className="mt-12 overflow-x-auto rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[1.35fr_.8fr_.8fr] border-b border-slate-200 bg-[var(--color-primary-50)]">
                <div className="p-5"><span className="sr-only">Feature</span></div>
                <div className="p-5 text-center"><p className="text-sm font-extrabold text-[var(--color-ink-900)]">Linked Tutor View</p><p className="mt-1 text-xs text-[var(--color-ink-500)]">Free</p></div>
                <div className="bg-white/60 p-5 text-center"><p className="text-sm font-extrabold text-[var(--color-primary-700)]">{tutorPlan.name}</p><p className="mt-1 text-xs text-[var(--color-ink-500)]">{formatPence(tutorPlan.basePence)} {tutorPlan.suffix}</p></div>
              </div>
              {tutorRows.map(([feature, free, paid]) => (
                <div key={feature} className="grid grid-cols-[1.35fr_.8fr_.8fr] border-b border-slate-100 last:border-0">
                  <div className="p-5 text-sm font-semibold text-[var(--color-ink-700)]">{feature}</div>
                  <div className="flex items-center justify-center p-5 text-center text-xs text-[var(--color-ink-500)]">{free === 'Included' ? <Check size={18} className="text-[var(--color-success-500)]" aria-label="Included" /> : free === 'Not included' ? <Minus size={18} className="text-slate-300" aria-label="Not included" /> : free}</div>
                  <div className="flex items-center justify-center bg-[var(--color-primary-50)]/35 p-5 text-center text-xs font-semibold text-[var(--color-ink-700)]">{paid === 'Included' ? <Check size={18} className="text-[var(--color-success-500)]" aria-label="Included" /> : paid}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-3xl bg-[var(--color-primary-900)] p-7 text-center text-white sm:p-9">
            <h3 className="font-display text-2xl font-extrabold">Supporting more than one student?</h3>
            <p className="mt-3 leading-7 text-white/70">Bring up to 25 students into one dashboard, with detailed reports, homework, attendance, bookings, files and tutor-management tools.</p>
            <Link
              to={paymentsAvailable() ? '/checkout?plan=tutor' : '/signup?role=tutor'}
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white hover:bg-[var(--color-accent-600)]"
            >
              {paymentsAvailable() ? `Choose ${tutorPlan.name}` : 'Explore Tutor Membership'} <ArrowRight size={17} />
            </Link>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container className="grid gap-6 lg:grid-cols-3">
          {[
            ['When does the Complete trial begin?', 'The seven-day Student Complete trial begins only when the student actively starts it. Creating a Free Starter account does not start the trial.'],
            ['What happens after seven days?', 'You will not be charged automatically. If you do not choose a paid membership, the account returns to Free Starter so learning can continue.'],
            ['Can I cancel paid membership?', 'Yes. Cancel any time and access continues until the end of the current paid billing period. No further payment is taken.'],
          ].map(([title, copy]) => (
            <article key={title} className="rounded-3xl border border-slate-200 p-7"><h2 className="font-display text-xl font-extrabold text-[var(--color-ink-900)]">{title}</h2><p className="mt-3 text-sm leading-7 text-[var(--color-ink-500)]">{copy}</p></article>
          ))}
        </Container>
      </section>
    </main>
  );
}
