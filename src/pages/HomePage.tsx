import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileSearch,
  FileText,
  GraduationCap,
  LineChart,
  LockKeyhole,
  Map,
  Sigma,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Container } from '../components/marketing/Container';
import { ArchiAvatar } from '../components/marketing/ArchiAvatar';
import { FeatureIllustration } from '../components/marketing/FeatureIllustration';
import { PricingCards } from '../components/marketing/PricingCards';
import { StudyBackdrop } from '../components/marketing/StudyBackdrop';
import { RoleTabs } from '../components/marketing/RoleTabs';

const steps = [
  {
    number: '01',
    title: 'Tell us where you are',
    copy: 'Choose your subjects, exam boards, current working grade and target grade.',
    icon: Target,
  },
  {
    number: '02',
    title: 'Complete your Daily 5',
    copy: 'Answer five personalised questions for each subject, based on what you need most.',
    icon: FileSearch,
  },
  {
    number: '03',
    title: 'Improve each day',
    copy: 'Get instant feedback, clear next steps and progress tracking that adapts as you learn.',
    icon: ChevronRight,
  },
];

const learningLoop = [
  ['Answer questions', FileText, 'Use Daily 5, topic practice or a past paper'],
  ['See your topic results', BarChart3, 'Find strengths and topics that need attention'],
  ['Get a next step', Target, 'See the lesson or practice we recommend'],
  ['Learn and practise', BookOpen, 'Work on the recommended topic'],
  ['Review your progress', LineChart, 'See how your topic picture changes'],
] as const;

const illustratedFeatures = [
  {
    eyebrow: 'Daily 5',
    title: 'Five questions for each subject',
    copy: 'Build a manageable daily routine shaped by your level, recent performance, target grade and upcoming assessments.',
    href: '/features/daily-5',
    linkLabel: 'Explore Daily 5',
    illustration: 'daily' as const,
    accent: 'text-[#9a6b00]',
    tone: 'bg-[#fff8e4]',
  },
  {
    eyebrow: 'Topic Hub',
    title: 'Learn, practise and check',
    copy: 'Move through Knowledge Cards, Lessons and Practice Questions while keeping sight of why each topic matters.',
    href: '/features/topic-hub',
    linkLabel: 'Explore Topic Hub',
    illustration: 'topic' as const,
    accent: 'text-[#6b3de2]',
    tone: 'bg-[#f3eeff]',
  },
  {
    eyebrow: 'Past Paper Hub',
    title: 'Make every mark useful',
    copy: 'Record results question by question and see the topics behind the mark, not only a final percentage.',
    href: '/features/past-paper-hub',
    linkLabel: 'Explore Past Papers',
    illustration: 'past' as const,
    accent: 'text-[#286bc9]',
    tone: 'bg-[#eaf3ff]',
  },
  {
    eyebrow: 'Meet Archi',
    title: 'Guidance that helps you think',
    copy: 'Break difficult ideas into manageable steps, learn from mistakes and return to the question more independently.',
    href: '/features/ai-tutor',
    linkLabel: 'Meet Archi',
    illustration: 'ai' as const,
    accent: 'text-[#7445dc]',
    tone: 'bg-[#f1e8ff]',
  },
  {
    eyebrow: 'Progress',
    title: 'See what to revise next',
    copy: 'Turn your activity into a clear view of strengths, priority topics and the most useful next action.',
    href: '/features/progress-tracking',
    linkLabel: 'Explore Progress',
    illustration: 'progress' as const,
    accent: 'text-[#087f75]',
    tone: 'bg-[#e8f8f6]',
  },
  {
    eyebrow: 'Think, Speak, Grow',
    title: 'Reflect, choose and act',
    copy: 'Pause for one short reflection, choose a helpful learning mindset and decide on one practical action.',
    href: '/features/think-speak-grow',
    linkLabel: 'Explore Think, Speak, Grow',
    illustration: 'grow' as const,
    accent: 'text-[#467f49]',
    tone: 'bg-[#eaf8ec]',
  },
] as const;

const faqs = [
  {
    question: 'What can I use for free?',
    answer:
      'Free Starter includes both subjects, one Daily 5 each week, selected Knowledge Cards and Quick Lessons, limited practice and Archi hints, and a simple progress snapshot. It has no time limit and needs no payment details.',
  },
  {
    question: 'Are Maths and Economics both included?',
    answer:
      'Yes. Choose Maths, Economics or both. Both subjects are included in one Student Membership.',
  },
  {
    question: 'Which exam boards are supported?',
    answer:
      'GCSE Maths supports AQA, Pearson Edexcel and Cambridge OCR. GCSE Economics supports AQA and Cambridge OCR. Content is aligned with the listed specifications, but Achievers Hub is not endorsed by the exam boards.',
  },
  {
    question: "Can a parent see a student's progress?",
    answer:
      "Yes. A student can connect one parent or guardian dashboard. The parent can see relevant activity, strengths, areas needing practice and recommended next steps, but cannot change the student's answers.",
  },
  {
    question: 'How does personalisation work without a diagnostic assessment?',
    answer:
      "Personalisation begins with the student's subject, exam board, school year, current working grade and target grade. Recommendations become more useful as the student completes questions, topic activities and past papers.",
  },
  {
    question: 'Is AI feedback guaranteed to be correct?',
    answer:
      'No. AI can make mistakes. Important feedback should be checked against official mark schemes and guidance from a teacher or tutor.',
  },
];

function PrimaryCta({ location }: { location: string }) {
  return (
    <Link
      to={`/signup?plan=free&from=${location}`}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white shadow-lg shadow-orange-200/70 transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-600)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary-600)]"
    >
      Start learning free
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}

function ExamBoardBadge({ children }: { children: string }) {
  return (
    <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-[var(--color-ink-700)] shadow-sm">
      <span className="h-2 w-2 rounded-full bg-slate-300" aria-hidden="true" />
      {children}
    </span>
  );
}

export default function HomePage() {
  return (
    <main className="mkt flex-1">
      <section className="relative overflow-hidden bg-[linear-gradient(145deg,#fcfbfe_0%,#f6f1fb_55%,#eee5f6_100%)] py-14 sm:py-20 lg:py-24">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[var(--color-accent-200)]/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[var(--color-primary-200)]/30 blur-3xl" aria-hidden="true" />
        <Container className="relative grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
          <div className="hero-copy">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary-100)] bg-white px-4 py-2 text-sm font-bold text-[var(--color-primary-700)] shadow-sm">
              <Sparkles size={15} aria-hidden="true" />
              One complete GCSE revision toolkit
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-5xl font-extrabold leading-[1.09] text-[var(--color-ink-900)] sm:text-6xl lg:text-7xl">
              The right revision, one day at a time.
              <span className="mt-2 block text-[var(--color-primary-500)]">Revise only what you need.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--color-ink-700)]">
              One complete GCSE revision toolkit that shows students what to focus on, gives them personalised practice each day and helps them build confidence as they progress.
            </p>
            <ul className="mt-6 grid max-w-xl gap-2 text-sm font-semibold leading-6 text-[var(--color-ink-700)] sm:grid-cols-2">
              {['Daily 5 for each subject', 'Assessment Planner', 'Full-course Spec Mapper', 'Parent dashboard included'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={17} className="shrink-0 text-[var(--color-success-500)]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/start-free-trial?from=hero"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-500)] px-6 py-3 font-bold text-white shadow-lg shadow-orange-200/70 transition hover:-translate-y-0.5 hover:bg-[var(--color-accent-600)]"
              >
                Start your 7-day free trial
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[var(--color-primary-200)] bg-white px-6 py-3 font-bold text-[var(--color-primary-700)] transition hover:-translate-y-0.5 hover:bg-[var(--color-primary-50)]"
              >
                See how it works
              </a>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--color-ink-500)]">
              GCSE Maths and Economics · Personalised by subject · <strong className="text-[var(--color-ink-700)]">Free Starter also available</strong>
            </p>
          </div>

          <div className="hero-visual relative">
            <div className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_30px_80px_rgba(61,36,72,.17)]">
              <img
                src="/images/archie-hero-v3.png"
                alt="Archi, the Achievers Hub revision guide, holding a revision planner beside Daily 5, topic learning and progress illustrations"
                className="h-auto w-full"
              />
            </div>
            <div className="hero-float absolute -bottom-5 left-4 hidden max-w-[230px] rounded-2xl border border-[var(--color-primary-100)] bg-white p-4 shadow-xl sm:block">
              <p className="text-xs font-bold text-[var(--color-primary-600)]">Your next step</p>
              <p className="mt-1 text-sm font-extrabold text-[var(--color-ink-900)]">Practise factorising quadratics</p>
            </div>
            <div className="hero-float-delayed absolute -right-3 top-6 hidden items-center gap-3 rounded-2xl border border-white bg-white p-3 shadow-xl sm:flex">
              <ArchiAvatar size={38} />
              <p className="max-w-24 text-xs font-bold leading-5 text-[var(--color-ink-700)]">Ask Archi for one clear hint</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-slate-100 bg-white">
        <Container className="grid gap-4 py-5 text-center sm:grid-cols-3 sm:text-left">
          <p className="text-sm font-extrabold text-[var(--color-ink-700)]">GCSE Maths and Economics</p>
          <p className="text-sm font-extrabold text-[var(--color-ink-700)]">Personalised separately by subject</p>
          <p className="text-sm font-extrabold text-[var(--color-ink-700)]">Parent dashboard included</p>
        </Container>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28">
        <StudyBackdrop className="hidden sm:block" />
        <Container className="relative grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary-600)]">Revision with direction</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">Revision should lead to a clear next step.</h2>
          </div>
          <div className="rounded-[2rem] bg-[var(--color-primary-50)] p-7 sm:p-9">
            <p className="text-lg leading-8 text-[var(--color-ink-700)]">
              Most students already have revision lists, assessment feedback and access to questions. The problem is knowing how to turn all that information into effective daily action.
            </p>
            <p className="mt-4 text-lg leading-8 text-[var(--color-ink-700)]">
              Achievers Hub connects upcoming assessments, Daily 5, Topic Hub, Spec Mapper and Past Paper QLA so every revision session ends with one useful next step.
            </p>
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="scroll-mt-24 bg-[#fbfafc] py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary-600)]">How it works</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">Small steps. Focused revision. Better progress.</h2>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map(({ number, title, copy, icon: Icon }) => (
              <li key={number} className="relative rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-display text-3xl font-extrabold text-[var(--color-primary-200)]">{number}</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-6 font-display text-xl font-extrabold text-[var(--color-ink-900)]">{title}</h3>
                <p className="mt-3 leading-7 text-[var(--color-ink-500)]">{copy}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-sm font-semibold text-[var(--color-ink-500)]">
            Each subject has its own Daily 5, progress picture and revision priorities.
          </p>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary-600)]">Plan what matters</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">Turn a long revision list into a plan you can follow.</h2>
            <p className="mt-4 text-lg leading-8 text-[var(--color-ink-500)]">See what is coming next, compare it with your progress and spread revision across manageable daily steps.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-[#f4d7c5] bg-[#fff1e8] p-8 sm:p-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#d85f17] shadow-sm"><CalendarDays size={27} aria-hidden="true" /></span>
              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.15em] text-[#c35312]">Assessment Planner</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold text-[var(--color-ink-900)]">Know what to revise before the date arrives.</h3>
              <p className="mt-4 leading-7 text-[var(--color-ink-600)]">Add an assessment date and upload the school topic list. Achievers Hub combines it with current performance to prioritise the right topics each day.</p>
              <Link to="/dashboard" className="mt-7 inline-flex items-center gap-2 font-extrabold text-[#a94710] hover:underline">Add an assessment <ArrowRight size={17} /></Link>
            </article>
            <article className="rounded-[2rem] border border-[#cfe8df] bg-[#eef7f2] p-8 sm:p-10">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#2f8f6b] shadow-sm"><Map size={27} aria-hidden="true" /></span>
              <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.15em] text-[#27785a]">Spec Mapper</p>
              <h3 className="mt-2 font-display text-3xl font-extrabold text-[var(--color-ink-900)]">See the whole course and what to cover next.</h3>
              <p className="mt-4 leading-7 text-[var(--color-ink-600)]">Track every topic as Not started, Learning, Developing or Secure, then use the gaps to guide Daily 5 and revision planning.</p>
              <Link to="/dashboard/spec" className="mt-7 inline-flex items-center gap-2 font-extrabold text-[#246f54] hover:underline">Open the Spec Mapper <ArrowRight size={17} /></Link>
            </article>
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary-600)]">One connected learning loop</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">Every answer helps make the next step clearer.</h2>
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-5">
            {learningLoop.map(([title, Icon, copy], index) => (
              <div key={title} className="relative rounded-2xl border border-slate-200 bg-white p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-sm font-extrabold text-[var(--color-ink-900)]">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--color-ink-500)]">{copy}</p>
                {index < learningLoop.length - 1 && (
                  <ChevronRight className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-white text-[var(--color-primary-300)] md:block" size={22} aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <PrimaryCta location="learning-loop" />
          </div>
        </Container>
      </section>

      <section className="bg-[var(--color-primary-900)] py-20 text-white lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-accent-300)]">The core learning experience</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em]">Learn the topic. Build the skill. Use it in the exam.</h2>
            <p className="mt-4 text-lg leading-8 text-white/70">Each tool has a clear job, from five personalised questions for each subject to the next topic worth revising.</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {illustratedFeatures.map((feature) => (
              <article
                key={feature.eyebrow}
                className={`group flex min-h-full flex-col rounded-[2rem] border border-white/60 p-7 text-center text-[var(--color-ink-900)] shadow-[0_20px_60px_rgba(25,12,51,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(25,12,51,0.26)] ${feature.tone}`}
              >
                <div className="flex h-48 items-center justify-center">
                  <FeatureIllustration feature={feature.illustration} className="w-44 max-w-full" />
                </div>
                <p className={`mt-2 text-xs font-extrabold uppercase tracking-[0.15em] ${feature.accent}`}>{feature.eyebrow}</p>
                <h3 className="mt-2 font-display text-2xl font-extrabold">{feature.title}</h3>
                <p className="mt-3 flex-1 leading-7 text-[var(--color-ink-500)]">{feature.copy}</p>
                <Link
                  to={feature.href}
                  className="mx-auto mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--color-primary-700)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary-600)]"
                >
                  {feature.linkLabel}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary-600)]">Specialist subject support</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">GCSE Maths and Economics are both included.</h2>
            <p className="mt-4 text-lg leading-8 text-[var(--color-ink-500)]">Choose Maths, Economics or both. One Student Membership gives access to both subjects.</p>
          </div>
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="relative overflow-hidden rounded-[2rem] border border-[var(--color-primary-100)] bg-[var(--color-primary-50)] p-8 sm:p-10">
              <Sigma size={44} className="text-[var(--color-primary-600)]" aria-hidden="true" />
              <h3 className="mt-6 font-display text-3xl font-extrabold text-[var(--color-ink-900)]">GCSE Maths</h3>
              <p className="mt-3 leading-7 text-[var(--color-ink-500)]">Daily questions, topic learning, mathematical tools, supported past papers and question-level analysis.</p>
              <div className="mt-6 flex flex-wrap gap-2">{['AQA', 'Pearson Edexcel', 'Cambridge OCR'].map((board) => <ExamBoardBadge key={board}>{board}</ExamBoardBadge>)}</div>
              <Link to="/subjects/gcse-maths" className="mt-7 inline-flex items-center gap-2 font-bold text-[var(--color-primary-700)] hover:underline">Explore GCSE Maths <ArrowRight size={17} /></Link>
            </article>
            <article className="relative overflow-hidden rounded-[2rem] border border-orange-100 bg-[var(--color-accent-50)] p-8 sm:p-10">
              <TrendingUp size={44} className="text-[var(--color-accent-600)]" aria-hidden="true" />
              <h3 className="mt-6 font-display text-3xl font-extrabold text-[var(--color-ink-900)]">GCSE Economics</h3>
              <p className="mt-3 leading-7 text-[var(--color-ink-500)]">Key terms, calculations, diagrams, chains of reasoning, exam technique and supported typed-answer feedback.</p>
              <div className="mt-6 flex flex-wrap gap-2">{['AQA', 'Cambridge OCR'].map((board) => <ExamBoardBadge key={board}>{board}</ExamBoardBadge>)}</div>
              <Link to="/subjects/gcse-economics" className="mt-7 inline-flex items-center gap-2 font-bold text-[var(--color-accent-700)] hover:underline">Explore GCSE Economics <ArrowRight size={17} /></Link>
            </article>
          </div>
          <p className="mt-6 text-center text-xs font-semibold leading-5 text-[var(--color-ink-500)]">Specification aligned — not endorsed. Achievers Hub is independent of AQA, Pearson Edexcel and Cambridge OCR.</p>
        </Container>
      </section>

      <RoleTabs />

      <section className="bg-[#fbfafc] py-20 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary-600)]">Why Achievers Hub</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">Built from real classroom experience.</h2>
            <p className="mt-5 text-lg leading-8 text-[var(--color-ink-500)]">
              Achievers Hub was created from GCSE classroom, tutoring and examining experience after seeing the same problem repeatedly: students were given revision lists, assessment feedback and topic names, but still did not know what to revise first or how to improve.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--color-primary-600)] px-6 py-3 font-bold text-white hover:bg-[var(--color-primary-700)]">See how it works <ArrowRight size={17} /></Link>
              <PrimaryCta location="credibility" />
            </div>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              ['15,000+ practice questions', FileText],
              ['Built and reviewed by qualified teachers and examiners', GraduationCap],
              ['Maths support for AQA, Pearson Edexcel and Cambridge OCR', Sigma],
              ['Economics support for AQA and Cambridge OCR', TrendingUp],
              ['Role-appropriate progress dashboards', Users],
              ['Clear limits around AI and estimates', LockKeyhole],
            ].map(([text, Icon]) => {
              const ItemIcon = Icon as typeof FileText;
              return (
                <li key={String(text)} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-50)] text-[var(--color-primary-600)]"><ItemIcon size={18} aria-hidden="true" /></span>
                  <span className="text-sm font-bold leading-6 text-[var(--color-ink-700)]">{String(text)}</span>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section id="pricing" className="scroll-mt-24 py-20 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-extrabold text-[var(--color-primary-600)]">Choose the support you need</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold text-[var(--color-ink-900)]">Start free. Upgrade when the full plan is useful.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[var(--color-ink-500)]">Every level includes GCSE Maths and Economics. Free Starter has no time limit.</p>
          </div>
          <div className="mx-auto mt-12 max-w-6xl">
            <PricingCards compact />
          </div>
        </Container>
      </section>

      <section className="bg-[#fbfafc] py-20 lg:py-28">
        <Container className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary-600)]">Frequently asked questions</p>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">Clear answers before you begin.</h2>
            <Link to="/faq" className="mt-6 inline-flex items-center gap-2 font-bold text-[var(--color-primary-600)] hover:underline">Read all FAQs <ArrowRight size={17} /></Link>
          </div>
          <div className="divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white px-6">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-[var(--color-ink-900)]">
                  {question}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-600)] transition group-open:rotate-90"><ChevronRight size={17} aria-hidden="true" /></span>
                </summary>
                <p className="max-w-2xl pt-3 text-sm leading-7 text-[var(--color-ink-500)]">{answer}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--color-primary-600)] py-20 text-white">
        <Container className="text-center">
          <h2 className="mx-auto max-w-3xl font-display text-4xl font-extrabold tracking-[-0.025em] sm:text-5xl">Make your next revision step clear.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">Create a free account, set your current and target grades, and begin with a focused revision plan.</p>
          <div className="mt-8">
            <PrimaryCta location="final" />
          </div>
          <p className="mt-4 text-sm text-white/70">Free Starter has no time limit. No payment details required.</p>
        </Container>
      </section>
    </main>
  );
}
