import { Link } from 'react-router-dom';
import { useScrollReveal } from '../lib/useScrollReveal';
import InfinityCarousel from '../components/InfinityCarousel';
import { ROLES, PATHWAYS } from '../constants/brand';

export default function HomePage() {
  useScrollReveal();

  return (
    <main className="pt-16 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pt-16 pb-12 md:pt-24 md:pb-20"
               style={{ background: 'var(--off-white)' }}>
        {/* Mesh background */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--hero-mesh, radial-gradient(ellipse 80% 60% at 70% -10%, #C0DD97 0%, transparent 60%), radial-gradient(ellipse 60% 50% at -10% 80%, #9FE1CB 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 100% 100%, #FAEEDA 0%, transparent 50%))' }} aria-hidden />

        <div className="relative z-10 max-w-3xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-7 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            GCSE Maths & Economics · AQA · Edexcel · OCR
          </div>

          <h1 className="font-display font-bold leading-[1.1] text-gray-900 mb-5 animate-fade-up"
              style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', animationDelay: '0.05s' }}>
            Stop guessing.<br />
            <em className="grad-text-green not-italic">Start knowing</em> what to revise.
          </h1>

          <p className="font-body text-gray-500 leading-relaxed mb-8 max-w-xl animate-fade-up"
             style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', animationDelay: '0.1s' }}>
            The Achievers Hub gives every student a personalised revision pathway based on a real diagnostic — so every session targets the topics that will move their grade forward most.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-10 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <Link to="/signup" className="btn-glow-green text-[15px] no-underline">
              Take the free diagnostic →
            </Link>
            <a href="#how" className="font-body font-medium text-gray-700 border border-gray-200 bg-white rounded-xl px-6 py-3.5 text-[15px] hover:border-green-300 transition-colors no-underline">
              See how it works
            </a>
          </div>

          <p className="text-xs text-gray-400 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            ✓ Free to start &nbsp;·&nbsp; No credit card needed &nbsp;·&nbsp; Built by teachers & examiners
          </p>
        </div>
      </section>

      {/* ── Proof bar ── */}
      <div className="proof-bar py-5">
        <div className="max-w-5xl mx-auto px-5 flex flex-wrap justify-around gap-5">
          {[
            { n: '5+', l: 'Years as teachers & examiners' },
            { n: '15 min', l: 'Daily habit, big results' },
            { n: '5', l: 'Personalised pathways' },
            { n: 'AQA · Edexcel · OCR', l: 'All major exam boards' },
          ].map((s) => (
            <div key={s.n} className="text-center text-white">
              <div className="font-display font-bold text-2xl block">{s.n}</div>
              <div className="text-xs text-white/70 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Infinity Carousel ── */}
      <section className="py-12 bg-white border-b border-gray-100 overflow-hidden">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          Everything on the platform
        </p>
        <InfinityCarousel />
      </section>

      {/* ── Who is it for ── */}
      <section className="py-16 md:py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="reveal text-xs font-bold uppercase tracking-widest text-green-600 mb-3">Who it's for</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-gray-900 leading-tight"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>
              One platform. <em className="grad-text-green">Three audiences.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ROLES.map((role, i) => (
              <Link key={role.key} to={role.path}
                className={`reveal reveal-delay-${i + 1} hover-lift group block no-underline bg-white border border-gray-100 rounded-2xl p-6 cursor-pointer`}
                style={{ boxShadow: 'var(--shadow-md)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                     style={{ background: role.faint }}>
                  {role.emoji}
                </div>
                <div className="font-body font-bold text-lg text-gray-900 mb-1">{role.label}</div>
                <p className="font-body text-sm text-gray-500 leading-relaxed mb-4">{role.tagline}</p>
                <span className="text-sm font-semibold no-underline transition-colors"
                      style={{ color: role.color }}>
                  See {role.label.toLowerCase()} features →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-16 md:py-24 px-5" style={{ background: '#F4F8F0' }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="reveal text-xs font-bold uppercase tracking-widest text-green-600 mb-3">How it works</p>
          <h2 className="reveal reveal-delay-1 font-display font-bold text-gray-900 mb-4"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
            From diagnosis to daily progress — <em className="italic text-teal-600">in three steps.</em>
          </h2>
          <p className="reveal reveal-delay-2 font-body text-gray-500 max-w-xl mx-auto mb-14 leading-relaxed">
            Not a library of content to scroll through. A structured revision engine that works with your student every single day.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Take the free diagnostic', body: 'A short assessment that maps exactly where the student is against the full GCSE specification. Takes about 10 minutes.' },
              { n: '02', title: 'Get your personalised pathway', body: 'Placed on one of five pathways — Entry, Foundation, Foundation Plus, Higher, or Higher Plus — matched to their actual level.' },
              { n: '03', title: 'Revise with purpose daily', body: 'Five targeted questions every day. Three at their level, one on their weakest topic, one stretch question to push forward.' },
            ].map((s, i) => (
              <div key={s.n} className={`reveal reveal-delay-${i + 1} bg-white border border-gray-100 rounded-2xl p-7 text-left hover-lift`}>
                <div className="font-display font-bold text-5xl mb-4" style={{ color: '#C0DD97', lineHeight: 1 }}>{s.n}</div>
                <h3 className="font-body font-bold text-gray-900 mb-2 text-[17px]">{s.title}</h3>
                <p className="font-body text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pathway tiers ── */}
      <section className="py-16 md:py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="reveal text-xs font-bold uppercase tracking-widest text-green-600 mb-3">Pathways</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-gray-900"
                style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
              Five tiers. One that's right for <em className="grad-text-green">where you are now.</em>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {PATHWAYS.map((p, i) => (
              <div key={p.name} className={`reveal reveal-delay-${i + 1} rounded-2xl p-5 border border-black/5 hover-lift`}
                   style={{ background: p.bg }}>
                <div className="h-1 rounded-full mb-4" style={{ background: p.color }} />
                <div className="font-body font-bold text-gray-900 text-sm mb-1">{p.name}</div>
                <div className="font-display font-bold text-3xl" style={{ color: p.color }}>{p.grades}</div>
                <div className="font-mono text-xs text-gray-400 mt-1">{p.score}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-16 md:py-24 px-5" style={{ background: '#F4F8F0' }}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="reveal text-xs font-bold uppercase tracking-widest text-green-600 mb-3">Pricing</p>
          <h2 className="reveal reveal-delay-1 font-display font-bold text-gray-900 mb-4"
              style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)' }}>
            Start free. Upgrade when you're ready.
          </h2>
          <p className="reveal reveal-delay-2 font-body text-gray-500 mb-12 max-w-md mx-auto">
            Take the free diagnostic and see the personalised pathway before spending a penny.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {[
              {
                name: 'The Essential', desc: 'Free to get started', price: 'Free', featured: false,
                features: ['Free diagnostic & pathway', '3 Daily 5 questions', 'Topic Hub videos & cards', 'Past paper downloads', 'Daily mindset prompts'],
                missing: ['Weak area & stretch questions', 'Parent dashboard', 'Spec tracker'],
              },
              {
                name: 'The Achiever', desc: '1 student + 1 parent', price: '£14.99', featured: true,
                features: ['Full Daily 5 (all 5 types)', 'Unlimited Topic Hub', 'Interactive spec mapper', 'Live parent dashboard', 'Past papers + diagnostics', 'Daily mindset prompts'],
                missing: [],
              },
              {
                name: 'The Achiever Plus', desc: 'Up to 3 students', price: '£24.99', featured: false,
                features: ['Everything in The Achiever', 'Up to 3 students', 'Full Daily 5 for all', 'Shared parent dashboard', 'Tutor access for all'],
                missing: [],
              },
            ].map((plan) => (
              <div key={plan.name}
                   className={`reveal hover-lift bg-white rounded-2xl p-7 relative border-2 transition-all
                     ${plan.featured ? 'border-green-400' : 'border-transparent'}`}
                   style={{ boxShadow: plan.featured ? 'var(--shadow-glow-green)' : 'var(--shadow-sm)' }}>
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-400 text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="font-display font-bold text-xl text-gray-900 mb-1">{plan.name}</div>
                <div className="text-sm text-gray-400 mb-4">{plan.desc}</div>
                <div className="font-display font-bold text-4xl text-gray-900 mb-1">
                  {plan.price}<span className="font-body text-base font-normal text-gray-400">{plan.price !== 'Free' ? '/mo' : ''}</span>
                </div>
                <div className="h-px bg-gray-100 my-5" />
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>{f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className="font-bold mt-0.5">—</span>{f}
                    </li>
                  ))}
                </ul>
                <Link to="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm no-underline transition-all
                    ${plan.featured ? 'btn-glow-green' : 'border border-gray-200 text-gray-700 hover:border-green-400 hover:text-green-700'}`}>
                  {plan.featured ? 'Start 7-day free trial' : plan.price === 'Free' ? 'Get started free' : `Get ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-gray-400">All plans include tutor access. Cancel anytime.</p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 px-5 text-center bg-gray-900">
        <div className="max-w-xl mx-auto">
          <h2 className="reveal font-display font-bold text-white mb-5"
              style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Your child's grades <em className="grad-text-green">can</em> improve.<br />The first step is free.
          </h2>
          <p className="reveal reveal-delay-1 font-body text-white/55 mb-8 leading-relaxed">
            Take the free diagnostic and find out exactly where they stand — and precisely what to do about it.
          </p>
          <Link to="/signup" className="reveal reveal-delay-2 btn-glow-green inline-block text-base no-underline">
            Take the free diagnostic →
          </Link>
        </div>
      </section>
    </main>
  );
}
