import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useSubject } from '../DashboardLayout';

type Phase = 'intro' | 'question' | 'feedback' | 'complete';

interface Question {
  id: string;
  question_number: number;
  question: string;
  answer: string;
  marks: number | null;
  topic_title: string | null;
  difficulty: string | null;
  skill_type: string | null;
  solution_steps: string | null;
  hints: string | null;
}

const Q_LABELS = [
  { label: 'At your level',    color: '#EDE0F4', text: '#7A5489' },
  { label: 'At your level',    color: '#EDE0F4', text: '#7A5489' },
  { label: 'At your level',    color: '#EDE0F4', text: '#7A5489' },
  { label: 'Weak topic focus', color: '#FAEEDA', text: '#BA7517' },
  { label: 'Stretch',          color: '#EAF3DE', text: '#4A8A14' },
];

export default function DailyFiveTab() {
  const { subject } = useSubject();
  const [phase, setPhase]           = useState<Phase>('intro');
  const [questions, setQuestions]   = useState<Question[]>([]);
  const [current, setCurrent]       = useState(0);
  const [revealed, setRevealed]     = useState(false);
  const [answers, setAnswers]       = useState<boolean[]>([]);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const today = new Date().toISOString().slice(0, 10);
      const { data: done } = await supabase
        .from('daily_sessions').select('id')
        .eq('user_id', user.id).eq('subject', subject)
        .gte('completed_at', today).limit(1);

      if (done && done.length > 0) { setAlreadyDone(true); setLoading(false); return; }
      setAlreadyDone(false);

      // Load today's questions for this subject
      const now = new Date();
      const month = now.toLocaleString('en-GB', { month: 'long' });
      const day   = now.getDate();

      const { data: qs } = await supabase
        .from('questions').select('*')
        .eq('subject', subject).eq('month', month).eq('day', day)
        .order('question_number');

      setQuestions(qs ?? []);
      setAnswers(new Array(qs?.length ?? 0).fill(null));
      setLoading(false);
    }
    load();
  }, [subject]);

  function resetState() {
    setCurrent(0);
    setRevealed(false);
    setAnswers(new Array(questions.length).fill(null));
    setPhase('question');
  }

  async function finish(finalAnswers: boolean[]) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const score = finalAnswers.filter(Boolean).length;
    await supabase.from('daily_sessions').insert({
      user_id: user.id, subject, score, total: questions.length,
      questions: questions.map((q, i) => ({ id: q.id, correct: finalAnswers[i] })),
    });
    const today = new Date().toISOString().slice(0, 10);
    const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', user.id).single();
    if (!streak) {
      await supabase.from('streaks').insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_active: today });
    } else {
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = streak.last_active === yesterday.toISOString().slice(0, 10);
      const newCurrent = wasYesterday ? streak.current_streak + 1 : 1;
      await supabase.from('streaks').update({
        current_streak: newCurrent,
        longest_streak: Math.max(newCurrent, streak.longest_streak),
        last_active: today,
      }).eq('user_id', user.id);
    }
  }

  function handleSelfMark(correct: boolean) {
    const updated = [...answers];
    updated[current] = correct;
    setAnswers(updated);
    if (current === questions.length - 1) {
      finish(updated);
      setPhase('complete');
    } else {
      setCurrent(c => c + 1);
      setRevealed(false);
      setPhase('question');
    }
  }

  const score = answers.filter(Boolean).length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="font-body text-gray-400">Loading…</p></div>;
  }

  if (alreadyDone) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">Daily 5 complete!</h2>
        <p className="font-body text-gray-500 max-w-sm">You've already completed today's session. Come back tomorrow to keep your streak going.</p>
        <div className="mt-6 text-4xl">🔥</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="text-4xl mb-4">📅</div>
        <h2 className="font-display font-bold text-xl text-gray-900 mb-2">No questions for today</h2>
        <p className="font-body text-sm text-gray-500 max-w-sm">Today's Daily 5 questions haven't been uploaded yet. Check back soon.</p>
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
             style={{ background: 'var(--purple-faint)' }}>⚡</div>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-3">Your Daily 5</h1>
        <p className="font-body text-gray-500 leading-relaxed mb-8 capitalize">
          {subject} · {questions.length} questions · Show the answer and mark yourself honestly.
        </p>
        <div className="flex flex-col gap-2 w-full mb-8">
          {Q_LABELS.slice(0, questions.length).map((q, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                 style={{ background: q.color }}>
              <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-white/60" style={{ color: q.text }}>Q{i + 1}</span>
              <span className="font-body text-sm font-medium" style={{ color: q.text }}>{q.label}</span>
            </div>
          ))}
        </div>
        <button onClick={resetState}
          className="btn-glow-purple text-base px-8 py-3.5" style={{ borderRadius: '14px' }}>
          Let's go →
        </button>
      </div>
    );
  }

  if (phase === 'complete') {
    const pct = Math.round((score / questions.length) * 100);
    const wrongTopics = questions
      .filter((_, i) => !answers[i] && questions[i].topic_title)
      .map(q => q.topic_title!)
      .filter((t, i, a) => a.indexOf(t) === i);

    return (
      <div className="flex flex-col gap-5 max-w-lg mx-auto py-6">
        {/* Score header */}
        <div className="text-center">
          <div className="text-5xl mb-3">{pct >= 80 ? '🌟' : pct >= 60 ? '👏' : '💪'}</div>
          <h1 className="font-display font-bold text-3xl text-gray-900 mb-1">Session complete!</h1>
          <p className="font-body text-gray-500">You scored {score}/{questions.length} today.</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 grid grid-cols-3 gap-4 text-center"
             style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          {[
            { label: 'Score',      value: `${score}/${questions.length}` },
            { label: 'Percentage', value: `${pct}%` },
            { label: 'Streak',     value: '🔥 +1' },
          ].map(s => (
            <div key={s.label}>
              <div className="font-display font-bold text-2xl text-gray-900">{s.value}</div>
              <div className="font-body text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Q-by-Q breakdown */}
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Question breakdown</p>
          <div className="flex flex-col gap-2">
            {questions.map((q, i) => (
              <div key={q.id} className="bg-white rounded-xl px-4 py-3 border text-left"
                   style={{ borderColor: answers[i] ? '#C8E49A' : '#FCA5A5',
                            background: answers[i] ? '#F7FDF2' : '#FFF5F5' }}>
                <div className="flex items-start gap-3">
                  <span className="text-base mt-0.5 flex-shrink-0">{answers[i] ? '✅' : '❌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-xs font-semibold text-gray-700 leading-snug">{q.question}</p>
                    {q.topic_title && (
                      <p className="font-body text-[10px] text-gray-400 mt-0.5">Topic: {q.topic_title}</p>
                    )}
                  </div>
                  <span className="font-mono text-xs font-bold flex-shrink-0" style={{ color: answers[i] ? '#4A8A14' : '#D85A30' }}>
                    Q{i + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div>
          <p className="font-body text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">What to do next</p>
          <div className="flex flex-col gap-2">
            {wrongTopics.length > 0 && (
              <Link to="/dashboard/topics"
                className="bg-white rounded-2xl px-5 py-4 border border-orange-100 no-underline flex items-center gap-4 transition-all hover:border-orange-200"
                style={{ boxShadow: '0 2px 8px rgba(186,117,23,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                     style={{ background: '#FAEEDA' }}>📚</div>
                <div className="flex-1">
                  <p className="font-body font-bold text-sm text-gray-900">Revise the topics you missed</p>
                  <p className="font-body text-xs text-gray-400 mt-0.5">
                    {wrongTopics.slice(0, 2).join(', ')}{wrongTopics.length > 2 ? ` + ${wrongTopics.length - 2} more` : ''}
                  </p>
                </div>
                <span className="text-gray-400 text-sm">→</span>
              </Link>
            )}
            <Link to="/dashboard/topics"
              className="bg-white rounded-2xl px-5 py-4 border border-gray-100 no-underline flex items-center gap-4 transition-all hover:border-gray-200"
              style={{ boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: 'var(--purple-faint)' }}>🗺️</div>
              <div className="flex-1">
                <p className="font-body font-bold text-sm text-gray-900">Go to Topic Hub</p>
                <p className="font-body text-xs text-gray-400 mt-0.5">Browse study cards, videos and practice questions</p>
              </div>
              <span className="text-gray-400 text-sm">→</span>
            </Link>
            <Link to="/dashboard/papers"
              className="bg-white rounded-2xl px-5 py-4 border border-gray-100 no-underline flex items-center gap-4 transition-all hover:border-gray-200"
              style={{ boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: '#EAF3DE' }}>📄</div>
              <div className="flex-1">
                <p className="font-body font-bold text-sm text-gray-900">Try a past paper</p>
                <p className="font-body text-xs text-gray-400 mt-0.5">Put your skills to the test with a full paper</p>
              </div>
              <span className="text-gray-400 text-sm">→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const qMeta = Q_LABELS[current] ?? Q_LABELS[0];

  // Parse solution_steps — split on newlines or "Step N" patterns
  const solutionSteps: string[] = q.solution_steps
    ? q.solution_steps
        .split(/\n|(?=Step \d)/i)
        .map(s => s.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="max-w-xl mx-auto py-2">

      {/* Progress bar + counter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-1.5">
          {questions.map((_, i) => (
            <div key={i} className="flex-1 h-2 rounded-full transition-all"
                 style={{ background: i < current ? '#78B828' : i === current ? 'var(--purple)' : '#e5e7eb' }} />
          ))}
        </div>
        <span className="font-mono text-xs font-bold text-gray-400 flex-shrink-0">
          {current + 1}/{questions.length}
        </span>
      </div>

      {/* Question type badge + topic */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="font-body text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: qMeta.color, color: qMeta.text }}>
          Q{current + 1} · {qMeta.label}
        </span>
        {q.topic_title && (
          <span className="font-body text-xs text-gray-400">{q.topic_title}</span>
        )}
        {q.marks && (
          <span className="ml-auto font-body text-xs font-semibold px-2.5 py-1 rounded-lg"
                style={{ background: '#f3f4f6', color: '#6b7280' }}>
            {q.marks} mark{q.marks !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Question card — styled like an exam paper */}
      <div className="rounded-2xl overflow-hidden mb-5"
           style={{ border: '2px solid var(--purple-light)', boxShadow: '0 4px 20px rgba(153,112,166,0.12)' }}>
        {/* Coloured top bar */}
        <div className="h-1.5" style={{ background: 'linear-gradient(90deg, var(--purple-light), var(--purple))' }} />
        <div className="bg-white px-6 py-5">
          <p className="font-body text-[10px] font-bold uppercase tracking-widest mb-3"
             style={{ color: 'var(--purple)' }}>Question</p>
          <p className="font-body text-base text-gray-900 leading-relaxed">{q.question}</p>
        </div>
        {/* Working space indicator */}
        <div className="px-6 py-3 border-t"
             style={{ background: '#FAFAFE', borderColor: 'var(--purple-faint)' }}>
          <p className="font-body text-xs text-gray-400 italic">Work it out, then reveal the answer below.</p>
        </div>
      </div>

      {/* Hint (before reveal) */}
      {q.hints && !revealed && (
        <details className="mb-4 group">
          <summary className="flex items-center gap-2 font-body text-sm font-semibold cursor-pointer select-none list-none"
                   style={{ color: 'var(--purple)' }}>
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                  style={{ background: 'var(--purple-faint)' }}>💡</span>
            Show hint
          </summary>
          <div className="mt-2 px-4 py-3 rounded-xl"
               style={{ background: 'var(--purple-faint)', border: '1px solid var(--purple-light)' }}>
            <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--purple-dark)' }}>{q.hints}</p>
          </div>
        </details>
      )}

      {/* Reveal / Answer section */}
      {!revealed ? (
        <button onClick={() => setRevealed(true)}
          className="w-full btn-glow-purple py-4 text-sm font-bold"
          style={{ borderRadius: '16px' }}>
          Reveal answer
        </button>
      ) : (
        <>
          {/* Model answer */}
          <div className="rounded-2xl overflow-hidden mb-4"
               style={{ border: '1.5px solid #C8E49A' }}>
            <div className="px-5 py-3 flex items-center gap-2"
                 style={{ background: '#EAF3DE' }}>
              <span className="text-base">✅</span>
              <p className="font-body text-xs font-bold uppercase tracking-wider" style={{ color: '#4A8A14' }}>
                Model answer
              </p>
            </div>
            <div className="bg-white px-5 py-4">
              <p className="font-body text-sm text-gray-800 leading-relaxed">{q.answer}</p>
            </div>
          </div>

          {/* Step-by-step working */}
          {solutionSteps.length > 0 && (
            <div className="rounded-2xl overflow-hidden mb-4"
                 style={{ border: '1.5px solid var(--purple-light)' }}>
              <div className="px-5 py-3 flex items-center gap-2"
                   style={{ background: 'var(--purple-faint)' }}>
                <span className="text-base">📝</span>
                <p className="font-body text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--purple-dark)' }}>
                  Step-by-step working
                </p>
              </div>
              <div className="bg-white px-5 py-4 flex flex-col gap-3">
                {solutionSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                          style={{ background: 'var(--purple)' }}>
                      {i + 1}
                    </span>
                    <p className="font-body text-sm text-gray-700 leading-relaxed">
                      {step.replace(/^step\s*\d+[:\s]*/i, '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Self-mark */}
          <p className="font-body text-sm text-gray-500 text-center mb-3">How did you do?</p>
          <div className="flex gap-3">
            <button onClick={() => handleSelfMark(false)}
              className="flex-1 py-4 rounded-2xl border-2 font-body font-bold text-sm transition-all"
              style={{ borderColor: '#FCA5A5', background: '#FEF2F2', color: '#991B1B' }}>
              ❌ Got it wrong
            </button>
            <button onClick={() => handleSelfMark(true)}
              className="flex-1 py-4 rounded-2xl border-2 font-body font-bold text-sm transition-all"
              style={{ borderColor: '#C8E49A', background: '#EAF3DE', color: '#3B6D11' }}>
              ✅ Got it right
            </button>
          </div>
        </>
      )}
    </div>
  );
}
