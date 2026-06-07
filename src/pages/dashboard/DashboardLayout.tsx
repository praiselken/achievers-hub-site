import { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import MindsetPopup from '../../components/MindsetPopup';

type Tab = 'home' | 'daily5' | 'topics' | 'papers' | 'spec';
export type Subject = 'maths' | 'economics';

// ── Subject context ──────────────────────────────────────────────────────────
interface SubjectCtx { subject: Subject; setSubject: (s: Subject) => void; }
export const SubjectContext = createContext<SubjectCtx>({ subject: 'maths', setSubject: () => {} });
export const useSubject = () => useContext(SubjectContext);

// ── Tab config ───────────────────────────────────────────────────────────────
const TABS: { key: Tab; label: string; path: string; icon: React.ReactNode }[] = [
  {
    key: 'home', label: 'Dashboard', path: '/dashboard',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M7 18V11h6v7"/></svg>,
  },
  {
    key: 'daily5', label: 'Daily 5', path: '/dashboard/daily5',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M10 2l2.09 4.26L17 7.27l-3.5 3.41.83 4.82L10 13.27l-4.33 2.23.83-4.82L3 7.27l4.91-.71z"/></svg>,
  },
  {
    key: 'topics', label: 'Topic Hub', path: '/dashboard/topics',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M4 4h5v5H4zM11 4h5v5h-5zM4 11h5v5H4zM11 11h5v5h-5z"/></svg>,
  },
  {
    key: 'papers', label: 'Past Papers', path: '/dashboard/papers',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M8 7h4M8 10h4M8 13h2"/></svg>,
  },
  {
    key: 'spec', label: 'Spec Mapper', path: '/dashboard/spec',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="10" cy="10" r="8"/><path d="M10 2a15 15 0 010 16M2 10h16"/></svg>,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
}

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [user, setUser]               = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar]           = useState('🎓');
  const [loading, setLoading]         = useState(true);
  const [subject, setSubject]         = useState<Subject>('maths');

  useEffect(() => {
    if (!supabase) { navigate('/login'); return; }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase!
          .from('profiles')
          .select('display_name, avatar, subjects')
          .eq('id', session.user.id)
          .single();
        if (profile?.display_name) setDisplayName(profile.display_name);
        if (profile?.avatar)       setAvatar(profile.avatar);
        if (profile?.subjects?.[0]) setSubject(profile.subjects[0] as Subject);
        setLoading(false);
      } else {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F5FD' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl"
               style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)' }}>A</div>
          <p className="font-body text-sm text-gray-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const email = user?.email ?? '';
  const nameOrEmail = displayName || email.split('@')[0];

  return (
    <SubjectContext.Provider value={{ subject, setSubject }}>
      <MindsetPopup />

      <div className="flex min-h-screen" style={{ background: '#F8F5FD' }}>

        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-gray-100 bg-white"
               style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

          {/* Logo */}
          <div className="px-5 py-5 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-8 w-auto object-contain" />
            </Link>
          </div>

          {/* Subject switcher */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-body text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Subject</p>
            <div className="flex gap-1.5">
              {(['maths', 'economics'] as Subject[]).map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  className="flex-1 py-1.5 rounded-lg font-body font-semibold text-xs capitalize transition-all"
                  style={subject === s
                    ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }
                    : { background: 'transparent', color: '#9ca3af', border: '1.5px solid #f3f4f6' }}>
                  {s === 'maths' ? '📐 Maths' : '📊 Econ'}
                </button>
              ))}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {TABS.map(t => (
              <Link key={t.key} to={t.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body font-medium text-sm transition-all no-underline"
                style={activeTab === t.key
                  ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)' }
                  : { color: '#6b7280' }}
                onMouseEnter={e => { if (activeTab !== t.key) { (e.currentTarget as HTMLElement).style.background = 'var(--purple-faint)'; (e.currentTarget as HTMLElement).style.color = 'var(--purple-dark)'; } }}
                onMouseLeave={e => { if (activeTab !== t.key) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; } }}>
                <span style={activeTab === t.key ? { color: 'var(--purple)' } : {}}>{t.icon}</span>
                {t.label}
                {t.key === 'daily5' && (
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: 'var(--purple)' }}>Today</span>
                )}
              </Link>
            ))}
          </nav>

          {/* User */}
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                   style={{ background: 'var(--purple-faint)', border: '1.5px solid var(--purple-light)' }}>
                {avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs font-semibold text-gray-900 truncate">{nameOrEmail}</p>
                <p className="font-body text-[10px] text-gray-400">Student</p>
              </div>
              <button
                onClick={async () => { await supabase?.auth.signOut(); navigate('/login'); }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Sign out">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M13 3h4v14h-4M9 14l4-4-4-4M13 10H4"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 flex flex-col min-h-screen pb-20 md:pb-0">

          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20">
            <Link to="/" className="no-underline">
              <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-7 w-auto object-contain" />
            </Link>
            {/* Mobile subject switcher */}
            <div className="flex gap-1.5">
              {(['maths', 'economics'] as Subject[]).map(s => (
                <button key={s} onClick={() => setSubject(s)}
                  className="px-2.5 py-1 rounded-lg font-body font-semibold text-xs capitalize transition-all"
                  style={subject === s
                    ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }
                    : { background: 'transparent', color: '#9ca3af', border: '1.5px solid #f3f4f6' }}>
                  {s === 'maths' ? '📐' : '📊'}
                </button>
              ))}
            </div>
            <button
              onClick={async () => { await supabase?.auth.signOut(); navigate('/login'); }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'var(--purple-faint)', border: '1.5px solid var(--purple-light)' }}>
              {avatar}
            </button>
          </div>

          {/* Page content */}
          <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-5xl w-full mx-auto">
            {children}
          </div>
        </main>

        {/* ── Mobile bottom tab bar ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-30 flex"
             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {TABS.map(t => (
            <Link key={t.key} to={t.path}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 no-underline transition-colors"
              style={{ color: activeTab === t.key ? 'var(--purple-dark)' : '#9ca3af' }}>
              <span className="scale-90">{t.icon}</span>
              <span className="text-[10px] font-semibold">{t.label === 'Dashboard' ? 'Home' : t.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </SubjectContext.Provider>
  );
}
