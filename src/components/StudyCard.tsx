import { useState } from 'react';

interface StudyCardProps {
  topic: string;
  subject: string;
  keyPoints: string[];
  examTip: string;
  practiceQ: string;
  answer: string;
  difficulty: 'Foundation' | 'Foundation Plus' | 'Higher' | 'Higher Plus';
}

const DIFF_COLORS: Record<string, { bg: string; text: string }> = {
  'Foundation': { bg: '#EDE0F4', text: '#7A5489' },
  'Foundation Plus': { bg: '#FAEEDA', text: '#BA7517' },
  'Higher': { bg: '#EAF3DE', text: '#3B6D11' },
  'Higher Plus': { bg: '#E1F5EE', text: '#0F6E56' },
};

export default function StudyCard({ topic, subject, keyPoints, examTip, practiceQ, answer, difficulty }: StudyCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const diff = DIFF_COLORS[difficulty] ?? DIFF_COLORS['Foundation'];

  return (
    <div className="flip-card w-full" style={{ height: '420px' }}>
      <div className={`flip-card-inner ${flipped ? 'flipped' : ''}`}>

        {/* ── FRONT: Study content ── */}
        <div className="flip-card-front bg-white border border-gray-100 p-6 flex flex-col"
             style={{ boxShadow: 'var(--shadow-md)' }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{subject}</div>
              <h3 className="font-display font-bold text-xl text-gray-900 leading-tight">{topic}</h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0"
                  style={{ background: diff.bg, color: diff.text }}>
              {difficulty}
            </span>
          </div>

          {/* Key points */}
          <div className="flex-1">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Key concepts</div>
            <ul className="space-y-2">
              {keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                        style={{ background: '#639922' }}>
                    {i + 1}
                  </span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Exam tip */}
          <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: '#E1F5EE' }}>
            <span className="font-bold text-teal-700">💡 Exam tip: </span>
            <span className="text-teal-800">{examTip}</span>
          </div>

          {/* Flip button */}
          <button onClick={() => setFlipped(true)}
            className="mt-4 w-full py-3 rounded-xl font-body font-semibold text-sm text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #639922, #1D9E75)' }}>
            Practice question →
          </button>
        </div>

        {/* ── BACK: Practice question ── */}
        <div className="flip-card-back flex flex-col p-6"
             style={{ background: 'linear-gradient(145deg, #1C1C2E, #3D3D55)', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs font-bold text-white/50 uppercase tracking-wider">Practice Question</div>
            <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: diff.bg, color: diff.text }}>
              {difficulty}
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="bg-white/8 border border-white/10 rounded-2xl p-5 mb-4">
              <p className="font-body text-white text-[15px] leading-relaxed">{practiceQ}</p>
            </div>

            {showAnswer ? (
              <div className="rounded-2xl p-4 text-sm leading-relaxed" style={{ background: '#EAF3DE' }}>
                <div className="font-bold text-green-800 mb-1 text-xs uppercase tracking-wider">Model answer</div>
                <p className="text-green-900">{answer}</p>
              </div>
            ) : (
              <button onClick={() => setShowAnswer(true)}
                className="w-full py-3 rounded-xl font-semibold text-sm border border-white/20 text-white/80 hover:bg-white/10 transition-all">
                Reveal answer
              </button>
            )}
          </div>

          <button onClick={() => { setFlipped(false); setShowAnswer(false); }}
            className="mt-4 w-full py-2.5 rounded-xl font-semibold text-sm text-white/50 hover:text-white transition-all text-center">
            ← Back to study card
          </button>
        </div>
      </div>
    </div>
  );
}
