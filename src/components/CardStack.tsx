import { useState, useEffect, useCallback } from 'react';
import FlashCard from './FlashCard';
import { STUDY_CARDS } from '../constants/cardData';

const CYCLE_MS = 4500;

const STACK_STYLES = [
  // Front card
  { rotate: '0deg', translateX: '0px', translateY: '0px', scale: 1, zIndex: 30, opacity: 1 },
  // Middle card
  { rotate: '-3deg', translateX: '-12px', translateY: '10px', scale: 0.96, zIndex: 20, opacity: 0.9 },
  // Back card
  { rotate: '4deg', translateX: '14px', translateY: '18px', scale: 0.92, zIndex: 10, opacity: 0.75 },
];

export default function CardStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatingOut, setAnimatingOut] = useState(false);

  const advance = useCallback(() => {
    setAnimatingOut(true);
    setTimeout(() => {
      setActiveIndex((i) => (i + 1) % STUDY_CARDS.length);
      setAnimatingOut(false);
    }, 350);
  }, []);

  useEffect(() => {
    const t = setInterval(advance, CYCLE_MS);
    return () => clearInterval(t);
  }, [advance]);

  // Show 3 consecutive cards starting from activeIndex
  const visibleCards = [0, 1, 2].map((offset) =>
    STUDY_CARDS[(activeIndex + offset) % STUDY_CARDS.length]
  );

  return (
    <div className="relative w-full" style={{ paddingBottom: '24px', paddingRight: '16px' }}>
      {/* Stack — render back-to-front so front is on top */}
      {[2, 1, 0].map((stackPos) => {
        const style = STACK_STYLES[stackPos];
        const isExiting = stackPos === 0 && animatingOut;
        return (
          <div
            key={`${activeIndex}-${stackPos}`}
            className="absolute inset-0"
            style={{
              transform: `rotate(${style.rotate}) translate(${style.translateX}, ${style.translateY}) scale(${style.scale})`,
              zIndex: style.zIndex,
              opacity: isExiting ? 0 : style.opacity,
              transition: isExiting
                ? 'opacity 0.3s ease, transform 0.35s ease'
                : 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
              transformOrigin: 'bottom center',
            }}
          >
            <FlashCard card={visibleCards[stackPos]} compact />
          </div>
        );
      })}

      {/* Invisible spacer card so the container has the right height */}
      <div style={{ visibility: 'hidden', pointerEvents: 'none' }}>
        <FlashCard card={visibleCards[0]} compact />
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4 relative z-40">
        {STUDY_CARDS.slice(0, 6).map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Card ${i + 1}`}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === activeIndex % 6 ? '#6F3C78' : '#D8B8E0',
              transform: i === activeIndex % 6 ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
