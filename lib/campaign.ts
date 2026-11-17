// Campaign planning helpers (pure). Objective catalogue, plan building on top of the recommender, validation.
import { recommendSplit } from './recommend';
import type { Channel, ChannelShare, Objective, Campaign } from './types';
export const OBJECTIVES: { id: Objective; label: string; desc: string; result: string; cta: string }[] = [
  { id: 'leads', label: 'Leads', desc: 'People fill a short form with their name and number.', result: 'Leads', cta: 'Get quote' },
  { id: 'calls', label: 'Phone calls', desc: 'A Call button that rings your business number.', result: 'Calls', cta: 'Call now' },
  { id: 'messages', label: 'WhatsApp messages', desc: 'Chats start on WhatsApp with a ready first message.', result: 'Chats', cta: 'Send message' },
  { id: 'traffic', label: 'Website traffic', desc: 'Visits to your website or a landing page.', result: 'Clicks', cta: 'Learn more' },
  { id: 'awareness', label: 'Awareness', desc: 'Be seen by as many local people as possible.', result: 'Reach', cta: 'Learn more' },
  { id: 'installs', label: 'App installs', desc: 'Downloads of your Android or iOS app.', result: 'Installs', cta: 'Install now' },
];
export const CHANNEL_LABEL: Record<Channel, string> = { google: 'Google Search', facebook: 'Facebook', instagram: 'Instagram' };
export const CHANNEL_COLOR: Record<Channel, string> = { google: '#2F5BFF', facebook: '#0B1B3F', instagram: '#FF6B4A' };
export const LEAD_OBJECTIVES: Objective[] = ['leads', 'calls', 'messages'];
const GOAL_MAP: Record<Objective, string> = { leads: 'leads', calls: 'calls', messages: 'messages', traffic: 'leads', awareness: 'awareness', installs: 'awareness' };

/** Split a budget across the channels the user picked, using the recommender's weights. */
export function planSplit(category: string, objective: Objective, picked: Channel[], dailyBudget: number): ChannelShare[] {
  if (!picked.length) return [];
  const rec = recommendSplit(category, GOAL_MAP[objective], Math.max(dailyBudget * 30, 6000)).split;
  const w = picked.map(c => ({ channel: c, w: rec.find(r => r.channel === c)?.share ?? 15 }));
  const t = w.reduce((a, b) => a + b.w, 0);
  const out = w.map(x => ({ channel: x.channel, share: Math.round((x.w / t) * 100) }));
  out[0].share += 100 - out.reduce((a, b) => a + b.share, 0);
  return out;
}
export function suggestedChannels(category: string, objective: Objective, dailyBudget: number): Channel[] {
  const rec = recommendSplit(category, GOAL_MAP[objective], dailyBudget * 30).split;
  let ch = rec.map(r => r.channel) as Channel[];
  if (objective === 'messages') ch = ch.filter(c => c !== 'google'); // click-to-WhatsApp runs on Meta only
  if (objective === 'installs' && !ch.includes('google')) ch.push('google');
  return ch.length ? ch : ['facebook', 'instagram'];
}
export const totalBudget = (c: Pick<Campaign, 'daily_budget' | 'duration_days'>) => c.daily_budget * c.duration_days;
export function validatePlan(p: { channels: ChannelShare[]; daily_budget: number; duration_days: number }) {
  const e: Record<string, string> = {};
  if (!p.channels.length) e.channels = 'Pick at least one platform';
  if (!(p.daily_budget >= 100)) e.daily_budget = 'Minimum ₹100 a day';
  if (p.daily_budget > 500000) e.daily_budget = 'Maximum ₹5,00,000 a day';
  if (!(p.duration_days >= 1 && p.duration_days <= 90)) e.duration_days = 'Between 1 and 90 days';
  return e;
}
export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
