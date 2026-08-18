export function ArchiAvatar({
  size = 48,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-violet-200 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <img
        src="/images/archie-book-avatar-v3.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
