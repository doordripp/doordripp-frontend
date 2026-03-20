/**
 * DrippyLogo — blocky pixel-art robot mascot for DoorDripp AI assistant
 * Colors: Yellow-green (#BAFF39), Dim grey (#6E6E6E), White (#FFFFFF)
 */
export default function DrippyLogo({ size = 40, className = '' }) {
  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={size * (140 / 120)}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ===== HEAD ===== */}
      {/* Main head shape — rounded rectangle with thick outline */}
      <rect x="18" y="12" width="84" height="68" rx="14" ry="14"
        fill="#6E6E6E" stroke="#2a2a2a" strokeWidth="5" />

      {/* Face plate — white area */}
      <rect x="38" y="22" width="60" height="48" rx="8" ry="8"
        fill="#FFFFFF" />

      {/* Left accent panel — yellow-green */}
      <rect x="18" y="22" width="28" height="48" rx="0" ry="0"
        fill="#BAFF39" />
      {/* Clip the accent to head shape */}
      <rect x="18" y="12" width="10" height="14" fill="#6E6E6E" />
      <rect x="18" y="66" width="10" height="14" fill="#6E6E6E" />
      {/* Round the accent's left edge to match head */}
      <path d="M18 26 C18 22, 22 18, 28 16 L28 26 Z" fill="#6E6E6E" />
      <path d="M18 66 C18 70, 22 74, 28 76 L28 66 Z" fill="#6E6E6E" />

      {/* Left eye — dark square */}
      <rect x="48" y="36" width="14" height="16" rx="3" ry="3" fill="#2a2a2a">
        {/* Blink */}
        <animate
          attributeName="height"
          values="16;16;2;16;16"
          keyTimes="0;0.45;0.5;0.55;1"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Right eye — dark square */}
      <rect x="70" y="36" width="14" height="16" rx="3" ry="3" fill="#2a2a2a">
        <animate
          attributeName="height"
          values="16;16;2;16;16"
          keyTimes="0;0.45;0.5;0.55;1"
          dur="4s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Antenna nub on top */}
      <rect x="52" y="4" width="16" height="12" rx="4" ry="4"
        fill="#6E6E6E" stroke="#2a2a2a" strokeWidth="3" />

      {/* ===== BODY ===== */}
      {/* Center body — small rectangle */}
      <rect x="42" y="84" width="36" height="24" rx="4" ry="4"
        fill="#6E6E6E" stroke="#2a2a2a" strokeWidth="4" />

      {/* ===== ARMS ===== */}
      {/* Left arm */}
      <rect x="22" y="86" width="20" height="12" rx="4" ry="4"
        fill="#6E6E6E" stroke="#2a2a2a" strokeWidth="3.5">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 32 92; -6 32 92; 0 32 92; 6 32 92; 0 32 92"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Right arm */}
      <rect x="78" y="86" width="20" height="12" rx="4" ry="4"
        fill="#6E6E6E" stroke="#2a2a2a" strokeWidth="3.5">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 88 92; 6 88 92; 0 88 92; -6 88 92; 0 88 92"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>

      {/* ===== LEGS ===== */}
      {/* Left leg */}
      <rect x="44" y="108" width="14" height="16" rx="3" ry="3"
        fill="#6E6E6E" stroke="#2a2a2a" strokeWidth="3" />

      {/* Right leg */}
      <rect x="62" y="108" width="14" height="16" rx="3" ry="3"
        fill="#6E6E6E" stroke="#2a2a2a" strokeWidth="3" />
    </svg>
  )
}
