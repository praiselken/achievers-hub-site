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
import { supabase } from './lib/supabase';
import './index.css';

export default function App() {
  useEffect(() => {
    const client = supabase;
    if (!client) return;
    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) return;
      const pendingRole = localStorage.getItem('pending_role');
      if (!pendingRole) return;
      const { data: existing } = await client
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single();
      if (!existing) {
        await client.from('profiles').insert({ id: session.user.id, role: pendingRole });
      }
      localStorage.removeItem('pending_role');
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Navigate to="/student" replace />} />
        <Route path="/student" element={<StudentPage />} />
        <Route path="/parent" element={<ParentPage />} />
        <Route path="/tutor" element={<TutorPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/overview" element={<HomePage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
