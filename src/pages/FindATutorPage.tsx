import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Tutor {
  id: string;
  display_name: string;
  avatar: string;
  bio: string | null;
  subjects: string[];
  qualifications: string | null;
  hourly_rate: number | null;
  years_experience: number | null;
  availability_notes: string | null;
}

type SubjectFilter = 'all' | 'maths' | 'economics';

export default function FindATutorPage() {
  const [tutors, setTutors]       = useState<Tutor[]>([]);
  const [loading, setLoading]     = useState(true);
  const [subject, setSubject]     = useState<SubjectFilter>('all');
  const [search, setSearch]       = useState('');

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar, bio, subjects, qualifications, hourly_rate, years_experience, availability_notes')
        .eq('role', 'tutor')
        .eq('onboarded', true)
        .order('display_name');
      setTutors(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = tutors.filter(t => {
    const matchSubject = subject === 'all' || (t.subjects ?? []).includes(subject);
    const matchSearch  = !search ||
      (t.display_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.bio ?? '').toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="min-h-screen pt-20" style={{ background: '#FAFAFA' }}>

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm font-semibold mb-6"
             style={{ background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1px solid var(--purple-light)' }}>
          🏫 Verified tutors on Achievers' Hub
        </div>
        <h1 className="font-display font-bold text-4xl md:text-5xl text-gray-900 mb-4 leading-tight">
          Find your perfect<br />GCSE tutor
        </h1>
        <p className="font-body text-lg text-gray-500 max-w-xl mx-auto">
          All tutors on Achievers' Hub are verified and specialise in GCSE Maths and Economics. Book a session directly through the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-5xl mx-auto px-6 pb-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Subject filter */}
        <div className="flex gap-2">
          {(['all', 'maths', 'economics'] as SubjectFilter[]).map(s => (
            <button key={s} onClick={() => setSubject(s)}
              className="font-body text-sm font-semibold px-4 py-2 rounded-xl capitalize transition-all"
              style={subject === s
                ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)', border: '1.5px solid var(--purple-light)' }
                : { background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
              {s === 'all' ? 'All subjects' : s === 'maths' ? '📐 Maths' : '📊 Economics'}
            </button>
          ))}
        </div>
        {/* Search */}
        <input type="text" placeholder="Search by name or keyword…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="font-body text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-purple-300 sm:ml-auto"
          style={{ minWidth: 220 }} />
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-gray-400">Loading tutors…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-display font-semibold text-xl text-gray-700 mb-2">No tutors found</p>
            <p className="font-body text-sm text-gray-400">
              {tutors.length === 0
                ? 'Tutors are being verified — check back soon.'
                : 'Try a different subject or search term.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map(t => (
              <TutorCard key={t.id} tutor={t} />
            ))}
          </div>
        )}

        {/* Empty state CTA for tutors */}
        {!loading && (
          <div className="mt-12 rounded-2xl p-8 text-center"
               style={{ background: 'linear-gradient(135deg, var(--purple-faint) 0%, #EDE0F4 100%)', border: '1px solid var(--purple-light)' }}>
            <p className="text-3xl mb-3">🏫</p>
            <h3 className="font-display font-bold text-xl mb-2" style={{ color: 'var(--purple-dark)' }}>
              Are you a tutor?
            </h3>
            <p className="font-body text-sm mb-5" style={{ color: 'var(--purple)' }}>
              Join Achievers' Hub to reach GCSE students, manage sessions, and grow your tutoring business.
            </p>
            <Link to="/login?mode=signup"
              className="btn-glow-purple text-sm no-underline px-6 py-3"
              style={{ borderRadius: '12px' }}>
              Join as a tutor →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function TutorCard({ tutor }: { tutor: Tutor }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col gap-4"
         style={{ boxShadow: '0 2px 16px rgba(28,28,46,0.06)' }}>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
             style={{ background: 'var(--purple-faint)', border: '1.5px solid var(--purple-light)' }}>
          {tutor.avatar || '🧑‍🏫'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-gray-900 text-lg leading-snug">
            {tutor.display_name || 'Tutor'}
          </h3>
          {tutor.qualifications && (
            <p className="font-body text-xs text-gray-400 mt-0.5 truncate">{tutor.qualifications}</p>
          )}
          {/* Subject badges */}
          <div className="flex gap-2 mt-2 flex-wrap">
            {(tutor.subjects ?? []).map(s => (
              <span key={s} className="font-body text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                    style={{ background: 'var(--purple-faint)', color: 'var(--purple-dark)' }}>
                {s === 'maths' ? '📐 Maths' : '📊 Economics'}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      {tutor.bio && (
        <p className="font-body text-sm text-gray-600 leading-relaxed line-clamp-3">{tutor.bio}</p>
      )}

      {/* Stats row */}
      <div className="flex gap-4 flex-wrap">
        {tutor.years_experience != null && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">⭐</span>
            <span className="font-body text-xs text-gray-500">
              {tutor.years_experience} yr{tutor.years_experience !== 1 ? 's' : ''} experience
            </span>
          </div>
        )}
        {tutor.availability_notes && (
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🗓️</span>
            <span className="font-body text-xs text-gray-500">{tutor.availability_notes}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <div>
          {tutor.hourly_rate != null ? (
            <p className="font-display font-bold text-gray-900">
              £{tutor.hourly_rate}<span className="font-body text-sm font-normal text-gray-400">/hr</span>
            </p>
          ) : (
            <p className="font-body text-sm text-gray-400">Rate on request</p>
          )}
        </div>
        <Link to="/login?mode=signup"
          className="btn-glow-purple text-sm no-underline px-4 py-2"
          style={{ borderRadius: '10px' }}>
          Book a session
        </Link>
      </div>
    </div>
  );
}
