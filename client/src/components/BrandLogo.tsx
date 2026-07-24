interface BrandLogoProps {
  size?: number;
  showWordmark?: boolean;
  inverted?: boolean;
  className?: string;
}

function BrandLogo({
  size = 36,
  showWordmark = true,
  inverted = false,
  className = "",
}: BrandLogoProps) {
  const ink = inverted ? "#fff7ed" : "#111827";
  const accent = "#f97316";

  return (
    <div
      className={`brand-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        color: ink,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="64" height="64" rx="16" fill={accent} />
        <path
          d="M18 40c6-14 22-14 28 0"
          stroke="#111827"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx="26" cy="26" r="3.5" fill="#111827" />
        <circle cx="38" cy="26" r="3.5" fill="#111827" />
        <path
          d="M20 18c2-4 6-6 10-4M44 18c-2-4-6-6-10-4"
          stroke="#fff7ed"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark && (
        <span
          style={{
            fontWeight: 800,
            fontSize: size * 0.55,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Bite &amp; Sips
        </span>
      )}
    </div>
  );
}

export default BrandLogo;
