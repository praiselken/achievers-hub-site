import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../lib/useScrollReveal';
import StudyCard from '../components/StudyCard';
import { PATHWAYS } from '../constants/brand';

const SUBJECTS = [
  { id: 'maths', label: 'GCSE Maths', boards: ['AQA', 'Edexcel', 'OCR'], color: '#639922', faint: '#EAF3DE' },
  { id: 'economics', label: 'GCSE Economics', boards: ['AQA', 'OCR'], color: '#0F6E56', faint: '#E1F5EE' },
  { id: 'more', label: 'More coming', boards: [], color: '#B4B2A9', faint: '#F1EFE8', soon: true },
];

const FEATURES = [
  { icon: '🎯', title: 'Personalised diagnostic', body: 'A 10-minute assessment that maps where you are across the full GCSE spec — no guessing, no generic lists.', tag: 'All plans' },
  { icon: '📅', title: 'Daily 5 questions', body: '3 at your level, 1 on your weakest topic, 1 stretch question. Done in under 15 minutes.', tag: 'All plans' },
  { icon: '📚', title: 'Topic Hub', body: 'Every topic has a study card, practice questions, and a YouTube video — always sorted by your weak areas first.', tag: 'All plans' },
  { icon: '📄', title: 'Past Paper Hub', body: 'Download paper, mark scheme & examiner report. Log your score, get a diagnostic, watch the walkthrough — all in one flow.', tag: 'Achiever+' },
  { icon: '🗺️', title: 'Spec Mapper', body: 'See exactly how much of the GCSE spec you\'ve covered — by topic, by week. Know what\'s left.', tag: 'Achiever+' },
  { icon: '🧠', title: 'Daily mindset prompt', body: 'A short daily identity-driven prompt — on mindset, voice, or resilience. Free for all students.', tag: 'All plans' },
];

const DAILY5_QUESTIONS = [
  { n: 'Q1', label: 'Level question', tag: 'Foundation Plus', color: '#EDE0F4', text: '#7A5489' },
  { n: 'Q2', label: 'Level question', tag: 'Foundation Plus', color: '#EDE0F4', text: '#7A5489' },
  { n: 'Q3', label: 'Level question', tag: 'Foundation Plus', color: '#EDE0F4', text: '#7A5489' },
  { n: 'Q4', label: 'Weak topic', tag: 'Quadratic Equations', color: '#FAEEDA', text: '#BA7517' },
  { n: 'Q5', label: 'Stretch', tag: 'Higher — push further', color: '#EAF3DE', text: '#3B6D11' },
];

// Study card examples per subject
const STUDY_CARDS = {
  maths: {
    topic: 'Quadratic Equations',
    subject: 'GCSE Maths — AQA',
    difficulty: 'Foundation Plus' as const,
    keyPoints: [
      'A quadratic is in the form ax² + bx + c = 0',
      'Factorise by finding two numbers that multiply to ac and add to b',
      'Use the quadratic formula when factorising is difficult',
      'Always check your solutions by substituting back in',
    ],
    examTip: 'Show all working — method marks are awarded even if your final answer is wrong.',
    practiceQ: 'Solve x² + 5x + 6 = 0. Show your working clearly.',
    answer: 'Factorise: (x + 2)(x + 3) = 0. Therefore x = −2 or x = −3. Check: (−2)² + 5(−2) + 6 = 4 − 10 + 6 = 0 ✓',
  },
  economics: {
    topic: 'Price Elasticity of Demand',
    subject: 'GCSE Economics — AQA',
    difficulty: 'Higher' as const,
    keyPoints: [
      'PED = % change in quantity demanded ÷ % change in price',
      'Elastic demand (PED > 1): consumers are price sensitive',
      'Inelastic demand (PED < 1): consumers are less sensitive to price changes',
      'Luxury goods tend to be elastic; necessities tend to be inelastic',
    ],
    examTip: 'When evaluating PED in extended answers, always link to revenue impact and give a real-world example.',
    practiceQ: 'A firm raises prices by 10% and quantity demanded falls by 25%. Calculate the PED and state whether demand is elastic or inelastic.',
    answer: 'PED = −25% ÷ 10% = −2.5. Since |PED| > 1, demand is elastic. The firm\'s revenue will fall as the % fall in demand exceeds the % rise in price.',
  },
};

export default function StudentPage() {
  useScrollReveal();
  const [activeSubject, setActiveSubject] = useState<'maths' | 'economics'>('maths');

  return (
    <main className="pt-16 min-h-screen">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pt-14 pb-14 md:pt-20 md:pb-20"
               style={{ background: 'var(--off-white)' }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: 'radial-gradient(ellipse 80% 60% at 80% -10%, #C0DD97 0%, transparent 55%), radial-gradient(ellipse 50% 40% at -5% 90%, #9FE1CB 0%, transparent 55%)' }}
             aria-hidden />

        <div className="relative z-10 max-w-2xl mx-auto text-center flex flex-col items-center">
          <div className="inline-block bg-green-50 border border-green-100 text-green-800 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full mb-6">
            For Students
          </div>
          <h1 className="font-display font-bold text-gray-900 leading-[1.1] mb-5"
              style={{ fontSize: 'clamp(2.2rem, 5.5vw, 3.6rem)' }}>
            Stop revising blindly.<br />
            <em className="grad-text-green">Start revising smartly.</em>
          </h1>
          <p className="font-body text-gray-500 leading-relaxed mb-7 max-w-lg"
             style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
            Get a personalised GCSE revision pathway based on where you actually are — not where you hope you are. Five targeted questions a day. 15 minutes. Real improvement.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <Link to="/signup" className="btn-glow-green text-[15px] no-underline">Start your free diagnostic →</Link>
            <a href="#daily5" className="font-body font-medium text-gray-700 border border-gray-200 bg-white rounded-xl px-6 py-3.5 text-[15px] hover:border-green-300 transition-colors no-underline">See Daily 5</a>
          </div>

          {/* Subject toggle */}
          <div className="flex flex-wrap items-center gap-2 justify-center">
            <span className="text-xs text-gray-400 font-medium">Subjects:</span>
            {SUBJECTS.map(s => (
              <button key={s.id}
                onClick={() => !s.soon && setActiveSubject(s.id as 'maths' | 'economics')}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border-2 transition-all
                  ${s.soon ? 'opacity-40 cursor-default border-gray-200 text-gray-400' : 'cursor-pointer'}
                  ${activeSubject === s.id && !s.soon ? 'border-current' : 'border-transparent'}`}
                style={!s.soon ? { background: s.faint, color: s.color, borderColor: activeSubject === s.id ? s.color : 'transparent' } : {}}>
                {s.label}
                {s.soon && <span className="ml-1.5 bg-gray-200 text-gray-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Soon</span>}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proof bar ── */}
      <div className="proof-bar py-4">
        <div className="max-w-5xl mx-auto px-5 flex flex-wrap justify-around gap-4">
          {[{ n: '10 min', l: 'Diagnostic to pathway' }, { n: '5/day', l: 'Targeted questions' }, { n: '15 min', l: 'Daily habit' }, { n: '5', l: 'Grade pathways' }].map(s => (
            <div key={s.n} className="text-center text-white">
              <div className="font-display font-bold text-2xl">{s.n}</div>
              <div className="text-xs text-white/65 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pathways ── */}
      <section className="py-16 md:py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="reveal text-xs font-bold uppercase tracking-widest text-green-600 mb-3">Your pathway</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-gray-900 mb-3"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
              Five tiers. One that fits <em className="grad-text-green">where you are right now.</em>
            </h2>
            <p className="reveal reveal-delay-2 font-body text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              After your diagnostic you're placed on a pathway. As you improve, it updates automatically.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {PATHWAYS.map((p, i) => (
              <div key={p.name} className={`reveal reveal-delay-${i + 1} rounded-2xl p-5 hover-lift border border-black/5`}
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

      {/* ── Daily 5 + Study Card Demo ── */}
      <section id="daily5" className="py-16 md:py-24 px-5" style={{ background: '#F4F8F0' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="reveal text-xs font-bold uppercase tracking-widest text-green-600 mb-3">Daily Practice</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-gray-900 mb-3"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
              The Daily 5 — <em className="grad-text-green">how it works.</em>
            </h2>
            <p className="reveal reveal-delay-2 font-body text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
              Five questions every day. Each one serves a purpose. Done in 15 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Q breakdown */}
            <div className="reveal flex flex-col gap-3">
              {DAILY5_QUESTIONS.map((q) => (
                <div key={q.n} className="bg-white rounded-2xl px-5 py-4 flex items-center gap-4 border border-gray-100 hover-lift"
                     style={{ boxShadow: 'var(--shadow-sm)' }}>
                  <span className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                        style={{ background: q.color, color: q.text }}>
                    {q.n}
                  </span>
                  <div>
                    <div className="font-body font-semibold text-gray-900 text-sm">{q.label}</div>
                    <div className="font-mono text-xs text-gray-400 mt-0.5">{q.tag}</div>
                  </div>
                </div>
              ))}
              <div className="bg-gray-900 rounded-2xl px-5 py-4 mt-2">
                <p className="text-white/70 text-sm leading-relaxed">
                  Every session feeds back into your diagnostic. Tomorrow's questions are shaped by today's answers.
                </p>
              </div>
            </div>

            {/* Study Card Demo */}
            <div className="reveal reveal-delay-2">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-body font-semibold text-gray-700 text-sm">📖 Study card — try flipping it</p>
                <div className="flex gap-2">
                  {(['maths', 'economics'] as const).map(s => (
                    <button key={s} onClick={() => setActiveSubject(s)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all border
                        ${activeSubject === s ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-500 hover:border-green-300'}`}>
                      {s === 'maths' ? 'Maths' : 'Economics'}
                    </button>
                  ))}
                </div>
              </div>
              <StudyCard {...STUDY_CARDS[activeSubject]} />
              <p className="text-xs text-gray-400 text-center mt-3">
                Tap the card to reveal the practice question, then check the model answer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="py-16 md:py-24 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="reveal text-xs font-bold uppercase tracking-widest text-green-600 mb-3">What you get</p>
            <h2 className="reveal reveal-delay-1 font-display font-bold text-gray-900"
                style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
              Everything you need to <em className="grad-text-green">go from A to B.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`reveal reveal-delay-${(i % 3) + 1} bg-white border border-gray-100 rounded-2xl p-6 hover-lift flex flex-col gap-3`}
                   style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="text-3xl">{f.icon}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-body font-bold text-gray-900 text-[15px]">{f.title}</h3>
                  </div>
                  <p className="font-body text-sm text-gray-500 leading-relaxed">{f.body}</p>
                </div>
                <span className="self-start text-xs font-bold px-3 py-1 rounded-full mt-auto"
                      style={{ background: '#EAF3DE', color: '#3B6D11' }}>
                  {f.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mindset section ── */}
      <section className="py-16 md:py-20 px-5 text-center" style={{ background: '#0F6E56' }}>
        <div className="max-w-2xl mx-auto">
          <div className="reveal inline-block bg-white/15 border border-white/25 text-white/85 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            Mindset & growth
          </div>
          <h2 className="reveal reveal-delay-1 font-display font-bold text-white mb-3"
              style={{ fontSize: 'clamp(1.7rem, 3.5vw, 2.5rem)' }}>
            Not just revision. <em className="italic">A belief in themselves.</em>
          </h2>
          <p className="reveal reveal-delay-2 font-body text-white/65 mb-10 leading-relaxed">
            Each session opens with a short identity-driven prompt — building the confidence to approach hard questions without giving up.
          </p>
          <div className="reveal reveal-delay-3 relative bg-teal-600/60 border border-white/20 rounded-3xl p-8 text-left"
               style={{ backdropFilter: 'blur(12px)' }}>
            <div className="absolute top-4 left-6 font-display text-9xl text-white/8 leading-none select-none">"</div>
            <p className="font-display italic text-white text-xl leading-relaxed mb-5 relative z-10">
              "I possess a capacity for deep insight. I see solutions where others only see problems. I am a solver."
            </p>
            <div className="text-xs font-bold text-white/45 uppercase tracking-wider mb-2">Today's reflection</div>
            <div className="bg-white/12 rounded-xl px-5 py-4 text-sm text-white/80 leading-relaxed">
              When I face a difficult question today, what is one alternative strategy I can try before asking for help?
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-5 text-center" style={{ background: '#EAF3DE' }}>
        <div className="max-w-lg mx-auto">
          <h2 className="reveal font-display font-bold text-gray-900 mb-5"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Ready to find your pathway?
          </h2>
          <p className="reveal reveal-delay-1 font-body text-gray-600 mb-8 leading-relaxed">
            Take the free diagnostic. 10 minutes. Tells you exactly where to focus your revision.
          </p>
          <Link to="/signup" className="reveal reveal-delay-2 btn-glow-green inline-block text-base no-underline">
            Start your free diagnostic →
          </Link>
          <p className="mt-4 text-xs text-gray-400">Free to start. No card required.</p>
        </div>
      </section>
    </main>
  );
}
