import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import StudentPage from './pages/StudentPage';
import ParentPage from './pages/ParentPage';
import TutorPage from './pages/TutorPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import './index.css';

export default function App() {
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
