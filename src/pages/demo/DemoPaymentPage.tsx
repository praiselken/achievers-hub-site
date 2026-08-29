/**
 * /demo/payment — where Stripe Checkout sits in the real journey.
 *
 * Deliberately not a mock-up of Stripe's page. There are no card fields, no
 * Stripe branding and no form: it describes what Stripe collects and offers the
 * two outcomes a reviewer needs to see, paid and abandoned. Anything more
 * convincing would be a fake payment page, which is not a thing to have lying
 * around on a public site.
 *
 * The step number lives in the walkthrough rail above rather than in the
 * eyebrow here, so the two cannot drift apart.
 */

import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, ExternalLink, Lock, ShieldCheck } from 'lucide-react';
import { DemoStageShell } from './DemoStageShell';
import { demoCompletePayment, rememberDemoPurchase } from '../../lib/demoBilling';
import { paymentLinkFor } from '../../lib/paymentLinks';
import {
  clampSeats,
  formatPence,
  isPlanId,
  monthlyTotalPence,
  PLANS,
  type PlanId,
} from '../../lib/plans';

export default function DemoPaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const requested = params.get('plan');
  const planId: PlanId = isPlanId(requested) && requested !== 'free' ? requested : 'student_complete';
  const seats = clampSeats(planId, Number(params.get('seats')) || PLANS[planId].includedSeats);
  const total = monthlyTotalPence(planId, seats);

  // When a real Payment Link is configured we hand over to Stripe rather than
  // pretending. See src/lib/paymentLinks.ts for why that is possible while the
  // proper integration is still blocked.
  const liveLink = paymentLinkFor(planId);

  function pay() {
    demoCompletePayment(planId, seats);
    // The same place a real Stripe redirect lands, so the confirmation state in
    // the membership panel is part of what gets reviewed.
    navigate('/dashboard/settings?checkout=success');
  }

  function goToStripe() {
    // Nothing tells us what happened at a Payment Link, so record the intent
    // now and settle it when the browser comes back.
    rememberDemoPurchase({ planId, seats });
    window.location.assign(liveLink!);
  }

  if (liveLink) {
    return (
      <DemoStageShell
        eyebrow="Leaving Achievers Hub"
        title="Over to Stripe"
        intro="This is the real thing. The button below opens Stripe's own checkout page for this plan — their page, their branding, their card handling — running in test mode, so no money moves."
        banner={
          <>
            Stripe <strong>test mode</strong>. The next page is Stripe's real checkout and does take
            card details — use the test card below. No money moves and a real card is declined.
          </>
        }
        footnote={
          <>
            This is a Stripe <strong>Payment Link</strong>, which needs no server behind it. That is
            why it works today while the full integration does not: that one requires a signed-in
            account, and Supabase is still over quota. The finished version differs in two ways —
            it knows <em>which</em> account is paying, and access is granted by Stripe's webhook
            rather than by coming back to this page.
          </>
        }
      >
        <dl className="space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm font-semibold text-[var(--color-ink-500)]">Plan</dt>
            <dd className="text-right font-bold text-[var(--color-ink-900)]">{PLANS[planId].name}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-4">
            <dt className="text-sm font-semibold text-[var(--color-ink-500)]">Due today</dt>
            <dd className="text-right font-display text-3xl font-extrabold text-[var(--color-ink-900)]">
              {formatPence(total)}
            </dd>
          </div>
        </dl>

        <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-bold text-amber-950">Use Stripe's test card</p>
          <p className="mt-2 font-mono text-lg font-bold tracking-wider text-amber-950">
            4242 4242 4242 4242
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Any future expiry date, any three-digit security code, any postcode. Stripe shows an
            orange <strong>TEST MODE</strong> banner on its page — that is how you know nothing is
            being charged. A real card would be declined here.
          </p>
        </div>

        <button
          type="button"
          onClick={goToStripe}
          className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white transition hover:bg-[var(--color-accent-600)]"
        >
          <ExternalLink size={16} aria-hidden="true" />
          Continue to Stripe
        </button>

        <button
          type="button"
          onClick={() => navigate('/checkout')}
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-[var(--color-ink-700)] transition hover:bg-slate-50"
        >
          Back
        </button>
      </DemoStageShell>
    );
  }

  return (
    <DemoStageShell
      eyebrow="Leaving Achievers Hub"
      title="Stripe's secure payment page"
      intro="In the live product the browser leaves Achievers Hub at this point and Stripe takes over. This screen stands in for that, so the rest of the journey can be walked through."
      footnote={
        <>
          The person is redirected to a page hosted by Stripe, on Stripe's own domain, showing the
          same plan and total. They enter their card there. Achievers Hub never sees, handles or
          stores the number — which is what the Privacy Notice already tells them.
        </>
      }
    >
      <dl className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm font-semibold text-[var(--color-ink-500)]">Plan</dt>
          <dd className="text-right font-bold text-[var(--color-ink-900)]">{PLANS[planId].name}</dd>
        </div>
        {seats > PLANS[planId].includedSeats && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm font-semibold text-[var(--color-ink-500)]">Students</dt>
            <dd className="text-right font-bold text-[var(--color-ink-900)]">{seats}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between gap-4 border-t border-slate-100 pt-4">
          <dt className="text-sm font-semibold text-[var(--color-ink-500)]">Due today</dt>
          <dd className="text-right font-display text-3xl font-extrabold text-[var(--color-ink-900)]">
            {formatPence(total)}
          </dd>
        </div>
        <p className="text-xs leading-5 text-[var(--color-ink-500)]">
          Then {formatPence(total)} each month until cancelled.
        </p>
      </dl>

      <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-[#fbfafc] p-5">
        <p className="flex items-center gap-2 text-sm font-bold text-[var(--color-ink-700)]">
          <CreditCard size={17} aria-hidden="true" />
          Card details would be entered here, on Stripe
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-500)]">
          Card number, expiry, security code and postcode — collected by Stripe, on Stripe's page,
          never by us. This demonstration collects nothing.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={pay}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white transition hover:bg-[var(--color-accent-600)]"
        >
          <Lock size={16} aria-hidden="true" />
          Simulate a successful payment
        </button>
        <button
          type="button"
          onClick={() => navigate('/pricing?checkout=cancelled')}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-bold text-[var(--color-ink-700)] transition hover:bg-slate-50"
        >
          Simulate backing out
        </button>
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[var(--color-ink-500)]">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[var(--color-success-500)]" aria-hidden="true" />
        For real, the membership is not switched on by this redirect. Stripe notifies the server
        separately, and that notification is the only thing that unlocks anything — so closing the
        tab after paying still gets you your membership, and landing on the success page without
        paying does not.
      </p>
    </DemoStageShell>
  );
}
