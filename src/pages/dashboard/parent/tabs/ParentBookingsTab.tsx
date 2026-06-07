import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';

interface Booking {
  id: string;
  tutor_name: string;
  subject: string;
  session_date: string;
  session_time: string;
  duration_mins: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes: string | null;
  meeting_url: string | null;
}

const STATUS_STYLE: Record<Booking['status'], { bg: string; text: string; border: string; label: string }> = {
  upcoming:  { bg: '#EDE0F4', text: '#7A5489', border: '#C9A8DC', label: 'Upcoming'  },
  completed: { bg: '#EAF3DE', text: '#4A8A14', border: '#C8E49A', label: 'Completed' },
  cancelled: { bg: '#f9fafb', text: '#9ca3af', border: '#e5e7eb', label: 'Cancelled' },
};

function EmptyBookings() {
  return (
    <div className="bg-white rounded-3xl p-8 border border-orange-100 text-center"
         style={{ boxShadow: '0 4px 24px rgba(186,117,23,0.06)' }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
           style={{ background: '#FAEEDA' }}>📅</div>
      <h2 className="font-display font-bold text-xl text-gray-900 mb-2">No sessions booked yet</h2>
      <p className="font-body text-sm text-gray-500 max-w-sm mx-auto mb-6 leading-relaxed">
        When you book tutor sessions through the platform, they'll appear here so you can track upcoming and past sessions.
      </p>
      <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-body text-sm font-semibold"
           style={{ background: '#FAEEDA', color: '#7A4D0F' }}>
        <span>🔍</span> Find a Tutor — coming soon
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const s = STATUS_STYLE[booking.status];
  const date = new Date(`${booking.session_date}T${booking.session_time}`);
  const isUpcoming = booking.status === 'upcoming';

  return (
    <div className="bg-white rounded-2xl p-5 border border-orange-100"
         style={{ boxShadow: '0 2px 8px rgba(186,117,23,0.05)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="font-body font-bold text-gray-900 text-sm">{booking.tutor_name}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}>
              {s.label}
            </span>
          </div>
          <p className="font-body text-xs text-gray-400 capitalize">{booking.subject}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-body text-sm font-semibold text-gray-800">
            {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          <p className="font-body text-xs text-gray-400">
            {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {booking.duration_mins} min
          </p>
        </div>
      </div>

      {booking.notes && (
        <p className="font-body text-xs text-gray-500 mb-3 leading-relaxed">{booking.notes}</p>
      )}

      {isUpcoming && booking.meeting_url && (
        <a href={booking.meeting_url} target="_blank" rel="noopener noreferrer"
           className="inline-flex items-center gap-2 font-body text-xs font-semibold px-4 py-2 rounded-lg no-underline transition-all"
           style={{ background: 'var(--purple-faint)', color: 'var(--purple-dark)' }}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <path d="M2 4h9l3 4-3 4H2z"/><path d="M11 6v4"/>
          </svg>
          Join session
        </a>
      )}
    </div>
  );
}

export default function ParentBookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<'all' | Booking['status']>('all');

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: link } = await supabase
        .from('parent_child_links').select('child_id').eq('parent_id', user.id).limit(1).single();

      const childId = link?.child_id ?? user.id;

      const { data } = await supabase
        .from('tutor_bookings')
        .select('*')
        .eq('student_id', childId)
        .order('session_date', { ascending: false });

      setBookings((data ?? []) as Booking[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const upcoming  = bookings.filter(b => b.status === 'upcoming').length;
  const completed = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Tutor Bookings</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5">View and track your child's tutor sessions.</p>
      </div>

      {/* Stats */}
      {bookings.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-orange-100 text-center">
            <div className="font-display font-bold text-3xl" style={{ color: '#7A5489' }}>{upcoming}</div>
            <div className="font-body text-xs text-gray-500 mt-0.5">Upcoming sessions</div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-orange-100 text-center">
            <div className="font-display font-bold text-3xl" style={{ color: '#4A8A14' }}>{completed}</div>
            <div className="font-body text-xs text-gray-500 mt-0.5">Sessions completed</div>
          </div>
        </div>
      )}

      {/* Filter */}
      {bookings.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl font-body text-xs font-semibold capitalize transition-all"
              style={filter === f
                ? { background: '#FAEEDA', color: '#7A4D0F', border: '1.5px solid #F0C88A' }
                : { background: 'white', color: '#9ca3af', border: '1.5px solid #e5e7eb' }}>
              {f === 'all' ? 'All sessions' : f}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <p className="font-body text-sm text-gray-400 text-center py-12">Loading…</p>
      ) : bookings.length === 0 ? (
        <EmptyBookings />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-body text-sm text-gray-400">No {filter} sessions found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(b => <BookingCard key={b.id} booking={b} />)}
        </div>
      )}

      {/* Upcoming next session highlight */}
      {bookings.length > 0 && upcoming > 0 && (
        <div className="rounded-2xl p-5 flex items-center gap-4"
             style={{ background: '#EDE0F4', border: '1px solid #C9A8DC' }}>
          <span className="text-2xl flex-shrink-0">📅</span>
          <div>
            <p className="font-body font-bold text-sm" style={{ color: '#7A5489' }}>
              {upcoming} upcoming session{upcoming !== 1 ? 's' : ''} booked
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: '#9970A6' }}>
              Your child has tutor sessions scheduled — check above for join links.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
