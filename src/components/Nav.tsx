import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Logo } from './marketing/Logo';
import { Button } from './marketing/Button';
import { Container } from './marketing/Container';

const features = [
  { href: '/features/daily-5', label: 'Daily 5', description: 'Five focused daily questions' },
  { href: '/features/topic-hub', label: 'Topic Hub', description: 'Lessons, cards and practice' },
  { href: '/features/past-paper-hub', label: 'Past Papers & QLA', description: 'Turn marks into priorities' },
  { href: '/features/ai-tutor', label: 'Archi: AI Tutor', description: 'Hint-first learning support' },
  { href: '/features/think-speak-grow', label: 'Think, Speak, Grow', description: 'Prepare for each session' },
];

const subjects = [
  { href: '/subjects/gcse-maths', label: 'GCSE Maths', description: 'Methods, reasoning and past papers' },
  { href: '/subjects/gcse-economics', label: 'GCSE Economics', description: 'Knowledge, application and analysis' },
];

const families = [
  { href: '/students', label: 'For Students', description: 'Know what to revise next' },
  { href: '/parents', label: 'For Parents', description: 'Understand progress clearly' },
];

function DesktopMenu({ label, items }: { label: string; items: typeof features }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 py-3 text-sm font-bold text-[var(--color-ink-700)] transition-colors hover:text-[var(--color-primary-600)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary-500)]">
        {label}<ChevronDown size={15} className="transition group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="absolute left-1/2 top-full z-50 w-72 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
        {items.map((item) => (
          <Link key={item.href} to={item.href} className="block rounded-xl px-4 py-3 transition hover:bg-[var(--color-primary-50)] focus-visible:bg-[var(--color-primary-50)] focus-visible:outline-none">
            <span className="block text-sm font-extrabold text-[var(--color-ink-900)]">{item.label}</span>
            <span className="mt-0.5 block text-xs text-[var(--color-ink-500)]">{item.description}</span>
          </Link>
        ))}
      </div>
    </details>
  );
}

export default function Nav({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(!transparent);
  const location = useLocation();

  useEffect(() => {
    if (!transparent) return;
    function handleScroll() { setScrolled(window.scrollY > 40); }
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [transparent]);

  // Close the mobile menu and any open dropdown on navigation.
  useEffect(() => {
    setOpen(false);
    document.querySelectorAll<HTMLDetailsElement>('header details[open]').forEach((el) => { el.open = false; });
  }, [location.pathname]);

  return (
    <div className="mkt">
      <header className={`${transparent ? 'fixed' : 'sticky'} inset-x-0 top-0 z-50 transition-all duration-300 ease-out ${scrolled || open ? 'bg-white/95 shadow-[var(--shadow-nav)] backdrop-blur-[12px]' : 'bg-transparent'}`}>
        <Container className="flex h-[72px] items-center justify-between sm:h-20 lg:h-[84px]">
          <Link to="/" aria-label="Achievers Hub home">
            <Logo tagline="GCSE Maths & Economics" taglineClassName="hidden xl:block" />
          </Link>

          <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary navigation">
            <Link to="/how-it-works" className="py-3 text-sm font-bold text-[var(--color-ink-700)] hover:text-[var(--color-primary-600)]">How It Works</Link>
            <DesktopMenu label="Features" items={features} />
            <DesktopMenu label="Subjects" items={subjects} />
            <DesktopMenu label="Students & Parents" items={families} />
            <Link to="/tutors" className="py-3 text-sm font-bold text-[var(--color-ink-700)] hover:text-[var(--color-primary-600)]">Tutors</Link>
            <Link to="/pricing" className="py-3 text-sm font-bold text-[var(--color-ink-700)] hover:text-[var(--color-primary-600)]">Pricing</Link>
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link to="/login" className="text-sm font-bold text-[var(--color-ink-700)] hover:text-[var(--color-primary-600)]">Sign In</Link>
            <Button href="/signup?plan=free" variant="accent" size="md" className="whitespace-nowrap transition-transform duration-200 hover:-translate-y-0.5">Start Learning Free</Button>
          </div>

          <button className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-[var(--color-ink-900)] lg:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>{open ? <X size={24} /> : <Menu size={24} />}</button>
        </Container>
      </header>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-white sm:top-20 lg:hidden">
          <div className="px-6 py-7">
            <nav aria-label="Mobile navigation" className="space-y-7">
              <div className="grid grid-cols-2 gap-2">
                {[{ href: '/', label: 'Home' }, { href: '/how-it-works', label: 'How It Works' }, { href: '/tutors', label: 'For Tutors' }, { href: '/pricing', label: 'Pricing' }].map((item) => <Link key={item.href} to={item.href} onClick={() => setOpen(false)} className="rounded-xl bg-slate-50 px-4 py-3 font-display font-extrabold text-[var(--color-ink-900)]">{item.label}</Link>)}
              </div>
              {[{ title: 'Features', items: features }, { title: 'Subjects', items: subjects }, { title: 'Students & Parents', items: families }].map((group) => <section key={group.title}><h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--color-primary-600)]">{group.title}</h2><div className="mt-2 divide-y divide-slate-100">{group.items.map((item) => <Link key={item.href} to={item.href} onClick={() => setOpen(false)} className="flex items-center justify-between py-3"><span><span className="block font-bold text-[var(--color-ink-900)]">{item.label}</span><span className="mt-0.5 block text-xs text-[var(--color-ink-500)]">{item.description}</span></span><span aria-hidden="true">→</span></Link>)}</div></section>)}
            </nav>
            <div className="mt-8 grid gap-3 border-t border-slate-200 pt-6"><Button href="/login" variant="outline" size="lg" className="w-full">Sign In</Button><Button href="/signup?plan=free" variant="accent" size="lg" className="w-full">Start Learning Free</Button><p className="text-center text-xs leading-5 text-[var(--color-ink-500)]">Free Starter has no time limit and needs no payment details.</p></div>
          </div>
        </div>
      )}
    </div>
  );
}
