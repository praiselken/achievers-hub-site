import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ReviewsCarousel from '../components/ReviewsCarousel';
import { enterDemoMode } from '../lib/demoMode';
import { Logo } from '../components/marketing/Logo';

const DEMO_USERNAME = 'student1';
const DEMO_PASSWORD = 'achievershub';

type Mode = 'login' | 'signup-role' | 'signup-form';
type Role = 'student' | 'parent' | 'tutor';

const ROLES: { key: Role; label: string; emoji: string; sub: string; bg: string; color: string }[] = [
  { key: 'student', label: 'Student',  emoji: '🎓', sub: 'I want to improve my GCSE grades',    bg: 'var(--color-success-50)', color: 'var(--color-success-600)' },
  { key: 'parent',  label: 'Parent',   emoji: '👨‍👩‍👧', sub: "I want to track my child's progress", bg: 'var(--feature-daily-bg)', color: 'var(--feature-daily-strong)' },
  { key: 'tutor',   label: 'Tutor',    emoji: '📚', sub: 'I tutor GCSE students',                bg: 'var(--feature-topic-bg)', color: 'var(--feature-topic-strong)' },
];


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

function AuthForm({
  onSwitchToSignup,
}: {
  onSwitchToSignup: () => void;
}) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleGoogleAuth() {
    if (!supabase) { setError('Supabase is not configured yet.'); return; }
    setError('');
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth` },
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess('');

    if (email.trim().toLowerCase() === DEMO_USERNAME && password === DEMO_PASSWORD) {
      enterDemoMode();
      navigate('/dashboard');
      return;
    }

    if (!supabase) { setError('Supabase is not configured yet.'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); return; }
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="font-display font-bold text-2xl text-[var(--color-ink-900)] text-center mb-1">Welcome back</h1>
      <p className="text-[var(--color-ink-300)] text-sm text-center mb-7">Sign in to continue your revision</p>

      <button onClick={handleGoogleAuth}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white font-semibold text-sm text-[var(--color-ink-700)] hover:border-slate-300 hover:bg-slate-50 transition-all mb-4">
        <GoogleIcon /> Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-[var(--color-ink-300)] uppercase tracking-wide">or</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold text-[var(--color-ink-500)] mb-1 block">Email</label>
          <input type="text" required placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[var(--color-ink-900)] placeholder-gray-400 outline-none transition-all"
            style={{ background: '#fbfafc' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary-500)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-ink-500)] mb-1 block">Password</label>
          <input type="password" required minLength={6} placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[var(--color-ink-900)] placeholder-gray-400 outline-none transition-all"
            style={{ background: '#fbfafc' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary-500)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-800">{success}</div>}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60 mt-1"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))', boxShadow: 'var(--shadow-soft-lg)' }}>
          {loading ? 'Please wait…' : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-[var(--color-ink-300)] text-center mt-5">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignup} className="font-semibold hover:underline" style={{ color: 'var(--color-primary-500)' }}>
          Sign up
        </button>
      </p>
      <p className="text-sm text-[var(--color-ink-300)] text-center mt-2">
        <Link to="/demo" className="font-semibold hover:underline" style={{ color: 'var(--color-primary-500)' }}>
          Or view a live demo →
        </Link>
      </p>
    </>
  );
}

function RoleStep({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <>
      <h1 className="font-display font-bold text-2xl text-[var(--color-ink-900)] text-center mb-1">Who are you?</h1>
      <p className="text-[var(--color-ink-300)] text-sm text-center mb-7">Choose your role to get started</p>

      <div className="flex flex-col gap-3">
        {ROLES.map(r => (
          <button key={r.key} onClick={() => onSelect(r.key)}
            className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white text-left transition-all w-full group"
            onMouseEnter={e => { e.currentTarget.style.borderColor = r.color; e.currentTarget.style.background = r.bg; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#F1EFE8'; e.currentTarget.style.background = 'white'; }}>
            <span className="text-2xl flex-shrink-0">{r.emoji}</span>
            <div className="flex-1">
              <div className="font-bold text-[var(--color-ink-900)] text-[15px]">{r.label}</div>
              <div className="text-xs text-[var(--color-ink-300)] mt-0.5">{r.sub}</div>
            </div>
            <span className="text-gray-300 text-lg">→</span>
          </button>
        ))}
      </div>
    </>
  );
}

function SignupForm({ role, onBack, onSwitchToLogin }: { role: Role; onBack: () => void; onSwitchToLogin: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const roleInfo = ROLES.find(r => r.key === role)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) { setError('Supabase is not configured yet.'); return; }
    setError(''); setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) { setError(signUpError.message); return; }

      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, role, onboarded: false });
      }

      // Save role hint so onboarding page knows which avatar set to show
      localStorage.setItem('signup_role', role);

      if (data.session) {
        navigate('/onboarding');
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[var(--color-ink-300)] hover:text-[var(--color-ink-700)] transition-colors mb-5">
        <span>←</span> Back
      </button>

      {/* Selected role badge */}
      <div className="flex justify-center mb-5">
        <span className="flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm"
              style={{ background: roleInfo.bg, color: roleInfo.color }}>
          <span>{roleInfo.emoji}</span> Signing up as {roleInfo.label}
        </span>
      </div>

      <h1 className="font-display font-bold text-2xl text-[var(--color-ink-900)] text-center mb-1">Create your account</h1>
      <p className="text-[var(--color-ink-300)] text-sm text-center mb-6">Join thousands getting results</p>

      {/* Google signup */}
      <button
        onClick={async () => {
          if (!supabase) { setError('Supabase is not configured yet.'); return; }
          setError('');
          // persist role so the auth listener can save it after the OAuth redirect
          localStorage.setItem('pending_role', role);
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth`,
              queryParams: { access_type: 'offline', prompt: 'consent' },
            },
          });
        }}
        type="button"
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border-2 border-slate-200 bg-white font-semibold text-sm text-[var(--color-ink-700)] hover:border-slate-300 hover:bg-slate-50 transition-all mb-4">
        <GoogleIcon /> Continue with Google
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-[var(--color-ink-300)] uppercase tracking-wide">or</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-xs font-semibold text-[var(--color-ink-500)] mb-1 block">Email</label>
          <input type="email" required placeholder="you@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[var(--color-ink-900)] placeholder-gray-400 outline-none transition-all"
            style={{ background: '#fbfafc' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary-500)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-ink-500)] mb-1 block">Password</label>
          <input type="password" required minLength={6} placeholder="At least 6 characters"
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-[var(--color-ink-900)] placeholder-gray-400 outline-none transition-all"
            style={{ background: '#fbfafc' }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary-500)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          />
        </div>

        {error && <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-800">{success}</div>}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-60 mt-1"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))', boxShadow: 'var(--shadow-soft-lg)' }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-[var(--color-ink-300)] text-center mt-5">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="font-semibold hover:underline" style={{ color: 'var(--color-primary-500)' }}>
          Sign in
        </button>
      </p>
    </>
  );
}

function FormPanel({ isMobile = false, initialMode = 'login' }: { isMobile?: boolean; initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const card = (
    <div className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[var(--shadow-soft-lg)]">
      {mode === 'login' && (
        <AuthForm
          onSwitchToSignup={() => setMode('signup-role')}
        />
      )}
      {mode === 'signup-role' && (
        <RoleStep onSelect={r => { setSelectedRole(r); setMode('signup-form'); }} />
      )}
      {mode === 'signup-form' && selectedRole && (
        <SignupForm
          role={selectedRole}
          onBack={() => setMode('signup-role')}
          onSwitchToLogin={() => { setMode('login'); setSelectedRole(null); }}
        />
      )}
    </div>
  );

  if (isMobile) return <div className="flex items-center justify-center px-5 py-10">{card}</div>;
  return <div className="flex flex-1 items-center justify-center p-8">{card}</div>;
}

export default function LoginPage() {
  const [params] = useSearchParams();
  const initialMode: Mode = params.get('mode') === 'signup' ? 'signup-role' : 'login';

  return (
    // .mkt carries the redesign's tokens and Inter; this page sits outside the
    // marketing layout, so it has to opt in explicitly.
    <div className="mkt flex min-h-screen flex-col bg-[linear-gradient(145deg,#fcfbfe_0%,#f6f1fb_55%,#eee5f6_100%)]">

      {/* This route renders without the site nav, so carry a logo home-link. */}
      <header className="px-6 py-5 sm:px-8">
        <Link to="/" aria-label="Achievers Hub home" className="inline-block">
          <Logo tagline="GCSE Maths & Economics" />
        </Link>
      </header>

      {/* Desktop */}
      <div className="hidden flex-1 md:flex">
        <FormPanel initialMode={initialMode} />

        <div className="flex flex-1 flex-col justify-center gap-5 overflow-hidden">
          <div className="px-8 pb-2">
            <h2 className="mb-1 font-display text-2xl font-extrabold text-[var(--color-ink-900)]">
              Trusted by students,<br />parents &amp; tutors
            </h2>
            <p className="text-sm text-[var(--color-ink-500)]">Real results from real people</p>
          </div>
          <ReviewsCarousel />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-1 flex-col md:hidden">
        <FormPanel isMobile initialMode={initialMode} />
        <div className="overflow-hidden py-8">
          <h2 className="mb-1 text-center font-display text-xl font-extrabold text-[var(--color-ink-900)]">What people are saying</h2>
          <p className="mb-5 text-center text-sm text-[var(--color-ink-500)]">Real results from real people</p>
          <ReviewsCarousel />
        </div>
      </div>
    </div>
  );
}
