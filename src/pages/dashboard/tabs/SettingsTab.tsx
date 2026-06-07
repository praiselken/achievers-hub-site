import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

const STUDENT_AVATARS = ['🎓','📚','✏️','🔭','🧪','🧮','💡','⭐','🏆','🎯','🦁','🐯','🦊','🐺','🦅','🚀','⚡','🌟','🔥','💎'];
const EXAM_BOARDS = ['AQA', 'Edexcel', 'OCR'];
const YEAR_GROUPS = [9, 10, 11];

export default function SettingsTab() {
  const [displayName, setDisplayName] = useState('');
  const [avatar, setAvatar]           = useState('🎓');
  const [subjects, setSubjects]       = useState<string[]>([]);
  const [examBoard, setExamBoard]     = useState('');
  const [yearGroup, setYearGroup]     = useState<number | null>(null);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [loading, setLoading]         = useState(true);

  // Invite code state
  const [inviteCode, setInviteCode]   = useState<string | null>(null);
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeCopied, setCodeCopied]   = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: p } = await supabase.from('profiles')
        .select('display_name, avatar, subjects, exam_board, year_group')
        .eq('id', user.id).single();
      if (p) {
        setDisplayName(p.display_name ?? '');
        setAvatar(p.avatar ?? '🎓');
        setSubjects(p.subjects ?? []);
        setExamBoard(p.exam_board ?? '');
        setYearGroup(p.year_group ?? null);
      }
      // Load existing unused invite code
      const { data: code } = await supabase.from('invite_codes')
        .select('code').eq('student_id', user.id).eq('claimed', false)
        .gte('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false }).limit(1).single();
      if (code) setInviteCode(code.code);
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    if (!supabase) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }
    await supabase.from('profiles').update({
      display_name: displayName,
      avatar,
      subjects,
      exam_board: examBoard || null,
      year_group: yearGroup,
    }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function generateCode() {
    if (!supabase) return;
    setCodeLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCodeLoading(false); return; }
    // Generate a random 6-char uppercase code
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    await supabase.from('invite_codes').insert({
      code, student_id: user.id,
    });
    setInviteCode(code);
    setCodeLoading(false);
  }

  async function copyCode() {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  function toggleSubject(s: string) {
    setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  }

  if (loading) return <p className="font-body text-sm text-gray-400 py-8 text-center">Loading…</p>;

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Settings</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5">Update your profile and account details.</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100"
           style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
        <p className="font-body text-sm font-bold text-gray-700 mb-3">Your avatar</p>
        <div className="flex flex-wrap gap-2">
          {STUDENT_AVATARS.map(e => (
            <button key={e} onClick={() => setAvatar(e)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
              style={avatar === e
                ? { background: 'var(--purple-faint)', border: '2px solid var(--purple)' }
                : { background: '#F9FAFB', border: '2px solid transparent' }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col gap-4"
           style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
        <p className="font-body text-sm font-bold text-gray-700">Your details</p>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-semibold text-gray-500">Display name</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="font-body text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
            style={{ '--tw-ring-color': 'var(--purple-light)' } as React.CSSProperties}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--purple-light)')}
            onBlur={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
            placeholder="Your name" />
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="font-body text-xs font-semibold text-gray-500">Year group</label>
            <div className="flex gap-2">
              {YEAR_GROUPS.map(y => (
                <button key={y} onClick={() => setYearGroup(y)}
                  className="flex-1 py-2 rounded-xl font-body font-semibold text-sm transition-all"
                  style={yearGroup === y
                    ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }
                    : { background: '#F9FAFB', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
                  Yr {y}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-semibold text-gray-500">Exam board</label>
          <div className="flex gap-2">
            {EXAM_BOARDS.map(b => (
              <button key={b} onClick={() => setExamBoard(b)}
                className="flex-1 py-2 rounded-xl font-body font-semibold text-sm transition-all"
                style={examBoard === b
                  ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }
                  : { background: '#F9FAFB', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-semibold text-gray-500">Subjects</label>
          <div className="flex gap-2">
            {(['maths', 'economics'] as const).map(s => (
              <button key={s} onClick={() => toggleSubject(s)}
                className="flex-1 py-2 rounded-xl font-body font-semibold text-sm capitalize transition-all"
                style={subjects.includes(s)
                  ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }
                  : { background: '#F9FAFB', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
                {s === 'maths' ? '📐 Maths' : '📊 Economics'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving}
        className="font-body font-bold text-sm py-4 rounded-2xl text-white transition-all"
        style={{ background: saved ? '#4A8A14' : 'linear-gradient(135deg, var(--purple-light), var(--purple))', opacity: saving ? 0.7 : 1 }}>
        {saved ? '✅ Saved!' : saving ? 'Saving…' : 'Save changes'}
      </button>

      {/* Parent linking — invite code */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100"
           style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
               style={{ background: '#FAEEDA' }}>👨‍👩‍👧</div>
          <div>
            <p className="font-body font-bold text-gray-900 text-sm">Link a parent account</p>
            <p className="font-body text-xs text-gray-400 mt-0.5 leading-relaxed">
              Share this code with your parent so they can track your progress.
            </p>
          </div>
        </div>

        {inviteCode ? (
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center justify-center py-3 rounded-xl font-mono font-bold text-xl tracking-[0.2em]"
                 style={{ background: '#FAEEDA', color: '#7A4D0F', border: '1.5px dashed #F0C88A' }}>
              {inviteCode}
            </div>
            <button onClick={copyCode}
              className="font-body text-sm font-bold px-4 py-3 rounded-xl transition-all whitespace-nowrap"
              style={{ background: codeCopied ? '#EAF3DE' : 'var(--purple-faint)', color: codeCopied ? '#4A8A14' : 'var(--purple-dark)', border: `1.5px solid ${codeCopied ? '#C8E49A' : 'var(--purple-light)'}` }}>
              {codeCopied ? '✅ Copied!' : 'Copy code'}
            </button>
          </div>
        ) : (
          <button onClick={generateCode} disabled={codeLoading}
            className="w-full font-body text-sm font-bold py-3 rounded-xl transition-all"
            style={{ background: '#FAEEDA', color: '#7A4D0F', border: '1.5px solid #F0C88A', opacity: codeLoading ? 0.7 : 1 }}>
            {codeLoading ? 'Generating…' : 'Generate invite code'}
          </button>
        )}
        <p className="font-body text-xs text-gray-400 mt-3 text-center">Code expires after 7 days</p>
      </div>
    </div>
  );
}
