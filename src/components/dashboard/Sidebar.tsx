import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  BookOpen,
  Dumbbell,
  FileText,
  LayoutDashboard,
  Medal,
  Settings,
  Sprout,
  Star,
} from 'lucide-react';
import { ArchiAvatar } from '../marketing/ArchiAvatar';
import { Logo } from '../marketing/Logo';
import { levelProgress } from '../../lib/xp';

export type DashTab =
  | 'home' | 'daily5' | 'topics' | 'papers' | 'spec' | 'achievements' | 'settings';

type NavItem = {
  icon: LucideIcon | null;
  label: string;
  tab: DashTab | null;
  path: string | null;
  archi?: boolean;
};

// Labels and order follow the client's dashboard design. Items with no `path`
// are in that design but have no page built yet — shown disabled rather than
// linking to a 404.
export const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', tab: 'home', path: '/dashboard' },
  { icon: Star, label: 'Daily 5', tab: 'daily5', path: '/dashboard/daily5' },
  { icon: Dumbbell, label: 'Practice', tab: 'topics', path: '/dashboard/topics' },
  { icon: BarChart3, label: 'Progress', tab: 'spec', path: '/dashboard/spec' },
  { icon: Sprout, label: 'Think. Speak. Grow.', tab: null, path: null },
  { icon: null, label: 'Ask Archi', tab: null, path: null, archi: true },
  { icon: FileText, label: 'Past papers', tab: 'papers', path: '/dashboard/papers' },
  { icon: Medal, label: 'Achievements', tab: 'achievements', path: '/dashboard/achievements' },
  { icon: BookOpen, label: 'Resources', tab: null, path: null },
];

function itemClasses(active: boolean) {
  return `flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all ${
    active
      ? 'bg-[linear-gradient(135deg,#7040d7,#5f25c2)] text-white shadow-[0_8px_20px_rgba(93,38,190,0.35)]'
      : 'text-white/80 hover:bg-white/10 hover:text-white'
  }`;
}

export function Sidebar({
  activeTab,
  fullName,
  yearLabel,
  level,
  xpTotal,
  avatar,
}: {
  activeTab: DashTab;
  fullName: string;
  yearLabel: string;
  level: number;
  xpTotal: number;
  /** Emoji the student picked in Settings; falls back to initials when unset. */
  avatar?: string;
}) {
  const initials =
    fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?';
  const pct = levelProgress(xpTotal, level).pct;

  return (
    <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 flex-col overflow-y-auto bg-[linear-gradient(155deg,#28105a_0%,#170831_52%,#24104b_100%)] text-white shadow-[8px_0_30px_rgba(32,11,71,0.12)] lg:flex">
      <div className="px-5 pb-7 pt-8">
        <Link to="/" aria-label="Achievers Hub home">
          <Logo variant="light" markTone="accent" />
        </Link>
      </div>

      <nav aria-label="Student navigation" className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const icon = item.archi ? (
            <ArchiAvatar size={20} />
          ) : item.icon ? (
            <item.icon size={18} strokeWidth={1.9} aria-hidden="true" />
          ) : null;

          if (!item.path) {
            return (
              // No page built for these yet. Reduced opacity plus the tooltip
              // carries the state; a "Soon" pill here overflows the 244px rail.
              <span
                key={item.label}
                aria-disabled="true"
                title={`${item.label} — coming soon`}
                className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold text-white/40"
              >
                {icon}
                {item.label}
              </span>
            );
          }

          const active = activeTab === item.tab;
          return (
            <Link
              key={item.label}
              to={item.path}
              aria-current={active ? 'page' : undefined}
              className={itemClasses(active)}
            >
              {icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 pt-5">
        <Link
          to="/dashboard/settings"
          aria-current={activeTab === 'settings' ? 'page' : undefined}
          className={`${itemClasses(activeTab === 'settings')} mb-2`}
        >
          <Settings size={18} aria-hidden="true" />
          Settings
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-3.5 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8b5cf6,#f97316)] font-display text-sm font-bold text-white">
              {avatar ? <span className="text-lg">{avatar}</span> : initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-white">{fullName}</p>
              <p className="mt-0.5 text-[10px] text-white/60">{yearLabel}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[10px]">
            <span className="font-bold text-white">Level {level}</span>
            <span className="text-white/55">{pct}% to Level {level + 1}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#8b5cf6,#f97316)] transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
