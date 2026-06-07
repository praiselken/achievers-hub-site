import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type ParentTab = 'overview' | 'progress' | 'spec' | 'bookings';

const TABS: { key: ParentTab; label: string; mobileLabel: string; icon: React.ReactNode }[] = [
  {
    key: 'overview', label: 'Overview', mobileLabel: 'Home',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M7 18V11h6v7"/></svg>,
  },
  {
    key: 'progress', label: 'Progress', mobileLabel: 'Progress',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 14l4-4 4 4 4-6"/><circle cx="4" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="8" cy="10" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none"/></svg>,
  },
  {
    key: 'spec', label: 'Spec Tracker', mobileLabel: 'Spec',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="10" cy="10" r="8"/><path d="M10 2a15 15 0 010 16M2 10h16"/></svg>,
  },
  {
    key: 'bookings', label: 'Tutor Bookings', mobileLabel: 'Bookings',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 8h14M7 2v4M13 2v4"/></svg>,
  },
];

interface ParentDashboardLayoutProps {
  children: React.ReactNode;
  activeTab: ParentTab;
}

export default function ParentDashboardLayout({ children, activeTab }: ParentDashboardLayoutProps) {
  const navigate = useNavigate();
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { navigate('/login'); return; }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) { setUser(session.user); setLoading(false); }
      else { navigate('/login'); }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF8F0' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl"
               style={{ background: 'linear-gradient(135deg, #F0A855, #BA7517)' }}>A</div>
          <p className="font-body text-sm text-gray-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'PA';
  const email    = user?.email ?? '';

  const tabPath = (key: ParentTab) =>
    key === 'overview' ? '/parent-dashboard' : `/parent-dashboard/${key}`;

  return (
    <div className="flex min-h-screen" style={{ background: '#FFF8F0' }}>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-orange-100 bg-white"
             style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

        {/* Logo */}
        <div className="px-5 py-5 border-b border-orange-100">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-8 w-auto object-contain" />
          </Link>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-orange-100">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
               style={{ background: '#FAEEDA' }}>
            <span className="text-base">👨‍👩‍👧</span>
            <span className="font-body text-xs font-bold" style={{ color: '#BA7517' }}>Parent Portal</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {TABS.map(t => (
            <Link key={t.key} to={tabPath(t.key)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body font-medium text-sm transition-all no-underline"
              style={activeTab === t.key
                ? { background: '#FAEEDA', color: '#7A4D0F' }
                : { color: '#6b7280' }}
              onMouseEnter={e => { if (activeTab !== t.key) { (e.currentTarget as HTMLElement).style.background = '#FAEEDA'; (e.currentTarget as HTMLElement).style.color = '#7A4D0F'; } }}
              onMouseLeave={e => { if (activeTab !== t.key) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; } }}>
              <span style={activeTab === t.key ? { color: '#BA7517' } : {}}>{t.icon}</span>
              {t.label}
            </Link>
          ))}
        </nav>

        {/* Switch to student view */}
        <div className="px-4 py-3 border-t border-orange-100">
          <Link to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-body text-xs font-medium text-gray-500 no-underline hover:bg-gray-50 transition-colors">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M6 3l-4 5 4 5M2 8h12"/>
            </svg>
            Student dashboard
          </Link>
        </div>

        {/* User */}
        <div className="px-4 py-4 border-t border-orange-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #F0A855, #BA7517)' }}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs font-semibold text-gray-900 truncate">{email}</p>
              <p className="font-body text-[10px] text-gray-400">Parent</p>
            </div>
            <button onClick={async () => { await supabase?.auth.signOut(); navigate('/login'); }}
              className="text-gray-400 hover:text-gray-600 transition-colors" title="Sign out">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M13 3h4v14h-4M9 14l4-4-4-4M13 10H4"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-orange-100 sticky top-0 z-20">
          <Link to="/" className="no-underline">
            <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-7 w-auto object-contain" />
          </Link>
          <span className="font-body text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: '#FAEEDA', color: '#BA7517' }}>Parent</span>
          <button onClick={async () => { await supabase?.auth.signOut(); navigate('/login'); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #F0A855, #BA7517)' }}>
            {initials}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-5xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 z-30 flex"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {TABS.map(t => (
          <Link key={t.key} to={tabPath(t.key)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-1 no-underline transition-colors"
            style={{ color: activeTab === t.key ? '#7A4D0F' : '#9ca3af' }}>
            <span className="scale-90">{t.icon}</span>
            <span className="text-[10px] font-semibold">{t.mobileLabel}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
