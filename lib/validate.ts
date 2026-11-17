// Shared validation (also mirrored by DB constraints in supabase/schema.sql).
export const phoneOk = (p: string) => /^\+?[0-9][0-9\s-]{8,15}$/.test(p.trim()) && p.replace(/\D/g, '').length >= 10;
export const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
export const req = (v: string | undefined, min = 2) => !!v && v.trim().length >= min;
export function normPhone(p: string) { const d = p.replace(/\D/g, ''); return d.length === 10 ? '+91' + d : (p.trim().startsWith('+') ? '+' + d : '+' + d); }
export const clean = (s: string, max = 500) => s.replace(/[<>]/g, '').trim().slice(0, max);
