export type FeatureIllustrationTone = 'daily' | 'topic' | 'past' | 'ai' | 'progress' | 'grow';

const cells: Record<FeatureIllustrationTone, readonly [number, number]> = {
  daily: [0, 0],
  topic: [1, 0],
  past: [2, 0],
  ai: [0, 1],
  progress: [1, 1],
  grow: [2, 1],
};

export function FeatureIllustration({
  feature,
  className = '',
}: {
  feature: FeatureIllustrationTone;
  className?: string;
}) {
  // Archi has one canonical depiction across the app — the book character used
  // in the hero, the sidebar and the avatar. The sprite sheet's AI cell is a
  // different robot entirely, so the AI tile uses the real Archi art instead.
  if (feature === 'ai') {
    return (
      <div className={`relative aspect-square overflow-hidden ${className}`} aria-hidden="true">
        <img
          src="/images/archie-book-avatar-v3.png"
          alt=""
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  const [column, row] = cells[feature];

  return (
    <div className={`relative aspect-square overflow-hidden ${className}`} aria-hidden="true">
      <img
        src="/images/feature-illustrations-v3.png"
        alt=""
        className="absolute max-w-none"
        style={{
          width: '300%',
          height: '200%',
          left: `${column * -100}%`,
          top: `${row * -100}%`,
        }}
      />
    </div>
  );
}
