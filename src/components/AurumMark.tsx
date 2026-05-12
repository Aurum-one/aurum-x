interface AurumMarkProps {
  size?: number;
  className?: string;
}

/**
 * Aurum mark — three isometric ingot layers stacked. The top face of the
 * upper ingot carries the highlight; lower tiers fall into shadow. Reads
 * as a solid pile of refined gold even at 16px. All strokes are flat —
 * no glows, no gradients in shapes that need to print or compress.
 */
export function AurumMark({ size = 32, className }: AurumMarkProps) {
  const uid = `aurum-${size}`;
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
        <linearGradient id={`${uid}-bright`} x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#F4E4BC" />
          <stop offset="50%"  stopColor="#E5C77E" />
          <stop offset="100%" stopColor="#A37A2E" />
        </linearGradient>
        <linearGradient id={`${uid}-mid`} x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#D4A85C" />
          <stop offset="100%" stopColor="#9B7128" />
        </linearGradient>
        <linearGradient id={`${uid}-deep`} x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#A37A2E" />
          <stop offset="100%" stopColor="#6B4D17" />
        </linearGradient>
      </defs>

      <g strokeLinejoin="miter" strokeLinecap="square">
        {/* Bottom ingot — deepest tone. */}
        <path
          d="M16 44 L32 38 L48 44 L48 50 L32 56 L16 50 Z"
          fill={`url(#${uid}-deep)`}
          stroke="#6B4D17"
          strokeWidth="1"
        />
        {/* Middle ingot. */}
        <path
          d="M12 32 L32 24 L52 32 L52 38 L32 46 L12 38 Z"
          fill={`url(#${uid}-mid)`}
          stroke="#7A5A1F"
          strokeWidth="1"
        />
        {/* Top ingot — bright face. */}
        <path
          d="M10 20 L32 10 L54 20 L54 26 L32 36 L10 26 Z"
          fill={`url(#${uid}-bright)`}
          stroke="#8C6826"
          strokeWidth="1"
        />
        {/* Top-face highlight. */}
        <path
          d="M10 20 L32 10 L54 20 L32 30 Z"
          fill="#F4E4BC"
          fillOpacity="0.35"
        />
        {/* Vertical seam — subtle through-line. */}
        <path
          d="M32 10 L32 56"
          stroke="#6B4D17"
          strokeOpacity="0.5"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );
}
