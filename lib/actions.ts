// App operations built on the data adapter. Pages call these, so demo and cloud behave the same.
import { db, uid } from './data';
import { publisher } from './publisher';
import { mockLeads } from './sim';
import { fallbackCopy, copyPrompt, parseCopy, type CopyInput } from './copy';
import type { AdCopy, AppNotification, Campaign, Lead } from './types';
const now = () => new Date().toISOString();

export async function notify(n: Omit<AppNotification, 'id' | 'read' | 'created_at'>) {
  await db().save<AppNotification>('notifications', { ...n, id: uid(), read: false, created_at: now() });
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('acx:notify'));
}
export async function writeCopy(i: CopyInput): Promise<AdCopy> {
  try { const p = copyPrompt(i); const r = await db().ai('ad_copy', p.system, p.prompt); const c = parseCopy(r.text, r.provider); if (c) return c; } catch { /* fall back */ }
  return fallbackCopy(i);
}
export async function publishCampaign(c: Campaign): Promise<Campaign> {
  const res = await publisher().publish(c);
  const next: Campaign = { ...c, status: 'active', publish: res, sim_days: res.simulated ? 1 : 0, updated_at: now() };
  await db().save('campaigns', next); await db().log('campaign.publish', { id: c.id, adapter: res.adapter, simulated: res.simulated });
  if (res.simulated) await addLeads(next, 0, 1);
  await notify({ kind: 'campaign', title: `“${c.name}” is live (simulated)`, body: res.note, href: '/app/campaigns/' });
  return next;
}
async function addLeads(c: Campaign, from: number, to: number) {
  const leads = mockLeads(c, from, to); if (!leads.length) return 0;
  await db().saveMany<Lead>('leads', leads);
  await notify({ kind: 'lead', title: `${leads.length} new example lead${leads.length > 1 ? 's' : ''} from “${c.name}”`, body: 'Simulated leads for testing the inbox.', href: '/app/leads/' });
  return leads.length;
}
/** Advance a simulated campaign by n days: adds insights days and example leads. */
export async function advance(c: Campaign, n = 1): Promise<{ c: Campaign; leads: number }> {
  if (c.status !== 'active' || !c.publish?.simulated) return { c, leads: 0 };
  const from = c.sim_days || 0; const to = Math.min(c.duration_days, from + n);
  const next: Campaign = { ...c, sim_days: to, status: to >= c.duration_days ? 'ended' : c.status, updated_at: now() };
  await db().save('campaigns', next); const leads = await addLeads(c, from, to);
  if (next.status === 'ended') await notify({ kind: 'campaign', title: `“${c.name}” finished its ${c.duration_days}-day run`, href: '/app/reports/' });
  return { c: next, leads };
}
export async function setStatus(c: Campaign, status: 'active' | 'paused'): Promise<Campaign> {
  if (status === 'paused') await publisher().pause(c); else await publisher().resume(c);
  const next = { ...c, status, updated_at: now() }; await db().save('campaigns', next); await db().log('campaign.' + (status === 'paused' ? 'pause' : 'resume'), { id: c.id }); return next;
}
