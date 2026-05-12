interface AurumMarkProps {
  size?: number;
  className?: string;
}

/**
 * Geometric monoline mark for Aurum: a hexagonal ingot containing
 * a stylized "A". Strokes use the brand gold gradient. Designed to
 * read well at 16–96px without losing precision.
 */
export function AurumMark({ size = 32, className }: AurumMarkProps) {
  const id = `aurum-gold-${size}`;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={className}
      aria-label="Aurum mark"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F4E4BC" />
          <stop offset="50%"  stopColor="#D4A85C" />
          <stop offset="100%" stopColor="#A37A2E" />
        </linearGradient>
      </defs>

      {/* Hexagonal ingot — vertical orientation. */}
      <path
        d="M32 4 L56 17.5 L56 46.5 L32 60 L8 46.5 L8 17.5 Z"
        stroke={`url(#${id})`}
        strokeWidth="2"
      />

      {/* Inner "A" legs. */}
      <path
        d="M18.5 48 L32 16 L45.5 48"
        stroke={`url(#${id})`}
        strokeWidth="2"
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
      {/* Crossbar. */}
      <path
        d="M24 36 L40 36"
        stroke={`url(#${id})`}
        strokeWidth="2"
        strokeLinecap="square"
      />
      {/* Apex pivot. */}
      <circle cx="32" cy="16" r="1.6" fill={`url(#${id})`} />
    </svg>
  );
}
