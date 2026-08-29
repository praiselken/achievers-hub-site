/**
 * The frame around the stand-in screens for Stripe's own pages.
 *
 * Two jobs. It keeps the demonstration looking like part of the product so the
 * client can judge the journey, and it makes absolutely plain — on screen, in
 * the same amber the dashboard already uses — that this is not Stripe and is not
 * taking a payment. A convincing fake checkout is the last thing anyone needs a
 * screenshot of.
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Container } from '../../components/marketing/Container';
import { isDemoMode } from '../../lib/demoMode';

export function DemoStageShell({
  eyebrow,
  title,
  intro,
  children,
  footnote,
  banner,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
  /** What happens here for real, once Stripe is live. */
  footnote: ReactNode;
  /**
   * Overrides the default banner. The screen that hands over to a real Stripe
   * Payment Link must say so: on that path Stripe genuinely does take card
   * details, and claiming otherwise would be false where it matters most.
   */
  banner?: ReactNode;
}) {
  // Reachable only from inside the walkthrough. A real visitor gets the pricing
  // page rather than a payment screen that cannot take a payment.
  if (!isDemoMode()) return <Navigate to="/pricing" replace />;

  return (
    <main className="mkt flex-1 bg-[#fbfafc]">
      <div
        className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-950"
        role="status"
      >
        {banner ?? (
          <>
            Demonstration only. This stands in for the secure Stripe page. No card details are
            collected and no payment is taken.
          </>
        )}
      </div>

      <Container className="max-w-2xl py-14 lg:py-20">
        <p className="text-sm font-extrabold text-[var(--color-primary-600)]">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">
          {title}
        </h1>
        <p className="mt-3 leading-7 text-[var(--color-ink-500)]">{intro}</p>

        <div className="mt-9 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          {children}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white/60 p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--color-ink-500)]">
            What happens here for real
          </p>
          <div className="mt-2 text-sm leading-6 text-[var(--color-ink-500)]">{footnote}</div>
        </div>
      </Container>
    </main>
  );
}
