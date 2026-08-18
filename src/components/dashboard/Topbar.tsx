import { Link } from 'react-router-dom';
import { Bell, ChevronDown, CircleHelp, LogOut, Search } from 'lucide-react';
import { Logo } from '../marketing/Logo';
import { NAV_ITEMS, type DashTab } from './Sidebar';

type SubjectOption = { slug: string; name: string };

// The client's design puts the Maths/Economics toggle in the Daily 5 header.
// Our other tabs read the same global subject, so it lives here instead — one
// control, visible on every page.
export function Topbar({
  activeTab,
  firstName,
  initials,
  avatar,
  subject,
  subjects,
  onSubjectChange,
  onSignOut,
}: {
  activeTab: DashTab;
  firstName: string;
  initials: string;
  /** Emoji the student picked in Settings; falls back to initials when unset. */
  avatar?: string;
  subject: string;
  subjects: SubjectOption[];
  onSubjectChange: (slug: string) => void;
  onSignOut: () => void;
}) {
  const mobileItems = NAV_ITEMS.filter((item) => item.path).slice(0, 4);

  return (
    <>
      <header className="sticky top-0 z-30 flex min-h-[86px] items-center justify-between gap-5 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-6 xl:px-8">
        <div className="lg:hidden">
          <Link to="/" aria-label="Achievers Hub home">
            <Logo showTagline={false} />
          </Link>
        </div>
        <div className="hidden lg:block">
          <p className="font-display text-[21px] font-extrabold tracking-[-0.02em] text-[#18172d]">
            Welcome back, {firstName}! <span aria-hidden="true">👋</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">Ready to build on today&apos;s learning?</p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Below sm the header can't fit the toggle alongside the logo and
              icons, so it moves to its own row under the mobile tab bar. */}
          <div className="hidden sm:block">
            <SubjectToggle subject={subject} subjects={subjects} onSubjectChange={onSubjectChange} />
          </div>

          <label className="relative hidden w-[240px] xl:block">
            <span className="sr-only">Search Achievers Hub</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search anything..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs text-slate-700 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </label>
          <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50">
            <Bell size={18} aria-hidden="true" />
            <span className="absolute right-2.5 top-2 h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Help" className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-50 sm:flex">
            <CircleHelp size={18} aria-hidden="true" />
          </button>
          <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />
          <div className="flex items-center gap-2 rounded-xl p-1.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6d35d6,#f97316)] font-display text-xs font-bold text-white">
              {avatar ? <span className="text-base">{avatar}</span> : initials}
            </span>
            <span className="hidden text-xs font-bold text-[#232139] sm:inline">{firstName}</span>
            <ChevronDown className="hidden text-slate-400 sm:block" size={14} aria-hidden="true" />
          </div>
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <nav aria-label="Mobile student navigation" className="sticky top-[86px] z-20 flex border-b border-slate-200 bg-white px-2 lg:hidden">
        {mobileItems.map((item) => {
          const active = activeTab === item.tab;
          return (
            <Link
              key={item.label}
              to={item.path!}
              className={`flex-1 border-b-2 px-1 py-3 text-center text-xs font-bold ${
                active ? 'border-violet-600 text-violet-700' : 'border-transparent text-slate-500'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {subjects.length > 1 && (
        <div className="flex justify-center border-b border-slate-200 bg-white px-4 py-2 sm:hidden">
          <SubjectToggle subject={subject} subjects={subjects} onSubjectChange={onSubjectChange} />
        </div>
      )}
    </>
  );
}

function SubjectToggle({
  subject,
  subjects,
  onSubjectChange,
}: {
  subject: string;
  subjects: SubjectOption[];
  onSubjectChange: (slug: string) => void;
}) {
  if (subjects.length < 2) return null;
  return (
    <div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Choose subject">
      {subjects.map((option) => (
        <button
          key={option.slug}
          type="button"
          onClick={() => onSubjectChange(option.slug)}
          aria-pressed={subject === option.slug}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition ${
            subject === option.slug
              ? 'bg-white text-[var(--color-primary-700)] shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {option.name.replace(/^GCSE\s+/, '')}
        </button>
      ))}
    </div>
  );
}
