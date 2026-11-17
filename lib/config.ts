// Runtime config. Public values only (publishable key). Can come from env at build time
// or be set in the browser via Settings → Connect backend (stored in localStorage).
export type BackendConfig = { url: string; key: string };
const LS = 'acx.backend';
export function getBackend(): BackendConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) return { url, key };
  if (typeof window === 'undefined') return null;
  try { const v = JSON.parse(localStorage.getItem(LS) || 'null'); return v?.url && v?.key ? v : null; } catch { return null; }
}
export function setBackend(c: BackendConfig | null) {
  if (c) {
    if (/service_role|sb_secret_/.test(c.key)) throw new Error('That is a secret key. Use the publishable (sb_publishable_…) or anon key only.');
    localStorage.setItem(LS, JSON.stringify(c));
  } else localStorage.removeItem(LS);
}
export const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
