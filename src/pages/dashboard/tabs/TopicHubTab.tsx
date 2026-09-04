import { Workbook } from '../../../components/workbook/Workbook';
import { FileText, GraduationCap, Layers, PenLine } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useSubject } from '../DashboardLayout';
import { awardXp, checkAndAwardAchievements } from '../../../lib/xp';
import { isDemoMode } from '../../../lib/demoMode';
import { DEMO_TOPICS } from '../../../lib/demoData';

/** The client's four statuses (E1). Secure sits above Covered: it is not just
 *  a good score, it is a good score that survived a gap. */
type Status = 'not_started' | 'in_progress' | 'covered' | 'secure';

interface Topic {
  id: string;
  subject: string;
  area: string;
  name: string;
  description: string | null;
  key_points: string[] | null;
  exam_tip: string | null;
  practice_q: string | null;
  practice_a: string | null;
  video_url: string | null;
  command: string | null;
  card_format: string;
  pathway_min: string;
  status: Status;
  score_avg: number;
  attempts: number;
  /** Whether a correct answer survived a gap. Not in topic_progress yet, so it
   *  is optional until attempt-level history exists. */
  spaced_success?: boolean;
}

/** The client asked for these same colours across the Spec Mapper, the topic
 *  list and progress, so they live in one place. */
const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; border: string; dot: string }> = {
  not_started: { label: 'Not started', color: 'var(--color-ink-300)',     bg: '#fbfafc',                   border: 'var(--color-border)',        dot: '#cbd5e1' },
  in_progress: { label: 'In progress', color: '#b45309',                  bg: '#fffbeb',                   border: '#fcd34d',                    dot: '#f59e0b' },
  covered:     { label: 'Covered',     color: 'var(--color-primary-700)', bg: 'var(--color-primary-50)',   border: 'var(--color-primary-200)',   dot: 'var(--color-primary-500)' },
  secure:      { label: 'Secure',      color: 'var(--color-success-600)', bg: 'var(--color-success-50)',   border: 'var(--color-success-300)',   dot: 'var(--color-success-400)' },
};

/**
 * E1's rules, applied to whatever evidence exists. Falls back to the stored
 * status for topics nobody has attempted, so a student's own marking still
 * shows until there is real data to derive from.
 *
 * `spacedSuccess` is the part the current tables cannot answer: it needs
 * attempt-level dates, which `topic_progress` does not keep. `hasSpacedSuccess`
 * in src/lib/daily5 already implements the check for when they exist.
 */
function deriveStatus(attempts: number, scoreAvg: number, spacedSuccess: boolean, stored: Status): Status {
  if (attempts === 0) return stored === 'not_started' ? 'not_started' : stored;
  if (attempts < 5) return 'in_progress';
  if (scoreAvg >= 80 && spacedSuccess) return 'secure';
  if (scoreAvg >= 60) return 'covered';
  return 'in_progress';
}

/** The four things a student can do with a topic, in the order the client set
 *  out: learn it, review it, practise it, test it. */
const TOPIC_ACTIONS = [
  { key: 'lesson',   label: 'Mini Lesson',     Icon: GraduationCap, purpose: 'Learn it'    },
  { key: 'card',     label: 'Knowledge Card',  Icon: Layers,        purpose: 'Review it'   },
  { key: 'practice', label: 'Practice',        Icon: PenLine,       purpose: 'Practise it' },
  { key: 'exam',     label: 'Exam Questions',  Icon: FileText,      purpose: 'Test it'     },
] as const;

type ActionKey = (typeof TOPIC_ACTIONS)[number]['key'];

/** Mini lessons and exam-question sets are not built yet. Shown but not
 *  pretending to work, rather than opening onto nothing. */
const AVAILABLE_ACTIONS: ActionKey[] = ['card', 'practice'];

function PracticeQuestion({ q, a, storageKey, topicTitle }: { q: string; a: string; storageKey: string; topicTitle: string }) {
  const [show, setShow] = useState(false);
  const [workbookOpen, setWorkbookOpen] = useState(false);
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50">
        <p className="text-xs font-bold text-[var(--color-ink-500)] uppercase tracking-wider mb-1">Practice question</p>
        <p className="text-sm text-[var(--color-ink-700)]">{q}</p>
      </div>
      <button onClick={() => setWorkbookOpen(true)}
        className="w-full px-4 py-2.5 text-sm font-semibold text-left border-t border-slate-200 hover:bg-slate-50 transition-colors"
        style={{ color: 'var(--color-primary-500)' }}>
        ✏️ Open workbook — ruler, protractor & compass
      </button>
      <Workbook
        open={workbookOpen}
        onClose={() => setWorkbookOpen(false)}
        storageKey={storageKey}
        title={`Practice — ${topicTitle}`}
        height={440}
      />
      {show ? (
        <div className="px-4 py-3" style={{ background: 'var(--color-success-50)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-success-600)' }}>Model answer</p>
          <p className="text-sm" style={{ color: 'var(--color-success-600)' }}>{a}</p>
        </div>
      ) : (
        <button onClick={() => setShow(true)}
          className="w-full px-4 py-2.5 text-sm font-semibold text-left hover:bg-slate-50 transition-colors"
          style={{ color: 'var(--color-primary-500)' }}>
          Show model answer →
        </button>
      )}
    </div>
  );
}

function StudyCard({ topic, onMark }: { topic: Topic; onMark: (id: string, s: Status) => void }) {
  // Which resource is showing, if any. Opening a second one swaps to it;
  // pressing the same icon again closes the row.
  const [section, setSection] = useState<ActionKey | null>(null);
  const open = section !== null;
  const cfg = STATUS_CONFIG[topic.status];

  return (
    <div className="bg-white rounded-2xl border overflow-hidden transition-all"
         style={{ boxShadow: 'var(--shadow-soft)', borderColor: 'var(--color-border)', borderLeft: `4px solid ${cfg.dot}` }}>

      {/* Topic row — name on the left, the four resources on the right, so a
          student can see every topic and reach any of them without leaving. */}
      <div className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[var(--color-ink-900)] text-sm">{topic.name}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              {cfg.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-ink-300)]">{topic.area}</span>
            {topic.command && (
              <>
                <span className="text-gray-200">·</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--color-primary-500)' }}>{topic.command}</span>
              </>
            )}
            {topic.attempts > 0 && (
              <>
                <span className="text-gray-200">·</span>
                <span className="font-mono text-xs font-bold text-[var(--color-ink-300)]">{Math.round(topic.score_avg)}%</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {TOPIC_ACTIONS.map(({ key, label, Icon, purpose }) => {
            const ready = AVAILABLE_ACTIONS.includes(key);
            const active = section === key;
            return (
              <button
                key={key}
                type="button"
                disabled={!ready}
                aria-pressed={active}
                title={ready ? `${label} — ${purpose}` : `${label} — not built yet`}
                onClick={() => setSection(active ? null : key)}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:cursor-not-allowed"
                style={active
                  ? { background: 'var(--color-primary-600)', color: 'white' }
                  : ready
                    ? { background: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }
                    : { background: '#f8fafc', color: '#cbd5e1' }}
              >
                <Icon size={16} />
                <span className="sr-only">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The resource the student asked for */}
      {open && (
        <div className="border-t border-slate-100">

          {/* Description / rule */}
          {section === 'card' && topic.description && (
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-300)] mb-1.5">
                {topic.card_format === 'definition' ? 'Definition' : 'The rule'}
              </p>
              <p className="text-sm text-[var(--color-ink-700)] leading-relaxed">{topic.description}</p>
            </div>
          )}

          {/* Key points / steps */}
          {section === 'card' && topic.key_points && topic.key_points.length > 0 && (
            <div className="px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-300)] mb-2">
                {topic.card_format === 'worked_example' ? 'How to do it' : 'Key points'}
              </p>
              <ol className="flex flex-col gap-2">
                {topic.key_points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5"
                          style={{ background: 'var(--color-primary-500)' }}>{i + 1}</span>
                    <span className="text-sm text-[var(--color-ink-700)]">{pt}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Exam tip */}
          {section === 'card' && topic.exam_tip && (
            <div className="mx-5 my-3 rounded-xl px-4 py-3"
                 style={{ background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">💡</span>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-primary-500)' }}>
                  Exam tip
                </p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-primary-700)' }}>{topic.exam_tip}</p>
            </div>
          )}

          {/* Practice question */}
          {section === 'practice' && topic.practice_q && (
            <div className="px-5 py-3">
              <PracticeQuestion q={topic.practice_q} a={topic.practice_a ?? ''} storageKey={`practice:${topic.id}`} topicTitle={topic.name} />
            </div>
          )}

          {/* Video */}
          {section === 'card' && topic.video_url && (
            <div className="px-5 pb-4">
              <a href={topic.video_url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 text-sm font-semibold no-underline"
                 style={{ color: 'var(--color-primary-500)' }}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--color-primary-50)' }}>
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5" style={{ color: 'var(--color-primary-500)' }}>
                    <path d="M4 3.5l9 4.5-9 4.5V3.5z"/>
                  </svg>
                </span>
                Watch video explanation
              </a>
            </div>
          )}

          {section === 'practice' && !topic.practice_q && (
            <p className="px-5 py-6 text-sm text-[var(--color-ink-300)]">
              No practice question has been written for this topic yet.
            </p>
          )}
          {section === 'card' && !topic.description && !topic.key_points?.length && (
            <p className="px-5 py-6 text-sm text-[var(--color-ink-300)]">
              No knowledge card has been written for this topic yet.
            </p>
          )}

          {/* Mark as */}
          <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--color-ink-300)]">Mark as:</span>
            {(['not_started', 'in_progress', 'covered'] as Status[]).map(s => (
              <button key={s} onClick={() => onMark(topic.id, s)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all border"
                style={topic.status === s
                  ? { background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color, borderColor: STATUS_CONFIG[s].border }
                  : { borderColor: 'var(--color-border)', color: 'var(--color-ink-300)', background: 'transparent' }}>
                {STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopicHubTab() {
  const { subject } = useSubject();
  const [search, setSearch]   = useState('');
  const [topics, setTopics]   = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<Status | 'all'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (isDemoMode()) {
        setTopics(DEMO_TOPICS.filter(t => t.subject === subject));
        setLoading(false);
        return;
      }
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [topicsRes, progressRes] = await Promise.all([
        supabase.from('topics').select('*').eq('subject', subject).order('area').order('name'),
        supabase.from('topic_progress').select('*').eq('user_id', user.id),
      ]);

      const progMap: Record<string, { status: Status; score_avg: number; attempts: number }> = {};
      for (const p of progressRes.data ?? []) {
        progMap[p.topic_id] = { status: p.status, score_avg: p.score_avg, attempts: p.attempts };
      }

      setTopics((topicsRes.data ?? []).map(t => ({
        ...t,
        status:    progMap[t.id]?.status    ?? 'not_started',
        score_avg: progMap[t.id]?.score_avg ?? 0,
        attempts:  progMap[t.id]?.attempts  ?? 0,
      })));
      setLoading(false);
    }
    load();
  }, [subject]);

  async function handleMark(topicId: string, status: Status) {
    if (isDemoMode()) { setTopics(prev => prev.map(t => t.id === topicId ? { ...t, status } : t)); return; }
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('topic_progress')
      .upsert({ user_id: user.id, topic_id: topicId, status }, { onConflict: 'user_id,topic_id' });
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, status } : t));

    if (status === 'covered') {
      await awardXp(user.id, 'topic_covered', topicId, 15);
      await checkAndAwardAchievements(user.id);
    }
  }

  // E1's statuses are earned, not chosen, so they are worked out from the
  // evidence before anything is filtered or counted.
  const resolved = topics.map(t => ({
    ...t,
    status: deriveStatus(t.attempts, t.score_avg, t.spaced_success ?? false, t.status),
  }));

  const filtered = resolved.filter(t => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.area.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || t.status === filter;
    return matchSearch && matchFilter;
  });

  const covered = resolved.filter(t => t.status === 'covered' || t.status === 'secure').length;
  const areas = [...new Set(filtered.map(t => t.area))];

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-[var(--color-ink-900)]">Topic Hub</h1>
        <p className="text-sm text-[var(--color-ink-500)] mt-0.5 capitalize">
          {subject} · {covered}/{topics.length} topics covered
        </p>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center gap-4"
           style={{ boxShadow: 'var(--shadow-soft)' }}>
        <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full transition-all"
               style={{ width: `${topics.length ? (covered / topics.length) * 100 : 0}%`,
                        background: 'linear-gradient(90deg, var(--color-primary-200), var(--color-primary-500))' }} />
        </div>
        <span className="text-sm font-bold flex-shrink-0" style={{ color: 'var(--color-primary-700)' }}>
          {topics.length ? Math.round((covered / topics.length) * 100) : 0}%
        </span>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
               className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-300)]">
            <circle cx="9" cy="9" r="6"/><path d="M15 15l-3-3"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search topics…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white outline-none"
            onFocus={e => e.currentTarget.style.borderColor = 'var(--color-primary-500)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--color-border)'} />
        </div>
        {/* Five filters do not fit a phone, so the row scrolls rather than
            putting Secure out of reach. */}
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1 pb-1">
          {(['all', 'not_started', 'in_progress', 'covered', 'secure'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition-all capitalize whitespace-nowrap"
              style={filter === f
                ? { background: 'var(--color-primary-50)', color: 'var(--color-primary-700)', border: '1.5px solid var(--color-primary-200)' }
                : { background: 'white', color: 'var(--color-ink-300)', border: '1.5px solid var(--color-border)' }}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Topics by area */}
      {loading ? (
        <p className="text-sm text-[var(--color-ink-300)] text-center py-12">Loading topics…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-sm text-[var(--color-ink-500)]">No topics match your search.</p>
        </div>
      ) : (
        areas.map(area => {
          const areaTopics = filtered.filter(t => t.area === area);
          if (!areaTopics.length) return null;
          const areaCovered = areaTopics.filter(t => t.status === 'covered' || t.status === 'secure').length;
          return (
            <div key={area}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-sm text-[var(--color-ink-500)] uppercase tracking-wider">{area}</h2>
                <span className="text-xs text-[var(--color-ink-300)]">{areaCovered}/{areaTopics.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {areaTopics.map(t => (
                  <StudyCard key={t.id} topic={t} onMark={handleMark} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
