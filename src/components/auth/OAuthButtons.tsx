import { supabase } from '../../lib/supabase';

/**
 * Third-party sign-in options, shared by the sign-in and sign-up forms.
 *
 * Each provider must also be enabled and configured in the Supabase dashboard
 * (Authentication → Providers). Until that is done the redirect fails and the
 * error is surfaced through `onError` rather than failing silently.
 */

type Provider = 'google' | 'azure' | 'apple';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 23 23" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M12 1h10v10H12z" />
      <path fill="#00A4EF" d="M1 12h10v10H1z" />
      <path fill="#FFB900" d="M12 12h10v10H12z" />
    </svg>
  );
}

function AppleIcon({ light = false }: { light?: boolean }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={light ? '#ffffff' : '#000000'} aria-hidden="true">
      <path d="M17.05 12.53c-.02-2.2 1.8-3.26 1.88-3.31-1.02-1.5-2.62-1.7-3.18-1.72-1.35-.14-2.64.79-3.33.79-.69 0-1.75-.77-2.87-.75-1.48.02-2.84.86-3.6 2.18-1.53 2.66-.39 6.6 1.1 8.76.73 1.06 1.6 2.25 2.74 2.2 1.1-.04 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.08 2.65-2.14.84-1.23 1.18-2.42 1.2-2.48-.03-.01-2.3-.88-2.32-3.5zM14.88 5.9c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.56 1.31-.56.65-1.05 1.69-.92 2.69.97.07 1.97-.49 2.58-1.23z" />
    </svg>
  );
}

const BASE =
  'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border-2 font-semibold text-sm transition-all';

export function OAuthButtons({
  mode,
  onError,
  beforeRedirect,
}: {
  mode: 'signin' | 'signup';
  onError: (message: string) => void;
  /** Runs immediately before the redirect — used to stash the chosen role. */
  beforeRedirect?: () => void;
}) {
  const verb = mode === 'signup' ? 'Sign up with' : 'Continue with';

  async function go(provider: Provider) {
    if (!supabase) { onError('Supabase is not configured yet.'); return; }
    onError('');
    beforeRedirect?.();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth`,
        // Microsoft needs the email scope requested explicitly.
        ...(provider === 'azure' ? { scopes: 'email' } : {}),
      },
    });
    if (error) {
      onError(
        `${labelFor(provider)} sign-in isn't available yet. ${error.message}`,
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={() => go('google')}
        className={`${BASE} border-slate-200 bg-white text-[var(--color-ink-700)] hover:border-slate-300 hover:bg-slate-50`}>
        <GoogleIcon /> {verb} Google
      </button>

      <button type="button" onClick={() => go('azure')}
        className={`${BASE} border-slate-200 bg-white text-[var(--color-ink-700)] hover:border-slate-300 hover:bg-slate-50`}>
        <MicrosoftIcon /> {verb} Microsoft
      </button>

      {/* Apple's guidelines ask for their own black/white treatment. */}
      <button type="button" onClick={() => go('apple')}
        className={`${BASE} border-black bg-black text-white hover:bg-[#1a1a1a]`}>
        <AppleIcon light /> {verb} Apple
      </button>
    </div>
  );
}

function labelFor(provider: Provider) {
  return provider === 'azure' ? 'Microsoft' : provider === 'apple' ? 'Apple' : 'Google';
}
