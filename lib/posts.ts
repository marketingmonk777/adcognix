// Festival / business-day post renderer (original artwork, SVG).
import type { Festival } from './festivals';
import { esc, wrap, onColor, mix, initials, FONT_H, FONT_B } from './templates';
export const POST_STYLES = ['Classic', 'Bold', 'Minimal'] as const;
function motif(m: Festival['motif'], x: number, y: number, r: number, c: string, a: string) {
  switch (m) {
    case 'lamp': return `<path d="M${x - r} ${y} Q${x} ${y + r * 0.9} ${x + r} ${y} Z" fill="${a}"/><path d="M${x} ${y - r * 0.15} C${x - r * 0.25} ${y - r * 0.5} ${x} ${y - r * 0.9} ${x} ${y - r * 1.05} C${x} ${y - r * 0.9} ${x + r * 0.25} ${y - r * 0.5} ${x} ${y - r * 0.15}Z" fill="#FFB020"/>`;
    case 'flag': return `<rect x="${x - r}" y="${y - r * 0.6}" width="${r * 2}" height="${r * 0.4}" fill="#FF9933"/><rect x="${x - r}" y="${y - r * 0.2}" width="${r * 2}" height="${r * 0.4}" fill="#fff" stroke="#eee"/><rect x="${x - r}" y="${y + r * 0.2}" width="${r * 2}" height="${r * 0.4}" fill="#138808"/><circle cx="${x}" cy="${y}" r="${r * 0.15}" fill="none" stroke="#000080" stroke-width="${r * 0.04}"/>`;
    case 'colour': return ['#FF6B4A', '#2F5BFF', '#14B88F', '#E8A317', '#DB2777'].map((k, i) => `<circle cx="${x + Math.cos(i * 1.26) * r * 0.6}" cy="${y + Math.sin(i * 1.26) * r * 0.6}" r="${r * 0.42}" fill="${k}" opacity=".75"/>`).join('');
    case 'moon': return `<circle cx="${x}" cy="${y}" r="${r}" fill="${a}"/><circle cx="${x + r * 0.4}" cy="${y - r * 0.25}" r="${r * 0.85}" fill="${c}"/><circle cx="${x + r * 0.9}" cy="${y + r * 0.5}" r="${r * 0.08}" fill="${a}"/>`;
    case 'sun': return `<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="${a}"/>` + Array.from({ length: 12 }, (_, i) => `<rect x="${x - r * 0.05}" y="${y - r}" width="${r * 0.1}" height="${r * 0.28}" rx="${r * 0.05}" fill="${a}" transform="rotate(${i * 30} ${x} ${y})"/>`).join('');
    case 'leaf': return `<path d="M${x - r} ${y + r * 0.6} Q${x - r} ${y - r} ${x + r} ${y - r * 0.8} Q${x + r * 0.6} ${y + r * 0.8} ${x - r} ${y + r * 0.6}Z" fill="${a}"/><path d="M${x - r * 0.9} ${y + r * 0.5} L${x + r * 0.7} ${y - r * 0.6}" stroke="${c}" stroke-width="${r * 0.06}"/>`;
    case 'gift': return `<rect x="${x - r * 0.8}" y="${y - r * 0.4}" width="${r * 1.6}" height="${r * 1.2}" rx="${r * 0.1}" fill="${a}"/><rect x="${x - r * 0.12}" y="${y - r * 0.4}" width="${r * 0.24}" height="${r * 1.2}" fill="${c}"/><path d="M${x} ${y - r * 0.4} q${-r * 0.6} ${-r * 0.6} ${-r * 0.5} 0 M${x} ${y - r * 0.4} q${r * 0.6} ${-r * 0.6} ${r * 0.5} 0" fill="none" stroke="${c}" stroke-width="${r * 0.1}"/>`;
    case 'book': return `<path d="M${x} ${y - r * 0.5} Q${x - r * 0.5} ${y - r * 0.8} ${x - r} ${y - r * 0.5} V${y + r * 0.6} Q${x - r * 0.5} ${y + r * 0.3} ${x} ${y + r * 0.6} Q${x + r * 0.5} ${y + r * 0.3} ${x + r} ${y + r * 0.6} V${y - r * 0.5} Q${x + r * 0.5} ${y - r * 0.8} ${x} ${y - r * 0.5}Z" fill="${a}"/><path d="M${x} ${y - r * 0.5}V${y + r * 0.6}" stroke="${c}" stroke-width="${r * 0.05}"/>`;
    case 'heart': return `<path d="M${x} ${y + r * 0.8} C${x - r * 1.4} ${y - r * 0.1} ${x - r * 0.6} ${y - r * 1.1} ${x} ${y - r * 0.4} C${x + r * 0.6} ${y - r * 1.1} ${x + r * 1.4} ${y - r * 0.1} ${x} ${y + r * 0.8}Z" fill="${a}"/>`;
    default: return Array.from({ length: 5 }, (_, i) => { const a1 = (i * 72 - 90) * Math.PI / 180, a2 = a1 + 36 * Math.PI / 180; return `${x + Math.cos(a1) * r},${y + Math.sin(a1) * r} ${x + Math.cos(a2) * r * 0.45},${y + Math.sin(a2) * r * 0.45}`; }).join(' ').replace(/^/, `<polygon fill="${a}" points="`) + '"/>';
  }
}
export function postSvg(f: Festival, biz: { name: string; city: string; phone?: string; brand_color: string; logo_url?: string }, text: string, style = 0, W = 1080, H = 1080) {
  const s = W / 1080; const c = biz.brand_color || '#2F5BFF'; const accent = '#FF6B4A';
  const bg = style === 0 ? mix(c, '#0B1B3F', 0.35) : style === 1 ? c : '#FFFFFF'; const ink = style === 2 ? '#0E1525' : onColor(bg); const soft = style === 2 ? '#5B6478' : mix(ink, bg, 0.25);
  const date = new Date(f.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  let y = H * 0.5 + 40 * s; const lines = wrap(f.name, 16, 2); const tl = wrap(text, 44, 4);
  const deco = style === 0 ? Array.from({ length: 18 }, (_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 331) % (H * 0.4)}" r="${(3 + (i % 4) * 2) * s}" fill="#fff" opacity=".25"/>`).join('')
    : style === 1 ? `<circle cx="${W}" cy="0" r="${420 * s}" fill="${mix(c, '#ffffff', 0.15)}"/><circle cx="0" cy="${H}" r="${300 * s}" fill="${mix(c, '#000000', 0.15)}"/>` : `<rect x="${40 * s}" y="${40 * s}" width="${W - 80 * s}" height="${H - 80 * s}" rx="${30 * s}" fill="none" stroke="${c}" stroke-width="${6 * s}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${bg}"/>${deco}` +
    motif(f.motif, W / 2, H * 0.26, 120 * s, bg, style === 2 ? c : accent) +
    lines.map((l, i) => `<text x="${W / 2}" y="${y + i * 86 * s - (lines.length - 1) * 43 * s}" text-anchor="middle" font-family="${FONT_H}" font-weight="800" font-size="${80 * s}" fill="${ink}">${esc(l)}</text>`).join('') +
    `<text x="${W / 2}" y="${y + 70 * s + (lines.length - 1) * 43 * s}" text-anchor="middle" font-family="${FONT_B}" font-size="${28 * s}" fill="${soft}" letter-spacing="${2 * s}">${esc(date.toUpperCase())}</text>` +
    tl.map((l, i) => `<text x="${W / 2}" y="${y + (150 + i * 44) * s + (lines.length - 1) * 43 * s}" text-anchor="middle" font-family="${FONT_B}" font-size="${32 * s}" fill="${ink}">${esc(l)}</text>`).join('') +
    `<rect x="0" y="${H - 120 * s}" width="${W}" height="${120 * s}" fill="${style === 2 ? c : '#000'}" fill-opacity="${style === 2 ? 1 : 0.18}"/>` +
    (biz.logo_url ? `<image href="${esc(biz.logo_url)}" x="${50 * s}" y="${H - 100 * s}" width="${80 * s}" height="${80 * s}"/>` : `<rect x="${50 * s}" y="${H - 100 * s}" width="${80 * s}" height="${80 * s}" rx="${16 * s}" fill="${accent}"/><text x="${90 * s}" y="${H - 48 * s}" text-anchor="middle" font-family="${FONT_H}" font-weight="800" font-size="${32 * s}" fill="#fff">${esc(initials(biz.name))}</text>`) +
    `<text x="${150 * s}" y="${H - 52 * s}" font-family="${FONT_H}" font-weight="800" font-size="${36 * s}" fill="${style === 2 ? onColor(c) : ink}">${esc(biz.name)}</text>` +
    `<text x="${W - 50 * s}" y="${H - 52 * s}" text-anchor="end" font-family="${FONT_B}" font-size="${28 * s}" fill="${style === 2 ? onColor(c) : ink}">${esc([biz.phone, biz.city].filter(Boolean).join(' · '))}</text></svg>`;
}
