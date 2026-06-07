import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../lib/useScrollReveal';

// ── Types ─────────────────────────────────────────────────────────────────────

type Audience = 'students' | 'tutors';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price: string;
  period?: string;
  badge?: string;
  badgeColor?: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
  ctaLabel: string;
  ctaStyle: 'primary' | 'outline';
  features: PlanFeature[];
}

// ── Plan data ─────────────────────────────────────────────────────────────────

const STUDENT_PLANS: Plan[] = [
  {
    id: 'essential',
    name: 'The Essential',
    tagline: 'Free forever',
    price: 'Free',
    accentBg: '#f9fafb',
    accentBorder: '#e5e7eb',
    accentText: '#374151',
    ctaLabel: 'Get started free',
    ctaStyle: 'outline',
    features: [
      { text: 'Free diagnostic & pathway',    included: true  },
      { text: '3 Daily 5 questions per day',  included: true  },
      { text: 'Videos & study cards',         included: true  },
      { text: 'Past paper downloads',         included: true  },
      { text: 'Daily mindset prompts',        included: true  },
      { text: 'Weak & stretch questions',     included: false },
      { text: 'Parent dashboard',             included: false },
      { text: 'Spec tracker',                 included: false },
      { text: 'Tutor booking access',         included: false },
    ],
  },
  {
    id: 'achiever',
    name: 'The Achiever',
    tagline: '1 student + 1 parent',
    price: '£14.99',
    period: '/mo',
    badge: 'Most popular',
    badgeColor: 'var(--purple)',
    accentBg: 'var(--purple-faint)',
    accentBorder: 'var(--purple)',
    accentText: 'var(--purple-dark)',
    ctaLabel: 'Start 7-day free trial',
    ctaStyle: 'primary',
    features: [
      { text: 'Full Daily 5 — all 5 question types', included: true },
      { text: 'Unlimited Topic Hub',                 included: true },
      { text: 'Interactive spec mapper',             included: true },
      { text: 'Live parent dashboard & alerts',      included: true },
      { text: 'Past papers + diagnostics',           included: true },
      { text: 'Tutor booking access',                included: true },
      { text: 'Weak & stretch questions',            included: true },
      { text: 'Priority support',                    included: true },
      { text: 'Up to 3 students',                    included: false },
    ],
  },
  {
    id: 'achiever-plus',
    name: 'The Achiever Plus',
    tagline: 'Up to 3 students',
    price: '£24.99',
    period: '/mo',
    accentBg: '#FAEEDA',
    accentBorder: '#F0C88A',
    accentText: '#7A4D0F',
    ctaLabel: 'Get Achiever Plus',
    ctaStyle: 'outline',
    features: [
      { text: 'Everything in The Achiever',   included: true },
      { text: 'Up to 3 students',             included: true },
      { text: 'Shared parent dashboard',      included: true },
      { text: 'Full Daily 5 for all',         included: true },
      { text: 'Tutor access for all students', included: true },
      { text: 'Family progress reports',      included: true },
      { text: 'Priority support',             included: true },
      { text: 'Dedicated account manager',    included: false },
    ],
  },
];

const TUTOR_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Get listed for free',
    price: 'Free',
    accentBg: '#f9fafb',
    accentBorder: '#e5e7eb',
    accentText: '#374151',
    ctaLabel: 'Apply as a tutor',
    ctaStyle: 'outline',
    features: [
      { text: 'Profile on the platform',        included: true  },
      { text: 'Up to 3 active students',        included: true  },
      { text: 'Session scheduling',             included: true  },
      { text: 'Student progress snapshots',     included: true  },
      { text: 'Resource library access',        included: false },
      { text: 'Analytics dashboard',            included: false },
      { text: 'Priority listing in search',     included: false },
      { text: 'Dedicated onboarding support',   included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For growing tutors',
    price: '£25',
    period: '/mo',
    badge: 'Most popular',
    badgeColor: 'var(--purple)',
    accentBg: 'var(--purple-faint)',
    accentBorder: 'var(--purple)',
    accentText: 'var(--purple-dark)',
    ctaLabel: 'Start free trial',
    ctaStyle: 'primary',
    features: [
      { text: 'Unlimited active students',      included: true },
      { text: 'Full analytics dashboard',       included: true },
      { text: 'Student progress snapshots',     included: true },
      { text: 'Resource library access',        included: true },
      { text: 'Priority listing in search',     included: true },
      { text: 'Session notes & reports',        included: true },
      { text: 'Dedicated onboarding support',   included: false },
      { text: 'White-label reports',            included: false },
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    tagline: 'For professional tutors',
    price: '£50',
    period: '/mo',
    accentBg: '#FAEEDA',
    accentBorder: '#F0C88A',
    accentText: '#7A4D0F',
    ctaLabel: 'Get Elite',
    ctaStyle: 'outline',
    features: [
      { text: 'Everything in Pro',              included: true },
      { text: 'Dedicated onboarding support',   included: true },
      { text: 'White-label reports',            included: true },
      { text: 'Featured profile badge',         included: true },
      { text: 'Custom resource uploads',        included: true },
      { text: 'Early access to new features',   included: true },
      { text: 'Monthly strategy call',          included: true },
      { text: 'Priority support SLA',           included: true },
    ],
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes — no long-term commitment. Cancel from your account settings before your next billing date and you keep access until the end of the period.',
  },
  {
    q: 'What happens after the free trial?',
    a: "You'll be asked to add a payment method at the end of your 7-day trial. If you don't, your account automatically drops to the free Essential plan — you won't lose any data.",
  },
  {
    q: 'Does the parent dashboard require a separate account?',
    a: 'Yes — parents create their own account and link to their child using an invite code. Both accounts are managed separately but show the same progress data.',
  },
  {
    q: 'Which exam boards are supported?',
    a: 'Currently AQA, Edexcel, and OCR for both GCSE Maths and GCSE Economics. More subjects are coming — Physics is next.',
  },
  {
    q: 'Is there a discount for multiple subjects?',
    a: 'The Achiever plan covers all available subjects for one student. Achiever Plus covers up to 3 students across all subjects — no per-subject charges.',
  },
  {
    q: 'How does tutor pricing work?',
    a: "Tutors pay a monthly subscription for platform access. There are no commission fees on sessions — you set your own rates and keep 100% of what you charge.",
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Check({ included }: { included: boolean }) {
  if (included) {
    return (
      <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0" style={{ color: '#4A8A14' }}>
        <circle cx="8" cy="8" r="7" fill="#EAF3DE"/>
        <path d="M5 8l2 2 4-4" stroke="#4A8A14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4 flex-shrink-0">
      <circle cx="8" cy="8" r="7" fill="#f3f4f6"/>
      <path d="M5.5 8h5" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

function PlanCard({ plan, highlighted }: { plan: Plan; highlighted: boolean }) {
  return (
    <div className={`relative flex flex-col rounded-3xl overflow-hidden transition-all ${highlighted ? 'shadow-2xl scale-[1.02] md:scale-105 z-10' : 'shadow-sm'}`}
         style={{
           background: 'white',
           border: `2px solid ${highlighted ? plan.accentBorder : '#e5e7eb'}`,
         }}>

      {/* Popular badge */}
      {plan.badge && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <span className="font-body text-xs font-bold px-4 py-1.5 rounded-full text-white whitespace-nowrap"
                style={{ background: plan.badgeColor ?? 'var(--purple)' }}>
            {plan.badge}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="px-7 pt-8 pb-6" style={{ background: highlighted ? plan.accentBg : 'white' }}>
        <h3 className="font-display font-bold text-xl text-gray-900 mb-0.5">{plan.name}</h3>
        <p className="font-body text-sm text-gray-500 mb-5">{plan.tagline}</p>
        <div className="flex items-end gap-1">
          <span className="font-display font-bold text-4xl text-gray-900">{plan.price}</span>
          {plan.period && (
            <span className="font-body text-sm text-gray-400 mb-1">{plan.period}</span>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 px-7 py-5 flex flex-col gap-3 border-t border-gray-100">
        {plan.features.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <Check included={f.included} />
            <span className={`font-body text-sm ${f.included ? 'text-gray-700' : 'text-gray-400'}`}>
              {f.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-7 pb-7 pt-4">
        <Link to="/signup"
          className={`block w-full text-center py-3.5 rounded-2xl font-body font-bold text-sm no-underline transition-all ${
            plan.ctaStyle === 'primary'
              ? 'text-white'
              : 'border-2'
          }`}
          style={plan.ctaStyle === 'primary'
            ? { background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))', boxShadow: 'var(--shadow-glow-purple)' }
            : { borderColor: plan.accentBorder, color: plan.accentText, background: plan.accentBg }
          }>
          {plan.ctaLabel}
        </Link>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left">
        <span className="font-body font-semibold text-gray-900 text-sm">{q}</span>
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
             strokeLinecap="round" strokeLinejoin="round"
             className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform"
             style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M5 8l5 5 5-5"/>
        </svg>
      </button>
      {open && (
        <p className="font-body text-sm text-gray-600 leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  useScrollReveal();
  const [audience, setAudience] = useState<Audience>('students');
  const plans = audience === 'students' ? STUDENT_PLANS : TUTOR_PLANS;

  return (
    <main className="pt-16 min-h-screen" style={{ background: 'var(--off-white)' }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pt-14 pb-12 md:pt-20 md:pb-16 text-center">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 70% 60% at 80% -10%, #D8B8E0 0%, transparent 55%), radial-gradient(ellipse 55% 45% at -10% 100%, #C8E49A 0%, transparent 55%)' }}
             aria-hidden />

        <div className="relative max-w-2xl mx-auto reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-body text-xs font-bold uppercase tracking-wider mb-5"
               style={{ background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1px solid var(--purple-light)' }}>
            Simple, honest pricing
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-900 leading-tight mb-4">
            Start free.<br />
            <span style={{ color: 'var(--purple)' }}>Upgrade when you're ready.</span>
          </h1>
          <p className="font-body text-lg text-gray-500 max-w-lg mx-auto mb-8">
            Take the free diagnostic and see your personalised pathway before spending a penny.
          </p>

          {/* Audience toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl"
               style={{ background: 'white', border: '1.5px solid #e5e7eb', boxShadow: '0 2px 8px rgba(28,28,46,0.06)' }}>
            {(['students', 'tutors'] as Audience[]).map(a => (
              <button key={a} onClick={() => setAudience(a)}
                className="px-6 py-2.5 rounded-xl font-body font-semibold text-sm capitalize transition-all"
                style={audience === a
                  ? { background: 'var(--purple)', color: 'white', boxShadow: '0 2px 8px rgba(153,112,166,0.35)' }
                  : { color: '#6b7280' }}>
                {a === 'students' ? 'Students & Families' : 'Tutors'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ── */}
      <section className="px-5 pb-16 reveal">
        <div className="max-w-5xl mx-auto">
          {/* Money-back note */}
          <p className="font-body text-sm text-gray-400 text-center mb-10">
            {audience === 'students'
              ? '7-day free trial on paid plans · Cancel anytime · No card required for Essential'
              : '14-day free trial on Pro & Elite · No commission on sessions · Cancel anytime'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} highlighted={i === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison note for students ── */}
      {audience === 'students' && (
        <section className="px-5 pb-16 reveal">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl p-8 md:p-10"
                 style={{ background: 'linear-gradient(135deg, var(--purple-faint) 0%, #EDE0F4 100%)', border: '1px solid var(--purple-light)' }}>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <p className="font-body text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--purple)' }}>
                    Why The Achiever?
                  </p>
                  <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
                    Less than one tutoring hour. More than a full revision system.
                  </h2>
                  <p className="font-body text-sm text-gray-600 leading-relaxed">
                    A single tutoring session costs £40–£80. The Achiever gives a student a complete daily revision routine, parent visibility, and spec tracking for £14.99 a month — for as many sessions as they want.
                  </p>
                </div>
                <Link to="/signup"
                  className="btn-glow-purple text-sm px-6 py-3.5 no-underline whitespace-nowrap flex-shrink-0"
                  style={{ borderRadius: '14px' }}>
                  Start 7-day trial →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Tutor value prop ── */}
      {audience === 'tutors' && (
        <section className="px-5 pb-16 reveal">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl p-8 md:p-10"
                 style={{ background: 'linear-gradient(135deg, #FAEEDA 0%, #FDF0DC 100%)', border: '1px solid #F0C88A' }}>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <p className="font-body text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#BA7517' }}>
                    Zero commission
                  </p>
                  <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
                    Keep 100% of what you earn.
                  </h2>
                  <p className="font-body text-sm text-gray-600 leading-relaxed">
                    Other platforms take 20–30% commission on every session. We charge a flat monthly fee so you set your own rates and keep every penny — whether you charge £30 or £80 an hour.
                  </p>
                </div>
                <Link to="/signup"
                  className="btn-glow-purple text-sm px-6 py-3.5 no-underline whitespace-nowrap flex-shrink-0"
                  style={{ borderRadius: '14px' }}>
                  Apply as a tutor →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Trust bar ── */}
      <section className="px-5 pb-16 reveal">
        <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔒', label: 'No card required', sub: 'for free plan' },
            { icon: '↩️', label: 'Cancel anytime',  sub: 'no lock-in' },
            { icon: '🛡️', label: 'Secure payments', sub: 'via Stripe' },
            { icon: '💬', label: 'Real support',    sub: 'not just a chatbot' },
          ].map(t => (
            <div key={t.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100"
                 style={{ boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className="font-body font-bold text-sm text-gray-900">{t.label}</p>
              <p className="font-body text-xs text-gray-400 mt-0.5">{t.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-5 pb-20 reveal">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl text-gray-900 text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="bg-white rounded-3xl px-7 border border-gray-100"
               style={{ boxShadow: '0 4px 24px rgba(28,28,46,0.06)' }}>
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section className="px-5 pb-20 reveal">
        <div className="max-w-2xl mx-auto text-center rounded-3xl py-14 px-8"
             style={{ background: 'linear-gradient(135deg, #2D1B3D 0%, #1A0F2E 100%)' }}>
          <p className="font-body text-xs font-bold uppercase tracking-wider mb-3"
             style={{ color: 'var(--purple-light)' }}>Ready to start?</p>
          <h2 className="font-display font-bold text-3xl text-white mb-3">
            Your first step is free.
          </h2>
          <p className="font-body text-gray-400 mb-8 max-w-sm mx-auto">
            Take the diagnostic, see your pathway, and start your Daily 5 — no payment needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup"
              className="btn-glow-purple px-7 py-3.5 font-semibold no-underline"
              style={{ borderRadius: '14px' }}>
              Start for free →
            </Link>
            <Link to="/student"
              className="px-7 py-3.5 rounded-2xl font-body font-semibold text-sm no-underline transition-all"
              style={{ border: '1.5px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}>
              Learn more
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
