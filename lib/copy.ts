// Ad copy: AI gateway first (when a cloud workspace and provider are set up), deterministic offline writer otherwise.
import type { AdCopy, Objective } from './types';
export type CopyInput = { name: string; category: string; city: string; objective: Objective; offer?: string; usp?: string };

const CAT: Record<string, { noun: string; kw: string[]; tags: string[]; benefit: string }> = {
  'Real estate': { noun: 'homes', kw: ['flats for sale', '2bhk apartment', '3bhk flat', 'new projects', 'ready to move flats', 'villa plots'], tags: ['RealEstate', 'DreamHome', 'NewHome'], benefit: 'site visits on your schedule' },
  'Education & coaching': { noun: 'courses', kw: ['coaching classes', 'tuition centre', 'entrance exam coaching', 'online classes', 'skill courses'], tags: ['Education', 'Coaching', 'Learning'], benefit: 'small batches and a free demo class' },
  'Healthcare & clinics': { noun: 'care', kw: ['clinic near me', 'doctor appointment', 'health check up', 'specialist consultation', 'diagnostic centre'], tags: ['Healthcare', 'Wellness', 'Clinic'], benefit: 'easy appointments and experienced doctors' },
  'Restaurants & cafés': { noun: 'food', kw: ['restaurant near me', 'best cafe', 'family restaurant', 'home delivery food', 'party hall booking'], tags: ['Foodie', 'Cafe', 'EatLocal'], benefit: 'fresh food made to order' },
  'Retail & fashion': { noun: 'collections', kw: ['clothing store', 'ethnic wear', 'fashion boutique', 'new arrivals', 'saree shop'], tags: ['Fashion', 'ShopLocal', 'NewArrivals'], benefit: 'new arrivals every week' },
  'Beauty & wellness': { noun: 'treatments', kw: ['salon near me', 'bridal makeup', 'spa', 'hair spa', 'skin care clinic'], tags: ['Beauty', 'SelfCare', 'Salon'], benefit: 'trained stylists and hygienic care' },
  'Finance & insurance': { noun: 'plans', kw: ['health insurance', 'term insurance', 'home loan', 'tax filing', 'mutual fund advisor'], tags: ['FinancialPlanning', 'Insurance', 'MoneyMatters'], benefit: 'clear advice with no jargon' },
  'Interiors & home services': { noun: 'interiors', kw: ['interior designer', 'modular kitchen', 'home renovation', 'wardrobe design', '2bhk interiors'], tags: ['InteriorDesign', 'HomeDecor', 'ModularKitchen'], benefit: 'a free design consultation' },
  'Manufacturing & B2B': { noun: 'solutions', kw: ['manufacturer', 'bulk supplier', 'industrial supplies', 'oem supplier', 'wholesale price'], tags: ['MakeInIndia', 'B2B', 'Manufacturing'], benefit: 'bulk pricing and on-time delivery' },
  'Travel & hospitality': { noun: 'trips', kw: ['tour packages', 'holiday packages', 'hotel booking', 'weekend getaway', 'honeymoon package'], tags: ['Travel', 'Holiday', 'Getaway'], benefit: 'packages planned end to end' },
  'Automobile': { noun: 'vehicles', kw: ['car service', 'used cars', 'bike showroom', 'car accessories', 'test drive'], tags: ['Auto', 'Cars', 'TestDrive'], benefit: 'transparent pricing and quick service' },
  'Events & weddings': { noun: 'events', kw: ['wedding planner', 'event management', 'decorators', 'birthday party planner', 'banquet hall'], tags: ['WeddingPlanning', 'Events', 'Celebrations'], benefit: 'planning, décor and coordination in one place' },
};
const DEF = { noun: 'services', kw: ['near me', 'best service', 'affordable', 'trusted', 'local business'], tags: ['ShopLocal', 'SmallBusiness'], benefit: 'friendly, reliable service' };
const ACTION: Record<Objective, { verb: string; cta: string }> = {
  leads: { verb: 'Get a free quote', cta: 'Get quote' }, calls: { verb: 'Call us today', cta: 'Call now' },
  messages: { verb: 'Message us on WhatsApp', cta: 'Send message' }, traffic: { verb: 'See the details online', cta: 'Learn more' },
  awareness: { verb: 'Say hello next time you are nearby', cta: 'Learn more' }, installs: { verb: 'Download the app', cta: 'Install now' },
};
const tag = (s: string) => '#' + s.replace(/[^A-Za-z0-9]/g, '');
const cap = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');

/** Offline writer: same input, same output. No network, no provider needed. */
export function fallbackCopy(i: CopyInput): AdCopy {
  const c = CAT[i.category] || DEF; const a = ACTION[i.objective] || ACTION.leads;
  const city = i.city.trim() || 'your city'; const name = i.name.trim() || 'Our business'; const offer = (i.offer || '').trim();
  const headlines = [
    offer ? cap(`${offer} at ${name}`, 40) : cap(`${name}, ${city}`, 40),
    cap(`${c.noun[0].toUpperCase() + c.noun.slice(1)} in ${city}`, 40),
    cap(a.verb, 40),
  ];
  const primary = [
    `Looking for ${c.noun} in ${city}? ${name} offers ${c.benefit}.${offer ? ' ' + offer + '.' : ''} ${a.verb}.`,
    `${name} is a ${i.category.toLowerCase()} name people in ${city} trust. ${a.verb} and we will take it from there.`,
  ].map(s => cap(s.replace(/\s+/g, ' '), 250));
  const descriptions = [cap(`${c.benefit[0].toUpperCase() + c.benefit.slice(1)}. ${a.verb}.`, 90), cap(`Serving ${city}. ${offer || 'Talk to us today'}.`, 90)];
  const keywords = Array.from(new Set([...c.kw.slice(0, 4).map(k => `${k} ${city.toLowerCase()}`), ...c.kw.slice(0, 3), `${name.toLowerCase()}`]));
  const hashtags = Array.from(new Set([...c.tags.map(tag), tag(city), tag(name), tag(city + c.tags[0])])).slice(0, 8);
  return { headlines, primary, descriptions, keywords, hashtags, cta: a.cta, source: 'offline' };
}

export function copyPrompt(i: CopyInput) {
  return {
    system: 'You write short, honest ad copy for small Indian businesses. No exaggerated claims, no guarantees, no competitor names. Return JSON only.',
    prompt: `Business: ${i.name}\nCategory: ${i.category}\nCity: ${i.city}\nGoal: ${i.objective}\nOffer: ${i.offer || 'none'}\n` +
      'Return JSON with keys: headlines (3, max 40 chars), primary (2, max 250 chars), descriptions (2, max 90 chars), keywords (8 search phrases), hashtags (8, with #), cta (2-3 words).',
  };
}
/** Parse and sanitise a model reply; returns null when it is unusable. */
export function parseCopy(text: string, provider?: string): AdCopy | null {
  try {
    const m = text.match(/\{[\s\S]*\}/); if (!m) return null; const j = JSON.parse(m[0]);
    const arr = (v: unknown, n: number, max: number) => (Array.isArray(v) ? v : []).map(x => cap(String(x).replace(/[<>]/g, '').trim(), max)).filter(Boolean).slice(0, n);
    const out: AdCopy = { headlines: arr(j.headlines, 5, 40), primary: arr(j.primary, 3, 250), descriptions: arr(j.descriptions, 3, 90), keywords: arr(j.keywords, 12, 60),
      hashtags: arr(j.hashtags, 10, 40).map(h => (h.startsWith('#') ? h : '#' + h).replace(/\s/g, '')), cta: cap(String(j.cta || 'Learn more'), 20), source: 'ai', provider };
    return out.headlines.length && out.primary.length ? out : null;
  } catch { return null; }
}
