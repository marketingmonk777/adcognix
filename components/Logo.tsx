export function Mark({ size = 28, color = '#2F5BFF', dot = '#FF6B4A' }: { size?: number; color?: string; dot?: string }) {
  return (<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <path d="M13 51 L32 13 L51 51" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="40.5" r="5.6" fill={dot} /></svg>);
}
export function Logo({ dark = false, size = 26 }: { dark?: boolean; size?: number }) {
  return (<span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }} aria-label="AdCognix">
    <Mark size={size} color={dark ? '#fff' : '#2F5BFF'} />
    <span style={{ font: `750 ${size * 0.78}px var(--font-h)`, letterSpacing: '-0.02em', color: dark ? '#fff' : 'var(--ink)' }}>AdCognix</span>
  </span>);
}
