import { useEffect, useState, createContext, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type TutorTab = 'overview' | 'students' | 'sessions' | 'analytics' | 'resources' | 'profile';

interface TutorCtx { tutorId: string; displayName: string; }
export const TutorContext = createContext<TutorCtx>({ tutorId: '', displayName: '' });
export const useTutor = () => useContext(TutorContext);

const TABS: { key: TutorTab; label: string; path: string; icon: React.ReactNode }[] = [
  {
    key: 'overview', label: 'Overview', path: '/tutor-dashboard',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M7 18V11h6v7"/></svg>,
  },
  {
    key: 'students', label: 'Students', path: '/tutor-dashboard/students',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="8" cy="7" r="3"/><path d="M2 18c0-3.314 2.686-6 6-6s6 2.686 6 6"/><circle cx="15" cy="8" r="2.5"/><path d="M15 13c2.21 0 4 1.79 4 4"/></svg>,
  },
  {
    key: 'sessions', label: 'Sessions', path: '/tutor-dashboard/sessions',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="4" width="16" height="13" rx="2"/><path d="M6 2v3M14 2v3M2 9h16"/></svg>,
  },
  {
    key: 'analytics', label: 'Analytics', path: '/tutor-dashboard/analytics',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 14l4-5 4 3 4-7"/><circle cx="3" cy="14" r="1.5" fill="currentColor"/></svg>,
  },
  {
    key: 'resources', label: 'Resources', path: '/tutor-dashboard/resources',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M6 2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/><path d="M8 7h4M8 10h4M8 13h2"/></svg>,
  },
  {
    key: 'profile', label: 'Profile', path: '/tutor-dashboard/profile',
    icon: <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="10" cy="7" r="3.5"/><path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7"/></svg>,
  },
];

const AMBER = '#D97706';
const AMBER_FAINT = '#FEF3C7';
const AMBER_LIGHT = '#FDE68A';

interface Props { children: React.ReactNode; activeTab: TutorTab; }

export default function TutorDashboardLayout({ children, activeTab }: Props) {
  const navigate = useNavigate();
  const [user, setUser]             = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar]         = useState('🎓');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    if (!supabase) { navigate('/login'); return; }
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase!
          .from('profiles')
          .select('display_name, avatar')
          .eq('id', session.user.id)
          .single();
        if (profile?.display_name) setDisplayName(profile.display_name);
        if (profile?.avatar)       setAvatar(profile.avatar);
        setLoading(false);
      } else {
        navigate('/login');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFBF0' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl"
               style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>T</div>
          <p className="font-body text-sm text-gray-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const nameOrEmail = displayName || (user?.email?.split('@')[0] ?? '');

  return (
    <TutorContext.Provider value={{ tutorId: user?.id ?? '', displayName: nameOrEmail }}>
      <div className="flex min-h-screen" style={{ background: '#FFFBF0' }}>

        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-amber-100 bg-white"
               style={{ position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

          <div className="px-5 py-5 border-b border-amber-100">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-8 w-auto object-contain" />
            </Link>
          </div>

          {/* Tutor badge */}
          <div className="px-4 py-3 border-b border-amber-100">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                 style={{ background: AMBER_FAINT, border: `1px solid ${AMBER_LIGHT}` }}>
              <span className="text-sm">🏫</span>
              <span className="font-body text-xs font-bold" style={{ color: AMBER }}>Tutor Dashboard</span>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {TABS.map(t => (
              <Link key={t.key} to={t.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body font-medium text-sm transition-all no-underline"
                style={activeTab === t.key
                  ? { background: AMBER_FAINT, color: '#92400E' }
                  : { color: '#6b7280' }}
                onMouseEnter={e => { if (activeTab !== t.key) { (e.currentTarget as HTMLElement).style.background = AMBER_FAINT; (e.currentTarget as HTMLElement).style.color = '#92400E'; } }}
                onMouseLeave={e => { if (activeTab !== t.key) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#6b7280'; } }}>
                <span style={activeTab === t.key ? { color: AMBER } : {}}>{t.icon}</span>
                {t.label}
              </Link>
            ))}
          </nav>

          <div className="px-4 py-4 border-t border-amber-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                   style={{ background: AMBER_FAINT, border: `1.5px solid ${AMBER_LIGHT}` }}>
                {avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-xs font-semibold text-gray-900 truncate">{nameOrEmail}</p>
                <p className="font-body text-[10px] text-gray-400">Tutor</p>
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
          <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-amber-100 sticky top-0 z-20">
            <Link to="/" className="no-underline">
              <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-7 w-auto object-contain" />
            </Link>
            <span className="font-body text-xs font-bold px-2.5 py-1.5 rounded-lg"
                  style={{ background: AMBER_FAINT, color: AMBER }}>Tutor</span>
            <button onClick={async () => { await supabase?.auth.signOut(); navigate('/login'); }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
              style={{ background: AMBER_FAINT, border: `1.5px solid ${AMBER_LIGHT}` }}>
              {avatar}
            </button>
          </div>

          <div className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-5xl w-full mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 z-30 flex"
             style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {TABS.map(t => (
            <Link key={t.key} to={t.path}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 no-underline transition-colors"
              style={{ color: activeTab === t.key ? '#92400E' : '#9ca3af' }}>
              <span className="scale-90">{t.icon}</span>
              <span className="text-[10px] font-semibold">{t.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </TutorContext.Provider>
  );
}
