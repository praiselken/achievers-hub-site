import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import StudentPage from './pages/StudentPage';
import ParentPage from './pages/ParentPage';
import TutorPage from './pages/TutorPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ParentDashboard from './pages/dashboard/parent/ParentDashboard';
import TutorDashboard    from './pages/dashboard/tutor/TutorDashboard';
import FindATutorPage   from './pages/FindATutorPage';
import AdminPage        from './pages/admin/AdminPage';
import NotFoundPage    from './pages/NotFoundPage';
import AuthRouter from './pages/AuthRouter';
import OnboardingPage from './pages/OnboardingPage';
import { supabase } from './lib/supabase';
import './index.css';

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
      if (!pendingRole) return;
      const { data: existing } = await client.from('profiles').select('id').eq('id', session.user.id).single();
      if (!existing) {
        await client.from('profiles').insert({ id: session.user.id, role: pendingRole });
      }
      localStorage.removeItem('pending_role');
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Marketing pages — have Nav + Footer */}
        <Route path="/" element={<MarketingLayout><Navigate to="/student" replace /></MarketingLayout>} />
        <Route path="/student"  element={<MarketingLayout><StudentPage /></MarketingLayout>} />
        <Route path="/parent"   element={<MarketingLayout><ParentPage /></MarketingLayout>} />
        <Route path="/tutor"    element={<MarketingLayout><TutorPage /></MarketingLayout>} />
        <Route path="/signup"   element={<MarketingLayout><SignUpPage /></MarketingLayout>} />
        <Route path="/pricing"        element={<MarketingLayout><PricingPage /></MarketingLayout>} />
        <Route path="/find-a-tutor"  element={<MarketingLayout><FindATutorPage /></MarketingLayout>} />
        <Route path="/login"       element={<LoginPage />} />
        <Route path="/auth"        element={<AuthRouter />} />
        <Route path="/onboarding"  element={<OnboardingPage />} />
        <Route path="/overview" element={<MarketingLayout><HomePage /></MarketingLayout>} />

        {/* Student dashboard */}
        <Route path="/dashboard"        element={<StudentDashboard tab="home" />} />
        <Route path="/dashboard/daily5" element={<StudentDashboard tab="daily5" />} />
        <Route path="/dashboard/topics" element={<StudentDashboard tab="topics" />} />
        <Route path="/dashboard/papers" element={<StudentDashboard tab="papers" />} />
        <Route path="/dashboard/spec"      element={<StudentDashboard tab="spec" />} />
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

        {/* 404 */}
        <Route path="*" element={<MarketingLayout><NotFoundPage /></MarketingLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
