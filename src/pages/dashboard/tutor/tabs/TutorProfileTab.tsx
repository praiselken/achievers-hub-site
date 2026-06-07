import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useTutor } from '../TutorDashboardLayout';

interface TutorProfile {
  display_name: string;
  email: string;
  bio: string;
  subjects: string[];
  qualifications: string;
  hourly_rate: number | null;
  years_experience: number | null;
  avatar: string;
  availability_notes: string;
}

const AMBER = '#D97706';
const AMBER_FAINT = '#FEF3C7';
const AMBER_LIGHT = '#FDE68A';

const TUTOR_AVATARS = ['🧑‍🏫','👩‍🏫','👨‍🏫','🎓','📐','📊','🦉','⭐','🏆','💡','📚','✏️','🔭','🧪','🧮','🗺️','💼','🎯','🌟','🔬'];

export default function TutorProfileTab() {
  const { tutorId } = useTutor();
  const [profile, setProfile] = useState<TutorProfile>({
    display_name: '', email: '', bio: '', subjects: [], qualifications: '',
    hourly_rate: null, years_experience: null, avatar: '🧑‍🏫', availability_notes: '',
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    async function load() {
      if (!supabase || !tutorId) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      const { data: p } = await supabase.from('profiles').select('*').eq('id', tutorId).single();
      setProfile(prev => ({
        ...prev,
        display_name: p?.display_name ?? '',
        email: user?.email ?? '',
        bio: p?.bio ?? '',
        subjects: p?.subjects ?? [],
        qualifications: p?.qualifications ?? '',
        hourly_rate: p?.hourly_rate ?? null,
        years_experience: p?.years_experience ?? null,
        avatar: p?.avatar ?? '🧑‍🏫',
        availability_notes: p?.availability_notes ?? '',
      }));
      setLoading(false);
    }
    load();
  }, [tutorId]);

  async function save() {
    if (!supabase || !tutorId) return;
    setSaving(true);
    await supabase.from('profiles').update({
      display_name: profile.display_name,
      bio: profile.bio,
      subjects: profile.subjects,
      qualifications: profile.qualifications,
      hourly_rate: profile.hourly_rate,
      years_experience: profile.years_experience,
      avatar: profile.avatar,
      availability_notes: profile.availability_notes,
    }).eq('id', tutorId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleSubject(s: string) {
    setProfile(p => ({
      ...p,
      subjects: p.subjects.includes(s) ? p.subjects.filter(x => x !== s) : [...p.subjects, s],
    }));
  }

  if (loading) return <p className="font-body text-sm text-gray-400 text-center py-8">Loading…</p>;

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Tutor Profile</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5">This is what students and parents see when they find you.</p>
      </div>

      {/* Avatar picker */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <p className="font-body text-sm font-bold text-gray-700 mb-3">Your avatar</p>
        <div className="flex flex-wrap gap-2">
          {TUTOR_AVATARS.map(e => (
            <button key={e} onClick={() => setProfile(p => ({ ...p, avatar: e }))}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
              style={profile.avatar === e
                ? { background: AMBER_FAINT, border: `2px solid ${AMBER}` }
                : { background: '#F9FAFB', border: '2px solid transparent' }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
        <p className="font-body text-sm font-bold text-gray-700">Basic information</p>

        <div className="flex flex-col gap-1">
          <label className="font-body text-xs font-semibold text-gray-500">Display name</label>
          <input value={profile.display_name} onChange={e => setProfile(p => ({ ...p, display_name: e.target.value }))}
            className="font-body text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-300"
            placeholder="Your name" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-body text-xs font-semibold text-gray-500">Email</label>
          <input value={profile.email} disabled
            className="font-body text-sm px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-body text-xs font-semibold text-gray-500">Hourly rate (£)</label>
            <input type="number" value={profile.hourly_rate ?? ''}
              onChange={e => setProfile(p => ({ ...p, hourly_rate: e.target.value ? Number(e.target.value) : null }))}
              className="font-body text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-300"
              placeholder="e.g. 35" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-body text-xs font-semibold text-gray-500">Years experience</label>
            <input type="number" value={profile.years_experience ?? ''}
              onChange={e => setProfile(p => ({ ...p, years_experience: e.target.value ? Number(e.target.value) : null }))}
              className="font-body text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-300"
              placeholder="e.g. 5" />
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col gap-3">
        <p className="font-body text-sm font-bold text-gray-700">Subjects you teach</p>
        <div className="flex gap-3 flex-wrap">
          {['maths', 'economics'].map(s => (
            <button key={s} onClick={() => toggleSubject(s)}
              className="font-body text-sm font-semibold px-4 py-2 rounded-xl capitalize transition-all"
              style={profile.subjects.includes(s)
                ? { background: AMBER_FAINT, color: '#92400E', border: `1.5px solid ${AMBER_LIGHT}` }
                : { background: '#f9fafb', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
              {s === 'maths' ? '📐 Maths' : '📊 Economics'}
            </button>
          ))}
        </div>
      </div>

      {/* Bio + qualifications */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col gap-4">
        <p className="font-body text-sm font-bold text-gray-700">About you</p>

        <div className="flex flex-col gap-1">
          <label className="font-body text-xs font-semibold text-gray-500">Bio (shown to students)</label>
          <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            rows={4}
            className="font-body text-sm px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-amber-300 resize-none"
            placeholder="Tell students about your teaching style, experience, and approach…" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-body text-xs font-semibold text-gray-500">Qualifications</label>
          <input value={profile.qualifications} onChange={e => setProfile(p => ({ ...p, qualifications: e.target.value }))}
            className="font-body text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-300"
            placeholder="e.g. BSc Mathematics, PGCE, QTS" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-body text-xs font-semibold text-gray-500">Availability notes</label>
          <input value={profile.availability_notes} onChange={e => setProfile(p => ({ ...p, availability_notes: e.target.value }))}
            className="font-body text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-300"
            placeholder="e.g. Weekday evenings and weekends" />
        </div>
      </div>

      {/* Save */}
      <button onClick={save} disabled={saving}
        className="font-body font-bold text-sm py-4 rounded-2xl text-white transition-all"
        style={{ background: saved ? '#4A8A14' : AMBER, opacity: saving ? 0.7 : 1 }}>
        {saved ? '✅ Saved!' : saving ? 'Saving…' : 'Save profile'}
      </button>
    </div>
  );
}
