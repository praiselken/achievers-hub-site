import { useState } from 'react';
import { ArrowRight, LineChart, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from './Container';

const roles = [
  {
    id: 'student',
    label: 'Student',
    icon: Sparkles,
    title: 'Know what to revise and what to do next.',
    copy: 'Build a focused routine, understand mistakes and continue with a manageable next step towards your target grade.',
    bullets: ['Your own learning history', 'Daily 5 and topic recommendations', 'Help when you are stuck'],
    href: '/students',
    link: 'Explore the student experience',
    tone: 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]',
  },
  {
    id: 'parent',
    label: 'Parent',
    icon: Users,
    title: 'Understand progress without becoming the subject expert.',
    copy: 'See activity, strengths, areas needing attention and recommended next steps through a separate parent dashboard.',
    bullets: ['Read-only progress view', 'One family dashboard', 'Clear tutor-link approval'],
    href: '/parents',
    link: 'See the parent dashboard',
    tone: 'bg-[var(--color-accent-50)] text-[var(--color-accent-700)]',
  },
  {
    id: 'tutor',
    label: 'Tutor',
    icon: LineChart,
    title: 'Begin each lesson with better evidence.',
    copy: 'Review question-level performance before a lesson and use the evidence to plan more focused support.',
    bullets: ['One free Linked Tutor View', 'Up to 25 students with membership', 'Detailed reports and tutor tools'],
    href: '/tutors',
    link: 'Compare tutor access',
    tone: 'bg-[#eef7f2] text-[#2f8f6b]',
  },
] as const;

export function RoleTabs() {
  const [activeId, setActiveId] = useState<(typeof roles)[number]['id']>('student');
  const activeRole = roles.find((role) => role.id === activeId) ?? roles[0];
  const ActiveIcon = activeRole.icon;

  return (
    <section className="bg-white py-20 lg:py-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--color-primary-600)]">Connected support</p>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.025em] text-[var(--color-ink-900)]">One connected picture, shown through the right dashboard.</h2>
        </div>

        <div className="mx-auto mt-10 flex max-w-xl rounded-2xl bg-slate-100 p-1.5" role="tablist" aria-label="Choose a role">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              role="tab"
              aria-selected={activeId === role.id}
              aria-controls="role-panel"
              onClick={() => setActiveId(role.id)}
              className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
                activeId === role.id ? 'bg-white text-[var(--color-primary-700)] shadow-sm' : 'text-[var(--color-ink-500)] hover:text-[var(--color-ink-900)]'
              }`}
            >
              <role.icon size={17} aria-hidden="true" />
              {role.label}
            </button>
          ))}
        </div>

        <div id="role-panel" role="tabpanel" className="mx-auto mt-6 grid max-w-4xl gap-8 rounded-[2rem] border border-slate-200 bg-[#fbfafc] p-7 sm:p-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div className={`flex min-h-56 items-center justify-center rounded-3xl ${activeRole.tone}`}>
            <ActiveIcon size={72} strokeWidth={1.35} aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--color-primary-600)]">For {activeRole.label.toLowerCase()}s</p>
            <h3 className="mt-3 font-display text-3xl font-extrabold text-[var(--color-ink-900)]">{activeRole.title}</h3>
            <p className="mt-4 leading-7 text-[var(--color-ink-500)]">{activeRole.copy}</p>
            <ul className="mt-5 space-y-2">
              {activeRole.bullets.map((item) => <li key={item} className="text-sm font-semibold text-[var(--color-ink-700)]">• {item}</li>)}
            </ul>
            <Link to={activeRole.href} className="mt-6 inline-flex items-center gap-2 font-bold text-[var(--color-primary-600)] hover:underline">
              {activeRole.link}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
