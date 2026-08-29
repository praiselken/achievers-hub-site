import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Nav from './components/Nav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ContentPage from './pages/ContentPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ParentDashboard from './pages/dashboard/parent/ParentDashboard';
import TutorDashboard    from './pages/dashboard/tutor/TutorDashboard';
import FindATutorPage   from './pages/FindATutorPage';
import AdminPage        from './pages/admin/AdminPage';
import AuthRouter from './pages/AuthRouter';
import OnboardingPage from './pages/OnboardingPage';
import { supabase } from './lib/supabase';
import { enterDemoMode } from './lib/demoMode';
import './index.css';

/** Roles a person may choose for themselves during signup. Admin is not one. */
const SELF_ASSIGNABLE_ROLES = ['student', 'parent', 'tutor'] as const;
type SelfAssignableRole = (typeof SELF_ASSIGNABLE_ROLES)[number];

function DemoEntry() {
  // Runs synchronously during render so the flag is set before <Navigate>'s
  // own effect fires — sessionStorage writes are idempotent, safe to redo.
  enterDemoMode();
  return <Navigate to="/dashboard" replace />;
}

function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return;
      const pendingRole = localStorage.getItem('pending_role');
      // Always clear it, so a stale or tampered value can't persist across sign-ins.
      localStorage.removeItem('pending_role');
      if (!pendingRole) return;
      // localStorage is fully user-controlled, so treat this as untrusted input:
      // only ever self-assign a role a person is allowed to pick at signup.
      // Privileged roles (admin) must be granted server-side, never from here.
      const role = SELF_ASSIGNABLE_ROLES.includes(pendingRole as SelfAssignableRole)
        ? pendingRole
        : 'student';
      const { data: existing } = await client.from('profiles').select('id').eq('id', session.user.id).single();
      if (!existing) {
        await client.from('profiles').insert({ id: session.user.id, role });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        {/* Marketing pages — have Nav + Footer (client redesign, Aug 2026) */}
        <Route path="/" element={<MarketingLayout><HomePage /></MarketingLayout>} />
        {/* Old singular marketing routes → redesign's content pages */}
        <Route path="/student"  element={<Navigate to="/students" replace />} />
        <Route path="/parent"   element={<Navigate to="/parents" replace />} />
        <Route path="/tutor"    element={<Navigate to="/tutors" replace />} />
        <Route path="/signup"   element={<MarketingLayout><SignUpPage /></MarketingLayout>} />
        <Route path="/pricing"        element={<MarketingLayout><PricingPage /></MarketingLayout>} />
        <Route path="/find-a-tutor"  element={<MarketingLayout><FindATutorPage /></MarketingLayout>} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/demo"        element={<DemoEntry />} />
        <Route path="/auth"        element={<AuthRouter />} />
        <Route path="/onboarding"  element={<OnboardingPage />} />
        <Route path="/overview" element={<MarketingLayout><HomePage /></MarketingLayout>} />

        {/* Student dashboard */}
        <Route path="/dashboard"        element={<StudentDashboard tab="home" />} />
        <Route path="/dashboard/daily5" element={<StudentDashboard tab="daily5" />} />
        <Route path="/dashboard/topics" element={<StudentDashboard tab="topics" />} />
        <Route path="/dashboard/papers" element={<StudentDashboard tab="papers" />} />
        <Route path="/dashboard/spec"      element={<StudentDashboard tab="spec" />} />
        <Route path="/dashboard/achievements" element={<StudentDashboard tab="achievements" />} />
        <Route path="/dashboard/tsg"      element={<StudentDashboard tab="tsg" />} />
        <Route path="/dashboard/settings"  element={<StudentDashboard tab="settings" />} />

        {/* Parent dashboard */}
        <Route path="/parent-dashboard"           element={<ParentDashboard tab="overview" />} />
        <Route path="/parent-dashboard/progress"  element={<ParentDashboard tab="progress" />} />
        <Route path="/parent-dashboard/spec"      element={<ParentDashboard tab="spec" />} />
        <Route path="/parent-dashboard/bookings"  element={<ParentDashboard tab="bookings" />} />

        {/* Admin — no nav/footer, role-gated */}
        <Route path="/admin"           element={<AdminPage tab="questions" />} />
        <Route path="/admin/questions" element={<AdminPage tab="questions" />} />
        <Route path="/admin/topics"    element={<AdminPage tab="topics" />} />
        <Route path="/admin/papers"    element={<AdminPage tab="papers" />} />
        <Route path="/admin/mindset"   element={<AdminPage tab="mindset" />} />
        <Route path="/admin/users"     element={<AdminPage tab="users" />} />

        {/* Tutor dashboard */}
        <Route path="/tutor-dashboard"            element={<TutorDashboard tab="overview" />} />
        <Route path="/tutor-dashboard/students"   element={<TutorDashboard tab="students" />} />
        <Route path="/tutor-dashboard/sessions"   element={<TutorDashboard tab="sessions" />} />
        <Route path="/tutor-dashboard/analytics"  element={<TutorDashboard tab="analytics" />} />
        <Route path="/tutor-dashboard/resources"  element={<TutorDashboard tab="resources" />} />
        <Route path="/tutor-dashboard/profile"    element={<TutorDashboard tab="profile" />} />

        {/* Content-driven public pages (features/*, subjects/*, students, parents,
            tutors, how-it-works, faq, legal, …) with 404 fallback */}
        <Route path="*" element={<MarketingLayout><ContentPage /></MarketingLayout>} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
