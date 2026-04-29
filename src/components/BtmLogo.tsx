export function BtmLogo({ size = 18, color = 'white' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Trash bin body */}
      <rect x="3" y="8" width="12" height="9" rx="1.5" stroke={color} strokeWidth="1.4" />
      {/* Trash bin lid */}
      <line x1="1.5" y1="8" x2="16.5" y2="8" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Lid handle */}
      <path d="M6.5 8V6.5C6.5 5.95 6.95 5.5 7.5 5.5H10.5C11.05 5.5 11.5 5.95 11.5 6.5V8" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      {/* Calendar falling in — small rect with lines */}
      <rect x="5.5" y="9.5" width="4.5" height="3.5" rx="0.5" stroke={color} strokeWidth="1.1" />
      <line x1="7.75" y1="9.5" x2="7.75" y2="13" stroke={color} strokeWidth="1.1" />
      <line x1="5.5" y1="11.25" x2="10" y2="11.25" stroke={color} strokeWidth="1.1" />
      {/* Calendar top tabs */}
      <line x1="6.75" y1="9" x2="6.75" y2="9.5" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="8.75" y1="9" x2="8.75" y2="9.5" stroke={color} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}
