import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// ── Avatar options by role ────────────────────────────────────────────────────

const STUDENT_AVATARS = [
  '🎓','🦁','🐯','🦊','🐺','🐻','🦝','🐸','🐙','🦋',
  '🦄','🐉','⚡','🔥','🌟','🏆','🎯','🚀','💎','🎸',
];

const PARENT_AVATARS = [
  '👩','👨','👩‍💼','👨‍💼','🌸','🌿','☀️','🌙','💫','🦋',
  '🌺','🍀','🎯','💪','❤️','🏡','🌈','✨','🦚','🌻',
];

const TUTOR_AVATARS = [
  '👩‍🏫','👨‍🏫','📚','🎓','🧑‍💻','🦉','💡','🔬','📐','🏅',
  '🌍','🎯','⭐','🧠','📖','✏️','🔭','🎖️','💼','🌟',
];

const EXAM_BOARDS = ['AQA', 'Edexcel', 'OCR'];
const YEAR_GROUPS = [9, 10, 11];

// ── Step types ────────────────────────────────────────────────────────────────

type Role = 'student' | 'parent' | 'tutor';

interface Profile {
  role: Role;
  display_name: string;
  avatar: string;
  year_group: number | null;
  exam_board: string | null;
  subjects: string[];
}

// ── Small components ──────────────────────────────────────────────────────────

function StepHeader({ step, total, title, sub }: { step: number; total: number; title: string; sub: string }) {
  return (
    <div className="mb-8">
      {/* Progress dots */}
      <div className="flex items-center gap-2 mb-6">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all"
               style={{ background: i < step ? 'var(--purple)' : i === step - 1 ? 'var(--purple)' : '#e5e7eb' }} />
        ))}
      </div>
      <h2 className="font-display font-bold text-2xl text-gray-900 mb-1">{title}</h2>
      <p className="font-body text-sm text-gray-500">{sub}</p>
    </div>
  );
}

function AvatarGrid({ options, selected, onSelect }: {
  options: string[];
  selected: string;
  onSelect: (a: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-3">
      {options.map(a => (
        <button key={a} onClick={() => onSelect(a)}
          className="w-full aspect-square rounded-2xl text-3xl flex items-center justify-center transition-all"
          style={selected === a
            ? { background: 'var(--purple-faint)', border: '2.5px solid var(--purple)', boxShadow: '0 0 0 4px rgba(153,112,166,0.15)' }
            : { background: '#f9fafb', border: '2px solid #f3f4f6' }}>
          {a}
        </button>
      ))}
    </div>
  );
}

// ── Steps ─────────────────────────────────────────────────────────────────────

function NameStep({ profile, onChange, onNext }: {
  profile: Profile;
  onChange: (p: Partial<Profile>) => void;
  onNext: () => void;
}) {
  return (
    <div>
      <StepHeader step={1} total={4} title="What's your name?" sub="This is how we'll greet you every time you log in." />

      <div className="mb-6">
        <label className="font-body text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
          First name
        </label>
        <input
          type="text"
          value={profile.display_name}
          onChange={e => onChange({ display_name: e.target.value })}
          placeholder="e.g. Pelumi"
          className="w-full px-5 py-4 rounded-2xl border font-body text-base text-gray-900 outline-none transition-all"
          style={{ borderColor: profile.display_name ? 'var(--purple)' : '#e5e7eb', background: '#fafafa' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--purple)'}
          onBlur={e => { if (!profile.display_name) e.currentTarget.style.borderColor = '#e5e7eb'; }}
          autoFocus
        />
      </div>

      <button
        onClick={onNext}
        disabled={!profile.display_name.trim()}
        className="w-full py-4 rounded-2xl font-body font-bold text-sm text-white transition-all disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))' }}>
        Continue →
      </button>
    </div>
  );
}

function AvatarStep({ profile, onChange, onNext, onBack }: {
  profile: Profile;
  onChange: (p: Partial<Profile>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const avatars = profile.role === 'parent' ? PARENT_AVATARS
    : profile.role === 'tutor' ? TUTOR_AVATARS
    : STUDENT_AVATARS;

  return (
    <div>
      <StepHeader step={2} total={4}
        title={`Pick your avatar, ${profile.display_name}`}
        sub="This will show on your profile and dashboard." />

      {/* Preview */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-5xl"
             style={{ background: 'var(--purple-faint)', border: '2px solid var(--purple-light)' }}>
          {profile.avatar}
        </div>
      </div>

      <AvatarGrid options={avatars} selected={profile.avatar} onSelect={a => onChange({ avatar: a })} />

      <div className="flex gap-3 mt-8">
        <button onClick={onBack}
          className="px-5 py-3.5 rounded-2xl font-body font-semibold text-sm border border-gray-200 text-gray-600 transition-all hover:border-gray-300">
          ← Back
        </button>
        <button onClick={onNext}
          className="flex-1 py-3.5 rounded-2xl font-body font-bold text-sm text-white transition-all"
          style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))' }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

function SubjectsStep({ profile, onChange, onNext, onBack }: {
  profile: Profile;
  onChange: (p: Partial<Profile>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isStudent = profile.role === 'student';

  function toggleSubject(s: string) {
    const current = profile.subjects;
    onChange({
      subjects: current.includes(s) ? current.filter(x => x !== s) : [...current, s],
    });
  }

  return (
    <div>
      <StepHeader step={3} total={4}
        title={isStudent ? 'What are you studying?' : 'Which subjects do you cover?'}
        sub={isStudent ? 'Select all subjects you take.' : 'Select all subjects you tutor.'} />

      <div className="flex flex-col gap-3 mb-6">
        {[
          { key: 'maths',     emoji: '📐', label: 'GCSE Maths',     sub: 'Number, Algebra, Geometry, Statistics' },
          { key: 'economics', emoji: '📊', label: 'GCSE Economics',  sub: 'Microeconomics, Macroeconomics, Quantitative' },
        ].map(s => {
          const selected = profile.subjects.includes(s.key);
          return (
            <button key={s.key} onClick={() => toggleSubject(s.key)}
              className="flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all"
              style={selected
                ? { borderColor: 'var(--purple)', background: 'var(--purple-faint)' }
                : { borderColor: '#e5e7eb', background: 'white' }}>
              <span className="text-3xl">{s.emoji}</span>
              <div className="flex-1">
                <p className="font-body font-bold text-sm text-gray-900">{s.label}</p>
                <p className="font-body text-xs text-gray-400 mt-0.5">{s.sub}</p>
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                   style={{ borderColor: selected ? 'var(--purple)' : '#d1d5db', background: selected ? 'var(--purple)' : 'white' }}>
                {selected && <svg viewBox="0 0 10 10" className="w-3 h-3" fill="white"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Exam board — students only */}
      {isStudent && (
        <div className="mb-6">
          <label className="font-body text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Exam board
          </label>
          <div className="flex gap-2">
            {EXAM_BOARDS.map(b => (
              <button key={b} onClick={() => onChange({ exam_board: b })}
                className="flex-1 py-3 rounded-xl font-body font-bold text-sm transition-all"
                style={profile.exam_board === b
                  ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '2px solid var(--purple)' }
                  : { background: 'white', color: '#6b7280', border: '2px solid #e5e7eb' }}>
                {b}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Year group — students only */}
      {isStudent && (
        <div className="mb-6">
          <label className="font-body text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
            Year group
          </label>
          <div className="flex gap-2">
            {YEAR_GROUPS.map(y => (
              <button key={y} onClick={() => onChange({ year_group: y })}
                className="flex-1 py-3 rounded-xl font-body font-bold text-sm transition-all"
                style={profile.year_group === y
                  ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '2px solid var(--purple)' }
                  : { background: 'white', color: '#6b7280', border: '2px solid #e5e7eb' }}>
                Year {y}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-5 py-3.5 rounded-2xl font-body font-semibold text-sm border border-gray-200 text-gray-600">
          ← Back
        </button>
        <button onClick={onNext}
          disabled={profile.subjects.length === 0 || (isStudent && (!profile.exam_board || !profile.year_group))}
          className="flex-1 py-3.5 rounded-2xl font-body font-bold text-sm text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))' }}>
          Continue →
        </button>
      </div>
    </div>
  );
}

function ConfirmStep({ profile, onFinish, onBack, saving }: {
  profile: Profile;
  onFinish: () => void;
  onBack: () => void;
  saving: boolean;
}) {
  return (
    <div>
      <StepHeader step={4} total={4} title="You're all set!" sub="Here's a summary of your profile." />

      {/* Profile preview card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 mb-6"
           style={{ boxShadow: '0 4px 24px rgba(28,28,46,0.08)' }}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
               style={{ background: 'var(--purple-faint)', border: '2px solid var(--purple-light)' }}>
            {profile.avatar}
          </div>
          <div>
            <p className="font-display font-bold text-xl text-gray-900">{profile.display_name}</p>
            <p className="font-body text-sm text-gray-500 capitalize">{profile.role}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {profile.subjects.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-body text-xs text-gray-400 w-24">Subjects</span>
              <div className="flex gap-1.5 flex-wrap">
                {profile.subjects.map(s => (
                  <span key={s} className="font-body text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                        style={{ background: 'var(--purple-faint)', color: 'var(--purple-dark)' }}>
                    {s === 'maths' ? '📐 Maths' : '📊 Economics'}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.exam_board && (
            <div className="flex items-center gap-2">
              <span className="font-body text-xs text-gray-400 w-24">Exam board</span>
              <span className="font-body text-xs font-semibold text-gray-700">{profile.exam_board}</span>
            </div>
          )}
          {profile.year_group && (
            <div className="flex items-center gap-2">
              <span className="font-body text-xs text-gray-400 w-24">Year group</span>
              <span className="font-body text-xs font-semibold text-gray-700">Year {profile.year_group}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-5 py-3.5 rounded-2xl font-body font-semibold text-sm border border-gray-200 text-gray-600">
          ← Back
        </button>
        <button onClick={onFinish} disabled={saving}
          className="flex-1 py-3.5 rounded-2xl font-body font-bold text-sm text-white transition-all disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-dark))', boxShadow: 'var(--shadow-glow-purple)' }}>
          {saving ? 'Setting up your dashboard…' : `Let's go, ${profile.display_name} →`}
        </button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

const DASHBOARD_BY_ROLE: Record<Role, string> = {
  student: '/dashboard',
  parent:  '/parent-dashboard',
  tutor:   '/dashboard', // tutor dashboard coming soon — fall back for now
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    role: 'student',
    display_name: '',
    avatar: '🎓',
    year_group: null,
    exam_board: null,
    subjects: [],
  });

  // Read role from localStorage (set during signup role picker)
  useState(() => {
    const role = (localStorage.getItem('signup_role') as Role) ?? 'student';
    const avatarDefault = role === 'parent' ? '👩' : role === 'tutor' ? '👩‍🏫' : '🎓';
    setProfile(p => ({ ...p, role, avatar: avatarDefault }));
  });

  function update(partial: Partial<Profile>) {
    setProfile(p => ({ ...p, ...partial }));
  }

  async function finish() {
    if (!supabase) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from('profiles').upsert({
      id:           user.id,
      role:         profile.role,
      display_name: profile.display_name.trim(),
      avatar:       profile.avatar,
      year_group:   profile.year_group,
      exam_board:   profile.exam_board,
      subjects:     profile.subjects,
      onboarded:    true,
    });

    localStorage.removeItem('signup_role');
    navigate(DASHBOARD_BY_ROLE[profile.role]);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12"
         style={{ background: 'linear-gradient(135deg, #F8F5FD 0%, #EDE0F4 50%, #F8F5FD 100%)' }}>

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse 60% 50% at 20% 20%, #D8B8E0 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, #C8E49A 0%, transparent 60%)' }}
           aria-hidden />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-10 w-auto object-contain" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl p-8"
             style={{ boxShadow: '0 32px 80px rgba(28,28,46,0.15)' }}>
          {step === 1 && (
            <NameStep profile={profile} onChange={update} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <AvatarStep profile={profile} onChange={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />
          )}
          {step === 3 && (
            <SubjectsStep profile={profile} onChange={update} onNext={() => setStep(4)} onBack={() => setStep(2)} />
          )}
          {step === 4 && (
            <ConfirmStep profile={profile} onFinish={finish} onBack={() => setStep(3)} saving={saving} />
          )}
        </div>

        <p className="text-center font-body text-xs text-gray-400 mt-5">
          You can update all of this later in your profile settings.
        </p>
      </div>
    </div>
  );
}
