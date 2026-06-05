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
import StudentDashboard from './pages/dashboard/StudentDashboard';
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
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/overview" element={<MarketingLayout><HomePage /></MarketingLayout>} />

        {/* Dashboard — no marketing nav/footer */}
        <Route path="/dashboard"        element={<StudentDashboard tab="home" />} />
        <Route path="/dashboard/daily5" element={<StudentDashboard tab="daily5" />} />
        <Route path="/dashboard/topics" element={<StudentDashboard tab="topics" />} />
        <Route path="/dashboard/papers" element={<StudentDashboard tab="papers" />} />
        <Route path="/dashboard/spec"   element={<StudentDashboard tab="spec" />} />
      </Routes>
    </BrowserRouter>
  );
}
