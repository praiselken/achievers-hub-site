const ROLE_OPTIONS = [
  { key: 'student', label: 'Student', emoji: '🎓', sub: 'I want to improve my GCSE grades', bg: '#EAF3DE', color: '#639922' },
  { key: 'parent', label: 'Parent', emoji: '👨‍👩‍👧', sub: 'I want to track my child\'s progress', bg: '#FAEEDA', color: '#BA7517' },
  { key: 'tutor', label: 'Tutor', emoji: '📚', sub: 'I tutor GCSE students', bg: '#EEEDFE', color: '#534AB7' },
];

export default function SignUpPage() {
  return (
    <main className="pt-16 min-h-screen flex items-center justify-center px-5 py-12"
          style={{ background: 'var(--off-white)' }}>
      <div className="bg-white border border-gray-100 rounded-3xl p-8 w-full max-w-md text-center"
           style={{ boxShadow: 'var(--shadow-lg)' }}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-xl text-white"
               style={{ background: 'linear-gradient(135deg, #639922, #1D9E75)' }}>A</div>
          <span className="font-body font-semibold text-lg text-gray-900">
            Achievers<span className="text-green-600">Hub</span>
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl text-gray-900 mb-1">Create your account</h1>
        <p className="font-body text-gray-400 text-sm mb-7">Who are you signing up as?</p>

        <div className="flex flex-col gap-3 mb-6">
          {ROLE_OPTIONS.map(r => (
            <button key={r.key}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 border-gray-100 bg-white cursor-pointer text-left transition-all hover:border-current group w-full"
              style={{ '--hover-color': r.color } as React.CSSProperties}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = r.color; (e.currentTarget as HTMLElement).style.background = r.bg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F1EFE8'; (e.currentTarget as HTMLElement).style.background = 'white'; }}>
              <span className="text-2xl flex-shrink-0">{r.emoji}</span>
              <div className="flex-1">
                <div className="font-body font-bold text-gray-900 text-[15px]">{r.label}</div>
                <div className="font-body text-xs text-gray-400 mt-0.5">{r.sub}</div>
              </div>
              <span className="text-gray-300 group-hover:text-current transition-colors text-lg">→</span>
            </button>
          ))}
        </div>

        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 flex gap-3 text-left mb-5">
          <span className="text-lg flex-shrink-0">🔧</span>
          <p className="font-body text-sm text-green-800 leading-relaxed">
            Full sign-up with Supabase authentication and exam board selection is being built in Stage 3. This is a placeholder screen.
          </p>
        </div>

        <p className="font-body text-sm text-gray-400">
          Already have an account?{' '}
          <span className="text-green-600 font-semibold cursor-pointer hover:underline">Sign in</span>
        </p>
      </div>
    </main>
  );
}
