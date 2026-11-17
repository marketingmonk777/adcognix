// Optimisation rules engine. Reads campaign totals and returns suggestions; nothing changes until the user applies one.
import type { Campaign, Channel } from './types';
import { byChannel, simulate, totals, type DayRow } from './sim';
import { CHANNEL_LABEL, LEAD_OBJECTIVES, inr } from './campaign';
export type Suggestion = { id: string; campaign_id: string; severity: 'high' | 'medium' | 'low'; title: string; detail: string;
  action: { type: 'pause' } | { type: 'shift'; from: Channel; to: Channel; points: number } | { type: 'budget'; daily: number } | { type: 'refresh_creative' } | { type: 'none' } };
const DEFAULT_CPL: Record<string, number> = { 'Real estate': 450, 'Healthcare & clinics': 250, 'Education & coaching': 200, 'Finance & insurance': 300, 'Interiors & home services': 350, 'Manufacturing & B2B': 500 };
export const defaultTargetCpl = (category: string) => DEFAULT_CPL[category] ?? 150;

export function evaluate(c: Campaign, target: number, rows: DayRow[] = simulate(c)): Suggestion[] {
  if (c.status !== 'active' && c.status !== 'paused') return [];
  const s: Suggestion[] = []; const days = new Set(rows.map(r => r.day)).size; if (days < 2) return s;
  const t = totals(rows); const ch = byChannel(rows); const id = (k: string) => `${c.id}:${k}`; const done = new Set(c.applied || []);
  const leadsGoal = LEAD_OBJECTIVES.includes(c.objective) || c.objective === 'installs';
  if (leadsGoal) {
    if (t.results === 0 && days >= 3 && c.status === 'active') s.push({ id: id('no-results'), campaign_id: c.id, severity: 'high', title: 'No results after ' + days + ' days', detail: 'Spend is going out but nobody has responded. Pause and review the offer and audience before spending more.', action: { type: 'pause' } });
    else if (t.cpr > target * 2 && c.status === 'active') s.push({ id: id('cpl-2x'), campaign_id: c.id, severity: 'high', title: `Cost per result ${inr(t.cpr)} is more than double your ${inr(target)} target`, detail: 'Pause this campaign and relaunch with a sharper offer, or lower the target if this is normal for your category.', action: { type: 'pause' } });
    const ranked = ch.filter(x => x.spend > 0).map(x => ({ ...x, cpr: x.results ? x.spend / x.results : Infinity })).sort((a, b) => a.cpr - b.cpr);
    if (ranked.length >= 2) {
      const best = ranked[0], worst = ranked[ranked.length - 1]; const share = c.channels.find(x => x.channel === worst.channel)?.share || 0;
      if (worst.cpr > target * 1.3 && worst.cpr > best.cpr * 1.3 && share > 10) {
        const points = Math.min(20, share - 10);
        s.push({ id: id(`shift-${worst.channel}-${best.channel}`), campaign_id: c.id, severity: 'medium', title: `Move ${points}% of budget from ${CHANNEL_LABEL[worst.channel]} to ${CHANNEL_LABEL[best.channel]}`,
          detail: `${CHANNEL_LABEL[worst.channel]} costs ${worst.cpr === Infinity ? 'n/a (no results)' : inr(worst.cpr)} per result against ${inr(best.cpr)} on ${CHANNEL_LABEL[best.channel]}. Target ${inr(target)}.`, action: { type: 'shift', from: worst.channel, to: best.channel, points } });
      }
    }
    if (t.results > 0 && t.cpr < target * 0.6 && c.status === 'active') s.push({ id: id('scale'), campaign_id: c.id, severity: 'low', title: 'Doing well: consider 20% more daily budget', detail: `Cost per result ${inr(t.cpr)} is well under your ${inr(target)} target.`, action: { type: 'budget', daily: Math.round(c.daily_budget * 1.2) } });
  }
  if (t.impressions > 2000 && t.ctr < 0.006) s.push({ id: id('ctr'), campaign_id: c.id, severity: 'medium', title: `Click rate is low (${(t.ctr * 100).toFixed(2)}%)`, detail: 'People see the ad but few tap it. Try a different template or a clearer offer in the headline.', action: { type: 'refresh_creative' } });
  return s.filter(x => !done.has(x.id));
}
/** Returns the campaign with the suggestion applied (pure). */
export function apply(c: Campaign, sg: Suggestion): Campaign {
  const applied = [...(c.applied || []), sg.id]; const a = sg.action;
  if (a.type === 'pause') return { ...c, status: 'paused', applied };
  if (a.type === 'budget') return { ...c, daily_budget: a.daily, applied };
  if (a.type === 'shift') {
    const ch = c.channels.map(x => ({ ...x })); const f = ch.find(x => x.channel === a.from); const t = ch.find(x => x.channel === a.to);
    if (f && t) { const p = Math.min(a.points, f.share); f.share -= p; t.share += p; }
    return { ...c, channels: ch.filter(x => x.share > 0), applied };
  }
  return { ...c, applied };
}
