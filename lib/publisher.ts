// Publisher adapters. Real Meta Marketing API and Google Ads API adapters plug in here once the app
// has API approval (Meta app review + business verification; Google Ads developer token). Until then the
// MockPublisher is used and every result is labelled as simulated.
import type { Campaign, Channel, PublishResult } from './types';
export interface Publisher {
  id: string; label: string; simulated: boolean;
  publish(c: Campaign): Promise<PublishResult>;
  pause(c: Campaign): Promise<void>;
  resume(c: Campaign): Promise<void>;
}
export const SIMULATED_NOTE = 'Simulated: real Meta/Google publishing needs API approval';
function hash(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(36); }
export class MockPublisher implements Publisher {
  id = 'mock'; label = 'Simulated publisher'; simulated = true;
  constructor(private delayMs = 600) {}
  private wait() { return new Promise(r => setTimeout(r, this.delayMs)); }
  async publish(c: Campaign): Promise<PublishResult> {
    const problems = checkPublishable(c); if (problems.length) throw new Error(problems.join(' '));
    await this.wait();
    const refs: Partial<Record<Channel, string>> = {};
    for (const ch of c.channels) refs[ch.channel] = `sim_${ch.channel.slice(0, 2)}_${hash(c.id + ch.channel)}`;
    return { adapter: this.id, simulated: true, refs, at: new Date().toISOString(), note: SIMULATED_NOTE };
  }
  async pause() { await this.wait(); }
  async resume() { await this.wait(); }
}
/** Checks the ad platforms would also make. */
export function checkPublishable(c: Campaign) {
  const p: string[] = [];
  if (!c.channels?.length) p.push('Pick at least one platform.');
  if (!(c.daily_budget >= 100)) p.push('Daily budget must be at least ₹100.');
  if (!c.copy?.headlines?.length) p.push('Add at least one headline.');
  if (!c.creative?.templateId) p.push('Choose a creative.');
  if (!c.audience?.locations?.length) p.push('Add a location.');
  if (c.copy?.headlines?.some(h => h.length > 40)) p.push('Headlines must be 40 characters or fewer.');
  return p;
}
let current: Publisher = new MockPublisher();
export const publisher = () => current;
export function setPublisher(p: Publisher) { current = p; }
