// Simulated insights for campaigns published through the MockPublisher. Deterministic: the same campaign
// and day always produce the same numbers. Everything here is example data, never a real ad result.
import type { Campaign, Channel, Lead } from './types';
import { LEAD_OBJECTIVES } from './campaign';
export type DayRow = { day: number; channel: Channel; impressions: number; reach: number; clicks: number; results: number; spend: number };
export type Totals = { impressions: number; reach: number; clicks: number; results: number; spend: number; ctr: number; cpr: number };
function rng(seed: string) { let h = 1779033703 ^ seed.length; for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }
const CPM: Record<Channel, number> = { facebook: 90, instagram: 120, google: 0 };
const CTR: Record<Channel, number> = { facebook: 0.011, instagram: 0.008, google: 0.045 };
const CPC_GOOGLE = 18;
const CONV: Record<string, number> = { leads: 0.09, calls: 0.07, messages: 0.12, traffic: 1, awareness: 0, installs: 0.06 };
/** Per-campaign channel quality (0.5–1.4), fixed for the life of the campaign so one channel can lag. */
export function channelQuality(id: string, ch: Channel) { return 0.5 + rng(id + ':q:' + ch)() * 0.9; }
export function simulateDay(c: Campaign, day: number): DayRow[] {
  return c.channels.map(({ channel, share }) => {
    const r = rng(`${c.id}:${day}:${channel}`); const q = channelQuality(c.id, channel);
    const spend = Math.round(c.daily_budget * share / 100 * (0.82 + r() * 0.18));
    const ramp = Math.min(1, 0.6 + day * 0.1);
    let impressions: number, clicks: number;
    if (channel === 'google') { clicks = Math.round(spend / (CPC_GOOGLE * (1.4 - q * 0.4)) * ramp); impressions = Math.round(clicks / (CTR.google * (0.8 + r() * 0.4))); }
    else { impressions = Math.round(spend / CPM[channel] * 1000 * (0.85 + r() * 0.3)); clicks = Math.round(impressions * CTR[channel] * q * ramp * (0.8 + r() * 0.4)); }
    const reach = Math.round(impressions * (0.62 + r() * 0.2));
    const conv = CONV[c.objective] ?? 0.05;
    const results = c.objective === 'awareness' ? reach : Math.round(clicks * conv * q * (0.7 + r() * 0.6));
    return { day, channel, impressions, reach, clicks, results, spend };
  });
}
export function simulate(c: Campaign): DayRow[] { const out: DayRow[] = []; for (let d = 0; d < Math.min(c.sim_days || 0, c.duration_days); d++) out.push(...simulateDay(c, d)); return out; }
export function totals(rows: DayRow[]): Totals {
  const t = rows.reduce((a, r) => ({ impressions: a.impressions + r.impressions, reach: a.reach + r.reach, clicks: a.clicks + r.clicks, results: a.results + r.results, spend: a.spend + r.spend }), { impressions: 0, reach: 0, clicks: 0, results: 0, spend: 0 });
  return { ...t, ctr: t.impressions ? t.clicks / t.impressions : 0, cpr: t.results ? t.spend / t.results : 0 };
}
export function byDay(rows: DayRow[]) { const m = new Map<number, DayRow[]>(); rows.forEach(r => m.set(r.day, [...(m.get(r.day) || []), r])); return [...m.entries()].sort((a, b) => a[0] - b[0]).map(([day, rs]) => ({ day, ...totals(rs) })); }
export function byChannel(rows: DayRow[]) { const m = new Map<Channel, DayRow[]>(); rows.forEach(r => m.set(r.channel, [...(m.get(r.channel) || []), r])); return [...m.entries()].map(([channel, rs]) => ({ channel, ...totals(rs) })); }

const FIRST = ['Aarav', 'Ananya', 'Rohan', 'Meera', 'Kabir', 'Isha', 'Vikram', 'Sneha', 'Arjun', 'Divya', 'Farhan', 'Lakshmi', 'Nikhil', 'Pooja', 'Rahul', 'Sana', 'Tejas', 'Uma', 'Varun', 'Zoya'];
const LAST = ['S.', 'K.', 'R.', 'M.', 'P.', 'N.', 'D.', 'B.', 'G.', 'T.'];
const ASK: Record<string, string[]> = {
  leads: ['Please share a quote', 'Need details and pricing', 'Interested, call me in the evening', 'Can I visit this weekend?'],
  calls: ['Called about availability', 'Called for pricing', 'Asked about timings'], messages: ['Hi, is this available?', 'Please send the price list', 'What are your timings?'],
};
/** Example leads for simulated days [fromDay, toDay). Phone numbers use the reserved +91 00000 range so they never reach a real person. */
export function mockLeads(c: Campaign, fromDay: number, toDay: number, now = Date.now()): Lead[] {
  if (!LEAD_OBJECTIVES.includes(c.objective)) return [];
  const out: Lead[] = [];
  for (let d = fromDay; d < Math.min(toDay, c.duration_days); d++) for (const row of simulateDay(c, d)) for (let k = 0; k < Math.min(row.results, 12); k++) {
    const r = rng(`${c.id}:lead:${d}:${row.channel}:${k}`);
    const name = FIRST[Math.floor(r() * FIRST.length)] + ' ' + LAST[Math.floor(r() * LAST.length)];
    const asks = ASK[c.objective] || ASK.leads;
    out.push({ id: `sim-${c.id.slice(0, 8)}-${d}-${row.channel}-${k}`, campaign_id: c.id, name, phone: '+9100000' + String(Math.floor(r() * 100000)).padStart(5, '0'),
      message: asks[Math.floor(r() * asks.length)], channel: row.channel, status: 'new', example: true, created_at: new Date(now - (toDay - 1 - d) * 864e5 - Math.floor(r() * 36e5 * 8)).toISOString() });
  }
  return out;
}
