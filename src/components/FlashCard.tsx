import type { CardData } from '../constants/cardData';

const PURPLE = '#6F3C78';
const ORANGE = '#FF9F3F';
const GREEN = '#9DBB3A';
const PURPLE_LIGHT = '#F5EDF7';
const GREEN_LIGHT = '#F3F9E6';

interface Props {
  card: CardData;
  compact?: boolean;
}

function ChecklistIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="2" width="14" height="16" rx="2"/>
      <path d="M7 7h6M7 10h6M7 13h4"/>
      <path d="M5 7l0 .01"/>
    </svg>
  );
}

function CalcIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="2" width="14" height="16" rx="2"/>
      <path d="M6 6h8M6 10h2M10 10h2M14 10h.01M6 13h.01M10 13h.01M14 13h.01M6 16h.01M10 16h.01M14 16h.01"/>
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke={PURPLE} strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M6.5 13h3M7 11h2M8 3a4 4 0 014 4c0 2-1.2 3-1.6 4H5.6C5.2 10 4 9 4 7a4 4 0 014-4z"/>
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke={GREEN} strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <circle cx="8" cy="8" r="6"/>
      <path d="M2 8h12M8 2a9 9 0 010 12M8 2a9 9 0 000 12"/>
    </svg>
  );
}

export default function FlashCard({ card, compact = false }: Props) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden select-none"
      style={{
        border: `2px solid ${PURPLE}`,
        boxShadow: '0 8px 40px rgba(111,60,120,0.18)',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3"
           style={{ background: PURPLE }}>
        <span className="font-bold text-white text-sm tracking-wide truncate pr-4">
          {card.topic}
        </span>
        <span className="text-white/80 text-xs font-semibold whitespace-nowrap flex-shrink-0"
              style={{ fontFamily: 'serif' }}>
          The Achievers<span className="text-white font-bold">Hub</span>
        </span>
      </div>

      {/* Body */}
      <div className={`grid grid-cols-2 ${compact ? 'gap-3 p-4' : 'gap-4 p-5'}`}>

        {/* LEFT — Rule & Steps */}
        <div className="flex flex-col gap-3">
          {/* Command badge + Rule */}
          <div className="rounded-xl p-3" style={{ background: PURPLE_LIGHT }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ background: PURPLE }}>
                <ChecklistIcon />
              </div>
              <span className="font-bold text-sm" style={{ color: PURPLE }}>
                {card.command}
              </span>
            </div>
            <p className={`leading-snug text-gray-700 ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {card.rule}
            </p>
          </div>

          {/* Steps */}
          <div>
            <p className="font-bold text-xs mb-1.5" style={{ color: PURPLE }}>
              How to do it
            </p>
            <ol className={`flex flex-col gap-1.5 ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {card.steps.map((step, i) => (
                <li key={i} className="flex gap-2 leading-snug text-gray-700">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mt-0.5"
                    style={{ background: ORANGE, fontSize: '9px' }}>
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* RIGHT — Worked Example */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl p-3" style={{ background: '#FFF8F0' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ background: ORANGE }}>
                <CalcIcon />
              </div>
              <span className="font-bold text-sm" style={{ color: ORANGE }}>
                Worked example
              </span>
            </div>
            <ol className={`flex flex-col gap-1 ${compact ? 'text-[10px]' : 'text-xs'} text-gray-700 leading-snug`}>
              {card.workedExample.map((line, i) => (
                <li key={i}
                  className={i === 0 ? 'font-semibold text-gray-800' : ''}
                  style={i > 0 && line.includes('→') ? { color: ORANGE } : {}}>
                  {line}
                </li>
              ))}
            </ol>

            {/* Final answer */}
            <div className="mt-3 rounded-lg px-3 py-2 flex items-center gap-2"
                 style={{ background: GREEN_LIGHT, border: `1.5px solid ${GREEN}` }}>
              <svg viewBox="0 0 14 14" fill={GREEN} className="w-3.5 h-3.5 flex-shrink-0">
                <circle cx="7" cy="7" r="7"/>
                <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className={`font-bold ${compact ? 'text-xs' : 'text-sm'}`}
                    style={{ color: GREEN }}>
                {card.finalAnswer}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer — Real-world + Tip */}
      <div className={`grid grid-cols-2 border-t border-gray-100 ${compact ? 'gap-0' : ''}`}>
        <div className="px-4 py-2.5 flex items-start gap-2"
             style={{ background: GREEN_LIGHT }}>
          <GlobeIcon />
          <p className="text-[10px] text-gray-600 leading-snug">
            <span className="font-bold block" style={{ color: GREEN }}>Real world</span>
            {card.realWorld}
          </p>
        </div>
        <div className="px-4 py-2.5 flex items-start gap-2"
             style={{ background: PURPLE_LIGHT }}>
          <LightbulbIcon />
          <p className="text-[10px] text-gray-600 leading-snug">
            <span className="font-bold block" style={{ color: PURPLE }}>Tip</span>
            {card.tip}
          </p>
        </div>
      </div>
    </div>
  );
}
