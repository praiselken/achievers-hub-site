import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ReviewsCarousel from '../components/ReviewsCarousel';

type Mode = 'login' | 'signup';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleGoogleAuth() {
    if (!supabase) { setError('Supabase is not configured yet.'); return; }
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/student` },
    });
    if (error) setError(error.message);
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) { setError('Supabase is not configured yet.'); return; }
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) { setError(error.message); return; }
        navigate('/student');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) { setError(error.message); return; }
        setSuccess('Check your email for a confirmation link to activate your account.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen pt-[var(--nav-h)] flex flex-col md:flex-row"
         style={{ background: '#f0fdf4' }}>

      {/* ── Left panel: reviews carousel (desktop only) ── */}
      <div className="hidden md:flex flex-col flex-1 max-w-md xl:max-w-lg p-8 relative"
           style={{ minHeight: 'calc(100vh - var(--nav-h))' }}>
        <div className="mb-6">
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-1">
            Trusted by students,<br />
            parents &amp; tutors
          </h2>
          <p className="font-body text-sm text-gray-500">Real results from real people</p>
        </div>
        <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - var(--nav-h) - 120px)' }}>
          <ReviewsCarousel />
        </div>
      </div>

      {/* ── Right panel: auth form ── */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-12">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 w-full max-w-md"
             style={{ boxShadow: 'var(--shadow-lg)' }}>

          {/* Logo */}
          <div className="flex items-center gap-2.5 justify-center mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-xl text-white"
                 style={{ background: 'linear-gradient(135deg, #639922, #1D9E75)' }}>A</div>
            <span className="font-body font-semibold text-lg text-gray-900">
              Achievers<span style={{ color: 'var(--g400)' }}>Hub</span>
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl text-gray-900 text-center mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="font-body text-gray-400 text-sm text-center mb-7">
            {mode === 'login' ? 'Sign in to continue your revision' : 'Join thousands of students getting results'}
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleAuth}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border-2 border-gray-100 bg-white font-body font-semibold text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all mb-4">
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="font-body text-xs text-gray-400 uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
            <div>
              <label className="font-body text-xs font-semibold text-gray-600 mb-1 block">Email</label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                style={{ background: '#fafafa' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--g400)'}
                onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label className="font-body text-xs font-semibold text-gray-600 mb-1 block">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 font-body text-sm text-gray-900 placeholder-gray-400 outline-none transition-all"
                style={{ background: '#fafafa' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--g400)'}
                onBlur={e => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-body text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 font-body text-sm text-green-800">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-body font-semibold text-sm text-white transition-all disabled:opacity-60 mt-1"
              style={{ background: 'linear-gradient(135deg, var(--g400), var(--t400))', boxShadow: 'var(--shadow-glow-green)' }}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="font-body text-sm text-gray-400 text-center mt-5">
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <button onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                        className="font-semibold hover:underline" style={{ color: 'var(--g400)' }}>
                  Sign up
                </button>
              </>
            ) : (
              <>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                        className="font-semibold hover:underline" style={{ color: 'var(--g400)' }}>
                  Sign in
                </button>
              </>
            )}
          </p>

          {mode === 'signup' && (
            <p className="font-body text-xs text-gray-400 text-center mt-3">
              Want to choose your role first?{' '}
              <Link to="/signup" className="font-semibold hover:underline" style={{ color: 'var(--g400)' }}>
                Select role →
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* ── Mobile reviews (below form) ── */}
      <div className="md:hidden px-4 pb-12">
        <h2 className="font-display font-bold text-xl text-gray-900 mb-1 text-center">What people are saying</h2>
        <p className="font-body text-sm text-gray-500 text-center mb-5">Real results from real people</p>
        <div style={{ height: '420px' }}>
          <ReviewsCarousel />
        </div>
      </div>
    </div>
  );
}
