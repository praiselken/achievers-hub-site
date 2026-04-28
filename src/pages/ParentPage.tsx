import { Link } from 'react-router-dom';
import { useScrollReveal } from '../lib/useScrollReveal';

const PROBLEMS = [
  { icon: '😰', bg: '#FAECE7', title: '"I don\'t know what they don\'t know"', body: 'Without visibility on specific weak topics, you can\'t have useful conversations or find a tutor who\'ll target the right things.' },
  { icon: '📚', bg: '#FAEEDA', title: 'Generic resources go nowhere', body: 'Revision guides and YouTube cover everything — which means they fix nothing specific to your child\'s gaps.' },
  { icon: '📉', bg: '#EEEDFE', title: 'Revision that fizzles out', body: 'Without daily structure and accountability, even motivated students lose momentum weeks before exams.' },
  { icon: '🔍', bg: '#EAF3DE', title: 'No real visibility as a parent', body: 'Your child says "I\'ve been revising." But are they? And are they revising the right things for their exam board?' },
];

const PARENT_FEATURES = [
  { title: 'Weekly progress summaries', body: 'Which topics improved, what scores changed, and where gaps remain — delivered to your inbox every week.' },
  { title: 'Spec coverage map', body: 'See exactly how much of the GCSE specification your child has covered — by topic, by week.' },
  { title: 'Weak topic alerts', body: 'Know exactly which topics are flagged — so you can have informed conversations and find the right support.' },
  { title: 'Book a tutor with real data', body: 'Every tutor on the platform has access to your child\'s actual performance data — no session time wasted.' },
];

export default function ParentPage() {
  useScrollReveal();

  return (
    <main className="pt-16 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pt-14 pb-14 md:pt-20 md:pb-20"
               style={{ background: 'var(--off-white)' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 80% 60% at 70% -10%, #FAC775 0%, transparent 60%), radial-gradient(ellipse 60% 50% at -10% 80%, #9FE1CB 0%, transparent 60%)' }}
             aria-hidden />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div>
            <div className="inline-block bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
              For Parents
            </div>
            <h1 className="font-display font-bold text-gray-900 leading-[1.1] mb-5"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>
              Your child's GCSE results, <em className="grad-text-orange italic">finally in your hands.</em>
            </h1>
            <p className="font-body text-gray-500 leading-relaxed mb-7"
               style={{ fontSize: 'clamp(1rem, 2vw, 1.05rem)' }}>
              The Achievers Hub diagnoses exactly where your child is struggling, builds a targeted daily revision habit in just 15 minutes, and gives you real visibility into their progress — every week.
            </p>
            <div className="flex flex-wrap gap-3 mb-5">
              <Link to="/signup" className="btn-glow-orange text-[15px] no-underline">Take the free diagnostic test</Link>
              <a href="#how" className="font-body font-medium text-gray-700 border border-gray-200 bg-white rounded-xl px-6 py-3.5 text-[15px] no-underline hover:border-amber-300 transition-colors">See how it works</a>
            </div>
            <p className="text-xs text-gray-400">✓ Free to start &nbsp;·&nbsp; No credit card needed &nbsp;·&nbsp; Built by teachers & examiners</p>
          </div>

          {/* Dashboard mock */}
          <div className="flex flex-col gap-3">
            <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amara's pathway</span>
                <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1 rounded-full">🔥 14-day streak</span>
              </div>
              <div className="text-xs text-teal-600 font-semibold mb-1">Current level — Maths (AQA)</div>
              <div className="font-display font-semibold text-xl text-gray-900 mb-3">Foundation Plus</div>
              <div className="bg-green-50 rounded-full h-2 overflow-hidden mb-1">
                <div className="h-full rounded-full bg-green-400" style={{ width: '68%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>68% of spec covered</span><span>Target: Higher by April</span>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Parent dashboard</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />Live
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[{ n: '5/7', l: 'Days active' }, { n: '+12%', l: 'Score trend', green: true }, { n: '3', l: 'Weak topics' }].map(s => (
                  <div key={s.l} className="bg-gray-50 rounded-xl p-3 text-center">
                    <div className={`font-display font-bold text-xl ${s.green ? 'text-green-600' : 'text-gray-900'}`}>{s.n}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{s.l}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Fractions', 'Ratio & Proportion', 'Angle Facts'].map(t => (
                  <span key={t} className="bg-coral-50 text-coral-600 text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: '#FAECE7', color: '#993C1D' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Spec mapper preview */}
            <div className="rounded-2xl p-5" style={{ background: '#0F6E56' }}>
              <div className="text-xs font-bold text-white/55 uppercase tracking-wider mb-3">Spec mapper — topic coverage</div>
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
                {Array.from({ length: 16 }, (_, i) => (
                  <div key={i} className="h-4 rounded" style={{ background: [0,1,2,3,6,9,10].includes(i) ? '#5DCAA5' : 'rgba(255,255,255,0.15)' }} />
                ))}
              </div>
              <div className="flex gap-4 mt-2">
                {[{ c: '#5DCAA5', l: 'Covered' }, { c: 'rgba(255,255,255,0.2)', l: 'Not yet' }].map(l => (
                  <div key={l.l} className="flex items-center gap-1.5 text-xs text-white/60">
                    <div className="w-2 h-2 rounded-sm" style={{ background: l.c }} />{l.l}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Proof bar ── */}
      <div className="proof-bar py-5">
        <div className="max-w-5xl mx-auto px-5 flex flex-wrap justify-around gap-5">
          {[{ n: '5+', l: 'Years teaching & examining' }, { n: '15 min', l: 'Daily habit' }, { n: '5', l: 'Grade pathways' }, { n: 'Weekly', l: 'Parent report' }].map(s => (
            <div key={s.n} className="text-center text-white">
              <div className="font-display font-bold text-2xl">{s.n}</div>
              <div className="text-xs text-white/65 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Problem section ── */}
      <section className="py-16 md:py-24 px-5" style={{ background: '#FBF9F4' }}>
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full mb-4">For parents</div>
          <h2 className="reveal font-display font-bold text-gray-900 mb-3"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
            You want to help. But <em className="grad-text-orange italic">where do you even start?</em>
          </h2>
          <p className="reveal reveal-delay-1 font-body text-gray-500 max-w-xl mb-10 leading-relaxed">
            Most parents face the same wall: they know their child is struggling, but they have no idea which topics are the problem — or how to help without becoming a GCSE tutor themselves.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROBLEMS.map((p, i) => (
              <div key={p.title} className={`reveal reveal-delay-${i + 1} bg-white border border-gray-100 rounded-2xl p-6 hover-lift`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-4"
                     style={{ background: p.bg }}>{p.icon}</div>
                <h3 className="font-body font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-16 md:py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full mb-4">How it works</div>
            <h2 className="reveal font-display font-bold text-gray-900"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
              From diagnosis to daily progress — in four steps
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { n: '01', title: 'Take the free diagnostic', body: 'Student completes a short test. Placed on a personalised pathway matched to their actual level.' },
              { n: '02', title: 'Daily 5 practice', body: 'Five targeted questions per day. Three at their level, one weak topic, one stretch.' },
              { n: '03', title: 'You get weekly reports', body: 'Progress, streak, weak topics, score trends — delivered to your inbox automatically.' },
              { n: '04', title: 'Book a tutor with data', body: 'Every tutor sees your child\'s real diagnostic data — so sessions target the right topics.' },
            ].map((s, i) => (
              <div key={s.n} className={`reveal reveal-delay-${i + 1} bg-white border border-gray-100 rounded-2xl p-6`}>
                <div className="font-display font-bold text-5xl mb-3" style={{ color: '#FAC775', lineHeight: 1 }}>{s.n}</div>
                <h3 className="font-body font-semibold text-gray-900 mb-2 text-[15px]">{s.title}</h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Parent features ── */}
      <section className="py-16 md:py-24 px-5" style={{ background: '#F4F8F0' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full mb-4">For parents</div>
            <h2 className="reveal font-display font-bold text-gray-900 mb-3"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
              Full visibility. <em className="grad-text-green italic">No more guessing.</em>
            </h2>
            <p className="reveal reveal-delay-1 font-body text-gray-500 mb-6 leading-relaxed">
              You shouldn't have to take your child's word for it. The parent dashboard gives you a clear, honest picture — and the data to act on it.
            </p>
            <div className="flex flex-col gap-4">
              {PARENT_FEATURES.map((f, i) => (
                <div key={f.title} className={`reveal reveal-delay-${i + 1} flex items-start gap-3`}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                       style={{ background: '#639922' }}>✓</div>
                  <div>
                    <div className="font-body font-semibold text-gray-900 mb-0.5">{f.title}</div>
                    <p className="font-body text-sm text-gray-500 leading-relaxed">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed report card */}
          <div className="reveal reveal-delay-2">
            <div className="bg-white border border-gray-100 rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-body font-bold text-gray-900">Parent dashboard</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />Live
                </span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="text-xs text-gray-400 font-semibold mb-3 uppercase tracking-wider">Maths (AQA) — Amara</div>
                {[
                  { l: 'Pathway', v: 'Foundation Plus', vc: '#0F6E56' },
                  { l: 'Active days this week', v: '5 / 7', vc: '#1C1C2E' },
                  { l: 'Score trend (4 weeks)', v: '↑ +12%', vc: '#639922' },
                  { l: 'Spec coverage', v: '68%', vc: '#1C1C2E' },
                ].map(r => (
                  <div key={r.l} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{r.l}</span>
                    <span className="text-sm font-semibold" style={{ color: r.vc }}>{r.v}</span>
                  </div>
                ))}
                <div className="text-xs font-bold text-coral-600 mt-3 mb-2" style={{ color: '#993C1D' }}>Weak topics flagged</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Fractions', 'Ratio & Proportion', 'Angle Facts'].map(t => (
                    <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ background: '#FAECE7', color: '#993C1D' }}>{t}</span>
                  ))}
                </div>
              </div>
              <Link to="/signup" className="btn-glow-green block text-center text-sm no-underline">
                Book a tutor with this data →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-16 md:py-24 px-5 bg-white text-center">
        <div className="max-w-5xl mx-auto">
          <div className="inline-block bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full mb-4">Pricing</div>
          <h2 className="reveal font-display font-bold text-gray-900 mb-3"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
            Start free. Upgrade when you're ready.
          </h2>
          <p className="reveal reveal-delay-1 font-body text-gray-500 mb-10 max-w-md mx-auto">
            Take the free diagnostic and see your child's personalised pathway before spending a penny.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {[
              { name: 'The Essential', desc: 'Free forever', price: 'Free', featured: false, cta: 'Get started free',
                features: ['Free diagnostic & pathway', '3 Daily 5 questions', 'Videos & study cards', 'Past paper downloads', 'Daily mindset prompts'],
                missing: ['Weak & stretch questions', 'Parent dashboard', 'Spec tracker'] },
              { name: 'The Achiever', desc: '1 student + 1 parent', price: '£14.99', featured: true, cta: 'Start 7-day free trial',
                features: ['Full Daily 5 (all 5 types)', 'Unlimited Topic Hub', 'Interactive spec mapper', 'Live parent dashboard & alerts', 'Past papers + diagnostics', 'Tutor booking access'],
                missing: [] },
              { name: 'The Achiever Plus', desc: 'Up to 3 students', price: '£24.99', featured: false, cta: 'Get Achiever Plus',
                features: ['Everything in The Achiever', 'Up to 3 students', 'Shared parent dashboard', 'Full Daily 5 for all', 'Tutor access for all'],
                missing: [] },
            ].map((plan) => (
              <div key={plan.name}
                   className={`reveal hover-lift bg-white rounded-2xl p-7 relative border-2 ${plan.featured ? 'border-green-400' : 'border-transparent'}`}
                   style={{ boxShadow: plan.featured ? 'var(--shadow-glow-green)' : 'var(--shadow-sm)' }}>
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-400 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    Most popular
                  </div>
                )}
                <div className="font-display font-bold text-xl text-gray-900 mb-1">{plan.name}</div>
                <div className="text-sm text-gray-400 mb-4">{plan.desc}</div>
                <div className="font-display font-bold text-4xl text-gray-900 mb-1">
                  {plan.price}<span className="font-body text-sm font-normal text-gray-400">{plan.price !== 'Free' ? '/mo' : ''}</span>
                </div>
                <div className="h-px bg-gray-100 my-4" />
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => <li key={f} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-green-500 font-bold">✓</span>{f}</li>)}
                  {plan.missing.map(f => <li key={f} className="flex items-start gap-2 text-sm text-gray-300"><span className="font-bold">—</span>{f}</li>)}
                </ul>
                <Link to="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm no-underline transition-all
                    ${plan.featured ? 'btn-glow-green' : 'border border-gray-200 text-gray-700 hover:border-green-400'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-5 text-center bg-gray-900">
        <div className="max-w-xl mx-auto">
          <h2 className="reveal font-display font-bold text-white mb-5"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Your child's grades <em className="grad-text-green italic">can</em> improve.<br />The first step is free.
          </h2>
          <p className="reveal reveal-delay-1 font-body text-white/55 mb-8 leading-relaxed">
            Take the free diagnostic today and find out exactly where your child stands — and precisely what to do about it.
          </p>
          <Link to="/signup" className="reveal reveal-delay-2 btn-glow-green inline-block text-base no-underline">
            Take the free diagnostic →
          </Link>
        </div>
      </section>
    </main>
  );
}
