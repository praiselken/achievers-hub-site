import { Link } from 'react-router-dom';
import { useScrollReveal } from '../lib/useScrollReveal';

const FEATURES = [
  { icon: '📊', title: 'Student weak-topic data', body: 'Before every session, see exactly which topics each student is struggling with — ranked by diagnostic score.', tag: 'All tiers' },
  { icon: '📅', title: 'Session booking', body: 'Students book directly on the platform. You add a meeting link and pre-session notes. No back-and-forth.', tag: 'Starter+' },
  { icon: '📈', title: 'Progress tracking', body: 'Track each student\'s pathway changes, score trends, and Daily 5 consistency between sessions.', tag: 'All tiers' },
  { icon: '🔗', title: 'External calendar', body: 'Connect Calendly or Google Calendar so students see your availability directly. Full in-platform calendar management coming later.', tag: 'Phase 1' },
  { icon: '📝', title: 'Pre-session notes', body: 'Add context to each booking — what to cover, which topics to push on. Students see it before the session.', tag: 'Starter+' },
  { icon: '🎯', title: 'Referral tracking', body: 'A referral code tied to your profile. Students you bring to the platform are automatically linked to your dashboard.', tag: 'Later phase', soon: true },
];

const TUTOR_PLANS = [
  { name: 'Tutor Starter', price: 'Free', desc: 'Get started', features: ['Student diagnostic data', 'Basic booking tools', 'Session link sharing', 'Platform visibility'], missing: ['Priority listing', 'Advanced analytics', 'Referral tracking'] },
  { name: 'Tutor Pro', price: '£25', desc: 'Per month', features: ['Everything in Starter', 'Priority listing in search', 'Advanced student analytics', 'Pre-session notes', 'Lower marketplace fee'], missing: ['Dedicated support', 'Multi-student bulk view'] },
  { name: 'Tutor Elite', price: '£50', desc: 'Per month', features: ['Everything in Pro', 'Dedicated support', 'Multi-student bulk view', 'Custom referral tracking', 'Lowest marketplace fee'], missing: [] },
];

export default function TutorPage() {
  useScrollReveal();

  return (
    <main className="pt-16 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pt-14 pb-14 md:pt-20 md:pb-20"
               style={{ background: 'var(--off-white)' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 80% 60% at 70% -10%, #C4A8D0 0%, transparent 60%), radial-gradient(ellipse 60% 50% at -10% 80%, #C0DD97 0%, transparent 60%)' }}
             aria-hidden />

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-purple-50 text-purple-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6"
                 style={{ background: '#EEEDFE', color: '#3C3489' }}>
              For Tutors
            </div>
            <h1 className="font-display font-bold text-gray-900 leading-[1.1] mb-5"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)' }}>
              Walk into every session <em className="grad-text-purple italic">knowing exactly where to focus.</em>
            </h1>
            <p className="font-body text-gray-500 leading-relaxed mb-7"
               style={{ fontSize: 'clamp(1rem, 2vw, 1.05rem)' }}>
              The Achievers Hub gives you real diagnostic data on your students — their weak topics, pathway, and progress between sessions. So you spend session time teaching, not diagnosing.
            </p>
            <div className="flex flex-wrap gap-3 mb-5">
              <Link to="/signup" className="btn-glow-purple text-[15px] no-underline">Set up your tutor profile →</Link>
              <Link to="/student" className="font-body font-medium text-gray-700 border border-gray-200 bg-white rounded-xl px-6 py-3.5 text-[15px] no-underline hover:border-purple-300 transition-colors">See student experience</Link>
            </div>
            <p className="text-xs text-gray-400">✓ Free to join &nbsp;·&nbsp; Students book directly &nbsp;·&nbsp; Data-informed sessions</p>
          </div>

          {/* Student data card mock */}
          <div className="reveal reveal-delay-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0"
                     style={{ background: '#9970A6' }}>S</div>
                <div className="flex-1">
                  <div className="font-body font-bold text-gray-900 text-sm">Student A</div>
                  <div className="font-mono text-xs text-gray-400">GCSE Maths · AQA · Foundation Plus</div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#FAEEDA', color: '#BA7517' }}>
                  Foundation Plus
                </span>
              </div>

              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Weakest topics (last 14 days)</div>
              <div className="flex flex-col gap-2 mb-4">
                {[{ t: 'Quadratic Equations', s: '42%' }, { t: 'Probability Trees', s: '48%' }, { t: 'Ratio & Proportion', s: '54%' }].map(w => (
                  <div key={w.t} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100">
                    <span className="font-body text-sm text-gray-800 font-medium">{w.t}</span>
                    <span className="font-mono text-xs font-bold" style={{ color: '#D85A30' }}>{w.s}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                {[{ l: 'Daily 5 this week', v: '4 / 5', vc: '#639922' }, { l: 'Streak', v: '🔥 11 days', vc: '#BA7517' }, { l: 'Next session', v: 'Thu 14:00', vc: '#1C1C2E' }].map(r => (
                  <div key={r.l} className="flex justify-between">
                    <span className="text-sm text-gray-500">{r.l}</span>
                    <span className="text-sm font-semibold" style={{ color: r.vc }}>{r.v}</span>
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
          {[{ n: 'Live', l: 'Student diagnostic data' }, { n: '3', l: 'Weak topics pre-session' }, { n: '0%', l: 'Session time on diagnosis' }, { n: 'Free', l: 'To join the platform' }].map(s => (
            <div key={s.n} className="text-center text-white">
              <div className="font-display font-bold text-2xl">{s.n}</div>
              <div className="text-xs text-white/65 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section className="py-16 md:py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="reveal text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9970A6' }}>What tutors get</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-gray-900"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
              Tools built around <em className="grad-text-purple italic">how you actually work.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`reveal reveal-delay-${(i % 3) + 1} bg-white border border-gray-100 rounded-2xl p-6 hover-lift flex gap-4 ${f.soon ? 'opacity-70' : ''}`}
                   style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-body font-bold text-gray-900 text-[15px]">{f.title}</h3>
                    {f.soon && <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-2 py-0.5 rounded uppercase tracking-wider">Later phase</span>}
                  </div>
                  <p className="font-body text-sm text-gray-500 leading-relaxed mb-2">{f.body}</p>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#EEEDFE', color: '#534AB7' }}>{f.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Booking flow ── */}
      <section className="py-16 md:py-24 px-5 bg-gray-900 text-center">
        <div className="max-w-5xl mx-auto">
          <p className="reveal text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#B5C47A' }}>Session booking</p>
          <h2 className="reveal reveal-delay-1 font-display font-bold text-white mb-4"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
            How booking works — Phase 1
          </h2>
          <p className="reveal reveal-delay-2 font-body text-white/55 max-w-lg mx-auto mb-12 leading-relaxed">
            Full in-platform calendar management is coming in a later phase. Here's how Phase 1 tutoring booking works.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-left">
            {[
              { n: '01', t: 'Connect your calendar', b: 'Link Calendly or Google Calendar from your profile. Students see your availability.' },
              { n: '02', t: 'Student books a session', b: 'They select a slot. It appears in your list with their weak-topic data attached.' },
              { n: '03', t: 'Add your meeting link', b: 'Paste Zoom or Meet link into the session. The student sees it on their dashboard.' },
              { n: '04', t: 'Add pre-session notes', b: 'Optional context for the student — topics to cover, prep work, anything relevant.' },
            ].map((s, i) => (
              <div key={s.n} className={`reveal reveal-delay-${i + 1} rounded-2xl p-6 border`}
                   style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg inline-block mb-4"
                     style={{ background: 'rgba(181,196,122,0.2)', color: '#B5C47A' }}>{s.n}</div>
                <h3 className="font-body font-bold text-white mb-2 text-[14px]">{s.t}</h3>
                <p className="font-body text-xs text-white/45 leading-relaxed">{s.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tutor pricing ── */}
      <section className="py-16 md:py-24 px-5 bg-white text-center">
        <div className="max-w-5xl mx-auto">
          <p className="reveal text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#9970A6' }}>Tutor plans</p>
          <h2 className="reveal reveal-delay-1 font-display font-bold text-gray-900 mb-4"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
            Join free. Upgrade as you grow.
          </h2>
          <p className="reveal reveal-delay-2 font-body text-gray-500 mb-10 max-w-md mx-auto">
            All tutor plans include student data access and booking tools. Higher tiers get lower marketplace fees and better visibility.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {TUTOR_PLANS.map((plan, i) => (
              <div key={plan.name} className={`reveal reveal-delay-${i + 1} hover-lift bg-white rounded-2xl p-7 border-2 border-transparent`}
                   style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="font-display font-bold text-xl text-gray-900 mb-1">{plan.name}</div>
                <div className="text-sm text-gray-400 mb-3">{plan.desc}</div>
                <div className="font-display font-bold text-4xl text-gray-900 mb-1">
                  {plan.price}<span className="font-body text-sm font-normal text-gray-400">{plan.price !== 'Free' ? '/mo' : ''}</span>
                </div>
                <div className="h-px bg-gray-100 my-4" />
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => <li key={f} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-green-500 font-bold">✓</span>{f}</li>)}
                  {plan.missing.map(f => <li key={f} className="flex items-start gap-2 text-sm text-gray-300"><span>—</span>{f}</li>)}
                </ul>
                <Link to="/signup"
                  className={`block text-center py-3 rounded-xl font-semibold text-sm no-underline transition-all border border-gray-200 text-gray-700 hover:border-purple-400 hover:text-purple-700`}>
                  {plan.price === 'Free' ? 'Join free' : `Get ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-5 text-center" style={{ background: '#EEEDFE' }}>
        <div className="max-w-lg mx-auto">
          <h2 className="reveal font-display font-bold text-gray-900 mb-5"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Start working with better-prepared students.
          </h2>
          <p className="reveal reveal-delay-1 font-body text-gray-500 mb-8 leading-relaxed">
            Set up your tutor profile, get access to student diagnostic data, booking tools, and progress tracking.
          </p>
          <Link to="/signup" className="reveal reveal-delay-2 btn-glow-purple inline-block text-base no-underline">
            Set up your tutor profile →
          </Link>
          <p className="mt-4 text-xs text-gray-400">Free to join. Students book directly through the platform.</p>
        </div>
      </section>
    </main>
  );
}
