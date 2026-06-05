import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { SAMPLE_QUESTIONS, type Question } from '../../../constants/sampleQuestions';

type Phase = 'intro' | 'question' | 'feedback' | 'complete';

const Q_LABELS = [
  { label: 'Q1 — At your level',    color: '#EDE0F4', text: '#7A5489' },
  { label: 'Q2 — At your level',    color: '#EDE0F4', text: '#7A5489' },
  { label: 'Q3 — At your level',    color: '#EDE0F4', text: '#7A5489' },
  { label: 'Q4 — Weak topic focus', color: '#FAEEDA', text: '#BA7517' },
  { label: 'Q5 — Stretch',          color: '#EAF3DE', text: '#4A8A14' },
];

function buildSession(): Question[] {
  const level    = SAMPLE_QUESTIONS.filter(q => q.type === 'level').slice(0, 3);
  const weak     = SAMPLE_QUESTIONS.filter(q => q.type === 'weak').slice(0, 1);
  const stretch  = SAMPLE_QUESTIONS.filter(q => q.type === 'stretch').slice(0, 1);
  return [...level, ...weak, ...stretch];
}

export default function DailyFiveTab() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [questions] = useState<Question[]>(buildSession);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null, null]);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function check() {
      if (!supabase) { setChecking(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecking(false); return; }
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from('daily_sessions')
        .select('id')
        .eq('user_id', user.id)
        .gte('completed_at', today)
        .limit(1);
      if (data && data.length > 0) setAlreadyDone(true);
      setChecking(false);
    }
    check();
  }, []);

  async function finish(finalAnswers: (number | null)[]) {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const score = finalAnswers.filter((a, i) => a === questions[i].answer).length;
    await supabase.from('daily_sessions').insert({
      user_id: user.id,
      subject: 'maths',
      score,
      total: 5,
      questions: questions.map((q, i) => ({ id: q.id, selected: finalAnswers[i], correct: q.answer })),
    });
    // update streak
    const today = new Date().toISOString().slice(0, 10);
    const { data: streak } = await supabase.from('streaks').select('*').eq('user_id', user.id).single();
    if (!streak) {
      await supabase.from('streaks').insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_active: today });
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const wasYesterday = streak.last_active === yesterday.toISOString().slice(0, 10);
      const newCurrent = wasYesterday ? streak.current_streak + 1 : 1;
      await supabase.from('streaks').update({
        current_streak: newCurrent,
        longest_streak: Math.max(newCurrent, streak.longest_streak),
        last_active: today,
      }).eq('user_id', user.id);
    }
  }

  function handleAnswer(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    setPhase('feedback');
  }

  function handleNext() {
    const newAnswers = [...answers];
    newAnswers[current] = selected;
    setAnswers(newAnswers);
    if (current === 4) {
      finish(newAnswers);
      setPhase('complete');
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setPhase('question');
    }
  }

  const score = answers.filter((a, i) => a === questions[i]?.answer).length;

  if (checking) {
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

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6"
             style={{ background: 'var(--purple-faint)' }}>⚡</div>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-3">Your Daily 5</h1>
        <p className="font-body text-gray-500 leading-relaxed mb-8">
          5 questions. 15 minutes. Three at your level, one on your weakest topic, one stretch. Every answer improves your pathway.
        </p>
        <div className="flex flex-col gap-2 w-full mb-8">
          {Q_LABELS.map((q, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                 style={{ background: q.color }}>
              <span className="font-mono text-xs font-bold px-2 py-1 rounded-lg bg-white/60" style={{ color: q.text }}>Q{i + 1}</span>
              <span className="font-body text-sm font-medium" style={{ color: q.text }}>{q.label.split('—')[1].trim()}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setPhase('question')}
          className="btn-glow-purple text-base px-8 py-3.5" style={{ borderRadius: '14px' }}>
          Let's go →
        </button>
      </div>
    );
  }

  if (phase === 'complete') {
    const pct = Math.round((score / 5) * 100);
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">{pct >= 80 ? '🌟' : pct >= 60 ? '👏' : '💪'}</div>
        <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Session complete!</h1>
        <p className="font-body text-gray-500 mb-6">You scored {score}/5 today.</p>
        <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 mb-6" style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <div className="flex justify-around">
            {[
              { label: 'Score', value: `${score}/5` },
              { label: 'Percentage', value: `${pct}%` },
              { label: 'Streak', value: '🔥 +1' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-display font-bold text-2xl text-gray-900">{s.value}</div>
                <div className="font-body text-xs text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-3 w-full">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-white rounded-xl px-4 py-3 border text-left flex items-start gap-3"
                 style={{ borderColor: answers[i] === q.answer ? '#C8E49A' : '#FCA5A5' }}>
              <span className="text-sm mt-0.5">{answers[i] === q.answer ? '✅' : '❌'}</span>
              <div>
                <p className="font-body text-xs font-semibold text-gray-700">{q.question}</p>
                <p className="font-body text-xs text-gray-500 mt-0.5">{q.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const q = questions[current];
  const qMeta = Q_LABELS[current];
  const isCorrect = selected === q.answer;

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {[0,1,2,3,4].map(i => (
          <div key={i} className="flex-1 h-1.5 rounded-full transition-all"
               style={{ background: i < current ? '#78B828' : i === current ? 'var(--purple)' : '#e5e7eb' }} />
        ))}
      </div>

      {/* Q label */}
      <span className="inline-block font-mono text-xs font-bold px-3 py-1 rounded-lg mb-4"
            style={{ background: qMeta.color, color: qMeta.text }}>{qMeta.label}</span>

      {/* Question */}
      <h2 className="font-display font-bold text-xl text-gray-900 mb-6 leading-snug">{q.question}</h2>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {q.options.map((opt, i) => {
          let bg = 'white';
          let border = '#e5e7eb';
          let textCol = '#111827';
          if (phase === 'feedback') {
            if (i === q.answer) { bg = '#EAF3DE'; border = '#78B828'; textCol = '#3B6D11'; }
            else if (i === selected) { bg = '#FEF2F2'; border = '#F87171'; textCol = '#991B1B'; }
          }
          return (
            <button key={i}
              onClick={() => handleAnswer(i)}
              disabled={phase === 'feedback'}
              className="w-full text-left px-5 py-4 rounded-2xl border-2 font-body text-sm font-medium transition-all"
              style={{ background: bg, borderColor: border, color: textCol }}>
              <span className="font-mono text-xs font-bold mr-3 opacity-50">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {phase === 'feedback' && (
        <div className="mt-5 rounded-2xl px-5 py-4"
             style={{ background: isCorrect ? '#EAF3DE' : '#FEF2F2', border: `1px solid ${isCorrect ? '#C8E49A' : '#FCA5A5'}` }}>
          <p className="font-body font-semibold text-sm mb-1" style={{ color: isCorrect ? '#3B6D11' : '#991B1B' }}>
            {isCorrect ? '✅ Correct!' : '❌ Not quite.'}
          </p>
          <p className="font-body text-sm" style={{ color: isCorrect ? '#4A8A14' : '#B91C1C' }}>{q.explanation}</p>
        </div>
      )}

      {phase === 'feedback' && (
        <button onClick={handleNext}
          className="mt-5 w-full btn-glow-purple py-3.5 text-sm font-semibold"
          style={{ borderRadius: '14px' }}>
          {current === 4 ? 'See results →' : 'Next question →'}
        </button>
      )}
    </div>
  );
}
