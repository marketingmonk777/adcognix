// Original AdCognix creative templates. Pure SVG strings, so they render in the browser, in tests and
// on a server (resvg) without extra assets. Every layout adapts to square feed (1080×1080) and story (1080×1920).
export type TplVars = { name: string; headline: string; sub: string; offer?: string; cta: string; color: string; accent: string; phone?: string; city?: string; logo?: string };
export type Template = { id: string; name: string; category: string; draw: (v: TplVars, W: number, H: number) => string };
export const FONT_H = "Manrope, 'Segoe UI', Arial, sans-serif"; export const FONT_B = "Inter, 'Segoe UI', Arial, sans-serif";
export const esc = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function wrap(text: string, max: number, maxLines = 3) {
  const words = String(text || '').split(/\s+/).filter(Boolean); const lines: string[] = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) { const k = lines.slice(0, maxLines); k[maxLines - 1] = k[maxLines - 1].replace(/.{0,2}$/, '') + '…'; return k; }
  return lines;
}
export const initials = (n: string) => (n || 'A').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
function luminance(hex: string) { const h = hex.replace('#', ''); const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
export const onColor = (hex: string) => (luminance(hex) > 0.6 ? '#0E1525' : '#FFFFFF');
export function mix(hex: string, to: string, t: number) {
  const p = (h: string) => [0, 2, 4].map(i => parseInt(h.replace('#', '').slice(i, i + 2), 16)); const a = p(hex), b = p(to);
  return '#' + a.map((x, i) => Math.round(x + (b[i] - x) * t).toString(16).padStart(2, '0')).join('');
}
type Block = { x: number; y: number; w: number; align?: 'start' | 'middle'; ink: string; soft: string; logoBg?: string };
/** Shared text block: logo, headline, sub line, offer badge, CTA, footer. */
function block(v: TplVars, W: number, H: number, b: Block) {
  const s = W / 1080, story = H / W > 1.4; const hs = (story ? 92 : 80) * s; const anchor = b.align || 'start';
  const cx = anchor === 'middle' ? b.x + b.w / 2 : b.x; const chars = Math.max(10, Math.floor(b.w / (hs * 0.56)));
  let y = b.y + (story ? 150 * s : 0); const out: string[] = [];
  const lg = 76 * s; const lx = anchor === 'middle' ? cx - lg / 2 : b.x;
  out.push(v.logo ? `<image href="${esc(v.logo)}" x="${lx}" y="${y}" width="${lg}" height="${lg}" preserveAspectRatio="xMidYMid meet"/>`
    : `<rect x="${lx}" y="${y}" width="${lg}" height="${lg}" rx="${18 * s}" fill="${b.logoBg || v.color}"/><text x="${lx + lg / 2}" y="${y + lg * 0.64}" text-anchor="middle" font-family="${FONT_H}" font-weight="800" font-size="${30 * s}" fill="${onColor(b.logoBg || v.color)}">${esc(initials(v.name))}</text>`);
  out.push(`<text x="${anchor === 'middle' ? cx : lx + lg + 20 * s}" y="${anchor === 'middle' ? y + lg + 44 * s : y + lg * 0.62}" text-anchor="${anchor}" font-family="${FONT_H}" font-weight="700" font-size="${30 * s}" fill="${b.ink}">${esc(v.name)}</text>`);
  y += lg + (anchor === 'middle' ? 120 : 90) * s + (story ? 120 * s : 0);
  for (const l of wrap(v.headline, chars, story ? 4 : 3)) { out.push(`<text x="${cx}" y="${y}" text-anchor="${anchor}" font-family="${FONT_H}" font-weight="800" font-size="${hs}" letter-spacing="${-1.5 * s}" fill="${b.ink}">${esc(l)}</text>`); y += hs * 1.08; }
  y += 18 * s;
  for (const l of wrap(v.sub, Math.floor(b.w / (34 * s * 0.52)), 2)) { out.push(`<text x="${cx}" y="${y}" text-anchor="${anchor}" font-family="${FONT_B}" font-size="${34 * s}" fill="${b.soft}">${esc(l)}</text>`); y += 46 * s; }
  if (v.offer) {
    y += 26 * s; const t = v.offer.slice(0, 34); const bw = Math.min(b.w, (t.length * 19 + 64) * s); const bx = anchor === 'middle' ? cx - bw / 2 : b.x;
    out.push(`<rect x="${bx}" y="${y}" width="${bw}" height="${64 * s}" rx="${32 * s}" fill="${v.accent}"/><text x="${bx + bw / 2}" y="${y + 43 * s}" text-anchor="middle" font-family="${FONT_H}" font-weight="800" font-size="${30 * s}" fill="${onColor(v.accent)}">${esc(t)}</text>`);
    y += 64 * s;
  }
  const cy = story ? H - 300 * s : Math.max(y + 50 * s, H - 190 * s); const cw = (v.cta.length * 20 + 90) * s; const ccx = anchor === 'middle' ? cx - cw / 2 : b.x;
  out.push(`<rect x="${ccx}" y="${cy}" width="${cw}" height="${78 * s}" rx="${16 * s}" fill="${b.ink}"/><text x="${ccx + cw / 2}" y="${cy + 51 * s}" text-anchor="middle" font-family="${FONT_H}" font-weight="800" font-size="${32 * s}" fill="${onColor(b.ink)}">${esc(v.cta)}</text>`);
  const foot = [v.phone, v.city].filter(Boolean).join('  ·  ');
  if (foot) out.push(`<text x="${anchor === 'middle' ? cx : ccx + cw + 28 * s}" y="${anchor === 'middle' ? cy + 130 * s : cy + 50 * s}" text-anchor="${anchor}" font-family="${FONT_B}" font-weight="600" font-size="${28 * s}" fill="${b.soft}">${esc(foot)}</text>`);
  return out.join('');
}
const ph = (W: number, H: number) => ({ s: W / 1080, st: H / W > 1.4 });

export const TEMPLATES: Template[] = [
  { id: 'bold-split', name: 'Bold split', category: 'Any', draw: (v, W, H) => { const { s } = ph(W, H);
    return `<rect width="${W}" height="${H}" fill="${v.color}"/><path d="M${W * 0.62} 0 L${W} 0 L${W} ${H} L${W * 0.42} ${H} Z" fill="${mix(v.color, '#000000', 0.18)}"/><circle cx="${W * 0.86}" cy="${H * 0.2}" r="${120 * s}" fill="${v.accent}" opacity=".9"/>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.72, ink: onColor(v.color), soft: mix(onColor(v.color), v.color, 0.25), logoBg: v.accent }); } },
  { id: 'clean-card', name: 'Clean card', category: 'Any', draw: (v, W, H) => { const { s } = ph(W, H);
    return `<rect width="${W}" height="${H}" fill="#F7F8FB"/><rect x="${40 * s}" y="${40 * s}" width="${W - 80 * s}" height="${H - 80 * s}" rx="${36 * s}" fill="#fff" stroke="#E3E6EE" stroke-width="${2 * s}"/><rect x="${40 * s}" y="${40 * s}" width="${18 * s}" height="${H - 80 * s}" rx="${9 * s}" fill="${v.color}"/>` +
      block(v, W, H, { x: 110 * s, y: 100 * s, w: W - 220 * s, ink: '#0E1525', soft: '#5B6478' }); } },
  { id: 'home-key', name: 'Open house', category: 'Real estate', draw: (v, W, H) => { const { s } = ph(W, H); const hx = W * 0.62, hy = H - 520 * s;
    return `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(v.color, '#ffffff', 0.85)}"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/>` +
      `<path d="M${hx} ${hy + 160 * s} L${hx + 170 * s} ${hy} L${hx + 340 * s} ${hy + 160 * s} V${hy + 420 * s} H${hx} Z" fill="${v.color}" opacity=".12"/><path d="M${hx} ${hy + 160 * s} L${hx + 170 * s} ${hy} L${hx + 340 * s} ${hy + 160 * s}" fill="none" stroke="${v.color}" stroke-width="${18 * s}" stroke-linejoin="round" stroke-linecap="round"/><rect x="${hx + 130 * s}" y="${hy + 260 * s}" width="${80 * s}" height="${160 * s}" rx="${8 * s}" fill="${v.accent}"/>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.6, ink: '#0B1B3F', soft: '#5B6478' }); } },
  { id: 'blueprint', name: 'Blueprint', category: 'Interiors & home services', draw: (v, W, H) => { const { s } = ph(W, H); const bg = mix(v.color, '#0B1B3F', 0.55); let grid = '';
    for (let x = 0; x < W; x += 60 * s) grid += `<path d="M${x} 0V${H}" stroke="#fff" stroke-opacity=".07"/>`; for (let y = 0; y < H; y += 60 * s) grid += `<path d="M0 ${y}H${W}" stroke="#fff" stroke-opacity=".07"/>`;
    return `<rect width="${W}" height="${H}" fill="${bg}"/>${grid}<g fill="none" stroke="${v.accent}" stroke-width="${6 * s}"><rect x="${W - 380 * s}" y="${H - 560 * s}" width="${300 * s}" height="${220 * s}"/><path d="M${W - 380 * s} ${H - 450 * s}H${W - 260 * s}M${W - 200 * s} ${H - 560 * s}V${H - 340 * s}"/><path d="M${W - 260 * s} ${H - 450 * s} a${60 * s} ${60 * s} 0 0 1 ${60 * s} ${-60 * s}"/></g>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.7, ink: '#ffffff', soft: '#C9D3F5', logoBg: v.accent }); } },
  { id: 'chalkboard', name: 'Class is on', category: 'Education & coaching', draw: (v, W, H) => { const { s } = ph(W, H);
    return `<rect width="${W}" height="${H}" fill="#14322B"/><rect x="${28 * s}" y="${28 * s}" width="${W - 56 * s}" height="${H - 56 * s}" rx="${20 * s}" fill="none" stroke="#C89B5B" stroke-width="${16 * s}"/>` +
      `<path d="M${W - 330 * s} ${H * 0.62} q${60 * s} ${-30 * s} ${120 * s} 0 q${60 * s} ${-30 * s} ${120 * s} 0 v${150 * s} q${-60 * s} ${-30 * s} ${-120 * s} 0 q${-60 * s} ${-30 * s} ${-120 * s} 0 z" fill="none" stroke="#F4F1E8" stroke-width="${7 * s}"/><path d="M${W - 210 * s} ${H * 0.62}v${150 * s}" stroke="#F4F1E8" stroke-width="${5 * s}"/>` +
      block(v, W, H, { x: 90 * s, y: 90 * s, w: W * 0.66, ink: '#F4F1E8', soft: '#B9C9BF', logoBg: v.accent }); } },
  { id: 'pulse', name: 'Care pulse', category: 'Healthcare & clinics', draw: (v, W, H) => { const { s } = ph(W, H); const y = H * 0.82;
    return `<rect width="${W}" height="${H}" fill="#fff"/><rect y="${H * 0.74}" width="${W}" height="${H * 0.26}" fill="${mix(v.color, '#ffffff', 0.9)}"/><path d="M0 ${y} H${W * 0.45} l${30 * s} ${-80 * s} l${40 * s} ${150 * s} l${36 * s} ${-120 * s} l${22 * s} ${50 * s} H${W}" fill="none" stroke="${v.accent}" stroke-width="${8 * s}" stroke-linejoin="round" opacity=".7"/>` +
      `<g transform="translate(${W - 230 * s} ${90 * s})"><rect x="${50 * s}" width="${50 * s}" height="${150 * s}" rx="${10 * s}" fill="${v.color}"/><rect y="${50 * s}" width="${150 * s}" height="${50 * s}" rx="${10 * s}" fill="${v.color}"/></g>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.68, ink: '#0B1B3F', soft: '#5B6478' }); } },
  { id: 'plate', name: 'Chef special', category: 'Restaurants & cafés', draw: (v, W, H) => { const { s } = ph(W, H); const cx = W - 160 * s, cy = H - 420 * s;
    return `<rect width="${W}" height="${H}" fill="${mix(v.accent, '#FFF8F0', 0.86)}"/><circle cx="${cx}" cy="${cy}" r="${260 * s}" fill="#fff" stroke="${mix(v.accent, '#ffffff', 0.5)}" stroke-width="${10 * s}"/><circle cx="${cx}" cy="${cy}" r="${180 * s}" fill="${v.accent}" opacity=".18"/>` +
      `<path d="M${cx - 330 * s} ${cy - 160 * s} v${320 * s}M${cx - 352 * s} ${cy - 160 * s} v${90 * s} M${cx - 308 * s} ${cy - 160 * s} v${90 * s}" stroke="${v.color}" stroke-width="${10 * s}" stroke-linecap="round"/>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.62, ink: '#3A1D0E', soft: '#7A5A48', logoBg: v.color }); } },
  { id: 'tag-sale', name: 'Price tag', category: 'Retail & fashion', draw: (v, W, H) => { const { s } = ph(W, H); const tx = W - 400 * s, ty = H - 560 * s;
    return `<rect width="${W}" height="${H}" fill="${v.color}"/><g transform="rotate(-12 ${tx + 150 * s} ${ty + 150 * s})"><path d="M${tx} ${ty + 60 * s} L${tx + 60 * s} ${ty} H${tx + 320 * s} V${ty + 300 * s} H${tx + 60 * s} L${tx} ${ty + 240 * s} Z" fill="${v.accent}"/><circle cx="${tx + 60 * s}" cy="${ty + 150 * s}" r="${18 * s}" fill="${v.color}"/></g>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.66, ink: onColor(v.color), soft: mix(onColor(v.color), v.color, 0.3), logoBg: v.accent }); } },
  { id: 'bloom', name: 'Soft bloom', category: 'Beauty & wellness', draw: (v, W, H) => { const { s } = ph(W, H); const cx = W - 190 * s, cy = H - 380 * s; let petals = '';
    for (let i = 0; i < 6; i++) { const a = (i * Math.PI) / 3; petals += `<ellipse cx="${cx + Math.cos(a) * 90 * s}" cy="${cy + Math.sin(a) * 90 * s}" rx="${80 * s}" ry="${80 * s}" fill="${v.accent}" opacity=".22"/>`; }
    return `<rect width="${W}" height="${H}" fill="${mix(v.accent, '#ffffff', 0.92)}"/>${petals}<circle cx="${cx}" cy="${cy}" r="${50 * s}" fill="${v.color}"/>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.66, ink: '#2B1530', soft: '#6E5A73', logoBg: v.color }); } },
  { id: 'shield', name: 'Secure plan', category: 'Finance & insurance', draw: (v, W, H) => { const { s } = ph(W, H); const x = W - 330 * s, y = H - 600 * s;
    return `<rect width="${W}" height="${H}" fill="#0B1B3F"/><path d="M${80 * s} ${H - 120 * s} L${W * 0.3} ${H - 220 * s} L${W * 0.5} ${H - 180 * s} L${W * 0.9} ${H - 360 * s}" fill="none" stroke="${v.accent}" stroke-width="${8 * s}" opacity=".5"/>` +
      `<path d="M${x + 125 * s} ${y} L${x + 250 * s} ${y + 50 * s} V${y + 170 * s} Q${x + 250 * s} ${y + 280 * s} ${x + 125 * s} ${y + 330 * s} Q${x} ${y + 280 * s} ${x} ${y + 170 * s} V${y + 50 * s} Z" fill="${v.color}"/><path d="M${x + 75 * s} ${y + 170 * s} l${40 * s} ${40 * s} l${70 * s} ${-80 * s}" fill="none" stroke="#fff" stroke-width="${16 * s}" stroke-linecap="round" stroke-linejoin="round"/>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.64, ink: '#ffffff', soft: '#A9B4D6', logoBg: v.color }); } },
  { id: 'gear', name: 'Built to spec', category: 'Manufacturing & B2B', draw: (v, W, H) => { const { s } = ph(W, H); const cx = W - 200 * s, cy = H - 400 * s; let teeth = '';
    for (let i = 0; i < 8; i++) teeth += `<rect x="${cx - 26 * s}" y="${cy - 200 * s}" width="${52 * s}" height="${70 * s}" rx="${6 * s}" fill="${v.color}" transform="rotate(${i * 45} ${cx} ${cy})"/>`;
    return `<rect width="${W}" height="${H}" fill="#EEF1F6"/><path d="M0 ${H - 40 * s} H${W}" stroke="${v.accent}" stroke-width="${30 * s}" stroke-dasharray="${60 * s} ${40 * s}"/>${teeth}<circle cx="${cx}" cy="${cy}" r="${150 * s}" fill="${v.color}"/><circle cx="${cx}" cy="${cy}" r="${60 * s}" fill="#EEF1F6"/>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.62, ink: '#0E1525', soft: '#5B6478' }); } },
  { id: 'horizon', name: 'Horizon', category: 'Travel & hospitality', draw: (v, W, H) => { const { s } = ph(W, H); const gy = H - 260 * s;
    return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(v.color, '#ffffff', 0.2)}"/><stop offset="1" stop-color="${mix(v.accent, '#ffffff', 0.4)}"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#sky)"/>` +
      `<circle cx="${W * 0.78}" cy="${gy - 120 * s}" r="${110 * s}" fill="#FFE2A8"/><path d="M0 ${gy} L${W * 0.3} ${gy - 220 * s} L${W * 0.5} ${gy - 80 * s} L${W * 0.7} ${gy - 260 * s} L${W} ${gy - 40 * s} V${H} H0Z" fill="${mix(v.color, '#000000', 0.35)}"/><path d="M${W * 0.15} ${gy - 420 * s} Q${W * 0.5} ${gy - 640 * s} ${W * 0.9} ${gy - 520 * s}" fill="none" stroke="#fff" stroke-width="${5 * s}" stroke-dasharray="${16 * s} ${14 * s}"/>` +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.8, ink: '#ffffff', soft: '#EEF2FF', logoBg: v.accent }); } },
  { id: 'road', name: 'Fast lane', category: 'Automobile', draw: (v, W, H) => { const { s } = ph(W, H);
    return `<rect width="${W}" height="${H}" fill="#151A26"/><path d="M${W * 0.55} ${H} L${W * 0.8} ${H * 0.55} L${W * 0.86} ${H * 0.55} L${W} ${H * 0.8} V${H} Z" fill="#2A3142"/><path d="M${W * 0.8} ${H} L${W * 0.83} ${H * 0.55}" stroke="${v.accent}" stroke-width="${10 * s}" stroke-dasharray="${50 * s} ${40 * s}"/>` +
      [0, 1, 2].map(i => `<rect x="${W - (380 - i * 40) * s}" y="${(200 + i * 46) * s}" width="${(300 - i * 80) * s}" height="${16 * s}" rx="${8 * s}" fill="${v.color}" opacity="${0.9 - i * 0.25}"/>`).join('') +
      block(v, W, H, { x: 80 * s, y: 80 * s, w: W * 0.62, ink: '#ffffff', soft: '#AEB6C8', logoBg: v.color }); } },
  { id: 'confetti', name: 'Celebrate', category: 'Events & weddings', draw: (v, W, H) => { const { s } = ph(W, H); let dots = ''; let seed = 7;
    const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 40; i++) dots += `<rect x="${r() * W}" y="${r() * H}" width="${(10 + r() * 16) * s}" height="${(10 + r() * 16) * s}" rx="${4 * s}" fill="${[v.color, v.accent, '#E8A317', '#14B88F'][i % 4]}" opacity=".5" transform="rotate(${r() * 90} ${r() * W} ${r() * H})"/>`;
    return `<rect width="${W}" height="${H}" fill="#FFFDF8"/>${dots}<rect x="${W * 0.06}" y="${H * 0.06}" width="${W * 0.88}" height="${H * 0.88}" rx="${28 * s}" fill="#fff" fill-opacity=".86" stroke="${v.accent}" stroke-width="${4 * s}"/>` +
      block(v, W, H, { x: W * 0.12, y: H * 0.1, w: W * 0.76, align: 'middle', ink: '#2A1A10', soft: '#6B5A4D', logoBg: v.color }); } },
  { id: 'spotlight', name: 'Spotlight', category: 'Any', draw: (v, W, H) => { const { s } = ph(W, H);
    return `<defs><radialGradient id="sp" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color="${mix(v.color, '#ffffff', 0.25)}"/><stop offset="1" stop-color="${mix(v.color, '#000000', 0.45)}"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#sp)"/><circle cx="${W / 2}" cy="${H + 300 * s}" r="${600 * s}" fill="${v.accent}" opacity=".18"/>` +
      block(v, W, H, { x: W * 0.1, y: 90 * s, w: W * 0.8, align: 'middle', ink: '#ffffff', soft: '#E6EBFF', logoBg: v.accent }); } },
];
export const TEMPLATE_CATEGORIES = Array.from(new Set(TEMPLATES.map(t => t.category)));
export function templatesFor(category: string) { const m = TEMPLATES.filter(t => t.category === category); const any = TEMPLATES.filter(t => t.category === 'Any'); return [...m, ...any, ...TEMPLATES.filter(t => t.category !== category && t.category !== 'Any')]; }
export function renderSvg(id: string, v: TplVars, W = 1080, H = 1080) {
  const t = TEMPLATES.find(x => x.id === id) || TEMPLATES[0];
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${t.draw(v, W, H)}</svg>`;
}
export const svgDataUrl = (svg: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
