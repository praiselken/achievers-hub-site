import { useEffect, useState, createContext, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DemoJourneyBar } from '../../components/demo/DemoJourneyBar';
import { supabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';
import MindsetPopup from '../../components/MindsetPopup';
import { useSubjects } from '../../lib/useSubjects';
import { getUserStats } from '../../lib/xp';
import { isDemoMode, exitDemoMode } from '../../lib/demoMode';
import { DEMO_PROFILE, DEMO_STATS } from '../../lib/demoData';
import { Sidebar, type DashTab } from '../../components/dashboard/Sidebar';
import { Topbar } from '../../components/dashboard/Topbar';

type Tab = DashTab;
export type Subject = 'maths' | 'economics';

// ── Subject context ──────────────────────────────────────────────────────────
interface SubjectCtx { subject: Subject; setSubject: (s: Subject) => void; }
export const SubjectContext = createContext<SubjectCtx>({ subject: 'maths', setSubject: () => {} });
export const useSubject = () => useContext(SubjectContext);

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: Tab;
}

export default function DashboardLayout({ children, activeTab }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [user, setUser]               = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar]           = useState('');
  const [loading, setLoading]         = useState(true);
  const [subject, setSubject]         = useState<Subject>('maths');
  const [xpTotal, setXpTotal]         = useState(0);
  const [level, setLevel]             = useState(1);
  const [isAdmin, setIsAdmin]         = useState(false);
  const { activeSubjects } = useSubjects();
  const demo = isDemoMode();

  useEffect(() => {
    if (isDemoMode()) {
      setDisplayName(DEMO_PROFILE.display_name);
      setAvatar(DEMO_PROFILE.avatar);
      setSubject(DEMO_PROFILE.subjects[0] as Subject);
      // AdminGuard admits demo sessions, so surface the link too — otherwise
      // the admin panel is reachable only by typing the URL.
      setIsAdmin(true);
      setXpTotal(DEMO_STATS.xpTotal);
      setLevel(DEMO_STATS.level);
      setLoading(false);
      return;
    }

    if (!supabase) { navigate('/login'); return; }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase!
          .from('profiles')
          .select('display_name, avatar, subjects, role')
          .eq('id', session.user.id)
          .single();
        if (profile?.display_name) setDisplayName(profile.display_name);
        if (profile?.avatar)       setAvatar(profile.avatar);
        if (profile?.subjects?.[0]) setSubject(profile.subjects[0] as Subject);
        setIsAdmin(profile?.role === 'admin');
        const stats = await getUserStats(session.user.id);
        setXpTotal(stats.xpTotal);
        setLevel(stats.level);
        setLoading(false);
      } else {
        navigate('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f8fb]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-xl font-bold text-white"
               style={{ background: 'linear-gradient(135deg, #7040d7, #5f25c2)' }}>A</div>
          <p className="text-sm text-slate-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const email = user?.email ?? '';
  const fullName = displayName || email.split('@')[0] || 'Student';
  const firstName = fullName.split(' ')[0];
  const initials =
    fullName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';

  async function handleSignOut() {
    exitDemoMode();
    await supabase?.auth.signOut();
    navigate('/login');
  }

  return (
    <SubjectContext.Provider value={{ subject, setSubject }}>
      <MindsetPopup />

      <div className="mkt flex min-h-screen bg-[#f8f8fb] text-slate-950">
        <Sidebar
          activeTab={activeTab}
          fullName={fullName}
          yearLabel={demo ? 'Year 11 student' : 'Student'}
          level={level}
          xpTotal={xpTotal}
          avatar={avatar}
          isAdmin={isAdmin}
        />

        <div className="min-w-0 flex-1">
          <Topbar
            activeTab={activeTab}
            firstName={firstName}
            initials={initials}
            avatar={avatar}
            subject={subject}
            subjects={activeSubjects}
            onSubjectChange={(slug) => setSubject(slug as Subject)}
            onSignOut={handleSignOut}
          />

          {demo && (
            <>
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-950" role="status">
                Demonstration data only. This preview is not a student record or evidence of
                product results.{' '}
                {/* The paid journey starts on Pricing, and nothing else in the
                    dashboard links there — without this it cannot be found. */}
                <Link to="/pricing" className="underline underline-offset-2 hover:no-underline">
                  Walk through the membership journey
                </Link>
                .
              </div>
              <DemoJourneyBar />
            </>
          )}

          <main className="mx-auto w-full max-w-7xl px-3 py-5 sm:px-6 lg:py-7">
            {children}
          </main>
        </div>
      </div>
    </SubjectContext.Provider>
  );
}
