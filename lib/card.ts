// Digital business card + mini website. Static hosting has no server, so the public page reads its data
// from the URL hash (never sent to any server). Encoding is base64url JSON, size-limited.
export type CardData = { v: 1; name: string; person?: string; role?: string; phone: string; whatsapp?: string; email?: string; website?: string; address?: string; maps?: string;
  about?: string; services?: string[]; hours?: string; color: string; logo?: string; tagline?: string; instagram?: string };
export const MAX_HASH = 60000;
const b64e = (s: string) => (typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(s))) : Buffer.from(s, 'utf8').toString('base64')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = (s: string) => { const t = s.replace(/-/g, '+').replace(/_/g, '/'); return typeof atob === 'function' ? decodeURIComponent(escape(atob(t))) : Buffer.from(t, 'base64').toString('utf8'); };
const str = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/[<>]/g, '').slice(0, n) : undefined);
export function sanitize(d: any): CardData | null {
  if (!d || typeof d !== 'object' || !str(d.name, 120) || !str(d.phone, 20)) return null;
  const color = /^#[0-9a-fA-F]{6}$/.test(d.color) ? d.color : '#2F5BFF';
  const logo = typeof d.logo === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(d.logo) && d.logo.length < 45000 ? d.logo : undefined;
  const url = (u: unknown) => { const s = str(u, 200); return s && /^https:\/\/[^\s]+$/.test(s) ? s : undefined; };
  return { v: 1, name: str(d.name, 120)!, person: str(d.person, 80), role: str(d.role, 80), phone: str(d.phone, 20)!, whatsapp: str(d.whatsapp, 20), email: str(d.email, 120), website: url(d.website), address: str(d.address, 240), maps: url(d.maps),
    about: str(d.about, 600), services: Array.isArray(d.services) ? d.services.map((s: unknown) => str(s, 60)).filter(Boolean).slice(0, 8) as string[] : [], hours: str(d.hours, 80), color, logo, tagline: str(d.tagline, 100), instagram: str(d.instagram, 40)?.replace(/^@/, '') };
}
export function encodeCard(d: CardData) { const clean = sanitize(d); if (!clean) throw new Error('Name and phone are required'); let s = b64e(JSON.stringify(clean)); if (s.length > MAX_HASH) { s = b64e(JSON.stringify({ ...clean, logo: undefined })); } return s; }
export function decodeCard(hash: string): CardData | null { try { return sanitize(JSON.parse(b64d(hash.replace(/^#/, '').split('&')[0]))); } catch { return null; } }
export const telHref = (p: string) => 'tel:' + p.replace(/[^\d+]/g, '');
export const waHref = (p: string, text = '') => 'https://wa.me/' + p.replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : '');
export function vcard(d: CardData) {
  return ['BEGIN:VCARD', 'VERSION:3.0', `FN:${d.person || d.name}`, `ORG:${d.name}`, d.role && `TITLE:${d.role}`, `TEL;TYPE=CELL:${d.phone}`, d.email && `EMAIL:${d.email}`, d.website && `URL:${d.website}`, d.address && `ADR;TYPE=WORK:;;${d.address.replace(/[,;]/g, ' ')};;;;`, 'END:VCARD'].filter(Boolean).join('\r\n');
}
