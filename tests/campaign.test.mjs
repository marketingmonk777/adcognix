import { test } from 'node:test'; import assert from 'node:assert';
import { load } from './_build.mjs';
const { fallbackCopy, parseCopy } = await load('copy');
const { TEMPLATES, renderSvg, wrap, esc } = await load('templates');
const { MockPublisher, checkPublishable, SIMULATED_NOTE } = await load('publisher');
const { simulate, simulateDay, totals, mockLeads } = await load('sim');
const { evaluate, apply } = await load('rules');
const inp = { name: 'Sharma Interiors', category: 'Interiors & home services', city: 'Bengaluru', objective: 'leads', offer: 'Free design visit' };
test('offline copy is deterministic and within limits', () => {
  const a = fallbackCopy(inp), b = fallbackCopy(inp); assert.deepEqual(a, b); assert.equal(a.source, 'offline');
  assert.ok(a.headlines.length >= 3 && a.headlines.every(h => h.length <= 40)); assert.ok(a.primary.every(p => p.length <= 250)); assert.ok(a.descriptions.every(d => d.length <= 90));
  assert.ok(a.hashtags.every(h => /^#[A-Za-z0-9]+$/.test(h))); assert.ok(a.keywords.some(k => k.includes('bengaluru'))); assert.equal(a.cta, 'Get quote');
  assert.ok(a.headlines[0].includes('Free design visit'));
});
test('offline copy covers every objective and unknown category', () => { for (const o of ['leads', 'calls', 'messages', 'traffic', 'awareness', 'installs']) { const c = fallbackCopy({ ...inp, category: 'Something new', objective: o }); assert.ok(c.headlines.length && c.cta); } });
test('parseCopy sanitises model output and rejects junk', () => {
  const c = parseCopy('Sure! {"headlines":["A <b>very</b> good headline that is definitely longer than forty chars"],"primary":["Hi"],"descriptions":[],"keywords":["k"],"hashtags":["tag one"],"cta":"Go"}', 'gemini');
  assert.ok(c && c.headlines[0].length <= 40 && !c.headlines[0].includes('<')); assert.equal(c.hashtags[0], '#tagone'); assert.equal(c.source, 'ai');
  assert.equal(parseCopy('no json here'), null); assert.equal(parseCopy('{"headlines":[]}'), null);
});
test('at least 12 original templates render square and story', () => {
  assert.ok(TEMPLATES.length >= 12); assert.equal(new Set(TEMPLATES.map(t => t.id)).size, TEMPLATES.length);
  const v = { name: 'A & B <Co>', headline: 'Hello world', sub: 'Sub', offer: '10% off', cta: 'Call now', color: '#2F5BFF', accent: '#FF6B4A', phone: '+91 90000 00000', city: 'Pune' };
  for (const t of TEMPLATES) for (const [w, h] of [[1080, 1080], [1080, 1920]]) { const s = renderSvg(t.id, v, w, h); assert.ok(s.startsWith('<svg') && s.includes('Hello world') && !s.includes('<Co>') && !/NaN|undefined/.test(s), t.id); }
  assert.ok(wrap('one two three four five six', 9).length >= 3); assert.equal(esc('<a&b>'), '&lt;a&amp;b&gt;');
});
const camp = (o = {}) => ({ id: 'c-1234567890', name: 'Test', objective: 'leads', channels: [{ channel: 'google', share: 50 }, { channel: 'facebook', share: 30 }, { channel: 'instagram', share: 20 }], daily_budget: 1000, duration_days: 14, start_date: '2026-11-17', status: 'active',
  creative: { templateId: 'bold-split', headline: '', sub: '', offer: '', color: '#2F5BFF', accent: '#FF6B4A' }, copy: { ...fallbackCopy(inp) }, audience: { locations: ['Bengaluru'], radiusKm: 10, ageMin: 25, ageMax: 50, gender: 'all', interests: [], languages: [] }, sim_days: 0, created_at: '2026-11-17T00:00:00Z', ...o });
test('mock publisher labels results as simulated and validates', async () => {
  const r = await new MockPublisher(0).publish(camp()); assert.equal(r.simulated, true); assert.equal(r.note, SIMULATED_NOTE); assert.deepEqual(Object.keys(r.refs).sort(), ['facebook', 'google', 'instagram']);
  await assert.rejects(new MockPublisher(0).publish(camp({ channels: [] }))); assert.ok(checkPublishable(camp({ copy: { ...camp().copy, headlines: [] } })).length);
});
test('simulation is deterministic and respects budget', () => {
  const c = camp({ sim_days: 7 }); assert.deepEqual(simulate(c), simulate(c)); const t = totals(simulate(c));
  assert.ok(t.spend <= 7 * 1000 && t.spend > 7 * 1000 * 0.8); assert.ok(t.impressions > 0 && t.clicks > 0);
  assert.equal(simulate(camp({ sim_days: 99, duration_days: 5 })).length, 5 * 3);
  const day0 = simulateDay(c, 0); assert.equal(day0.length, 3);
});
test('mock leads are examples with reserved numbers and stable ids', () => {
  const c = camp(); const l = mockLeads(c, 0, 3); assert.deepEqual(l.map(x => x.id), mockLeads(c, 0, 3).map(x => x.id));
  assert.ok(l.every(x => x.example && x.phone.startsWith('+9100000') && x.status === 'new' && x.campaign_id === c.id));
  assert.equal(mockLeads(camp({ objective: 'awareness' }), 0, 3).length, 0);
});
test('rules: high CPL suggests pause; apply pauses; applied rule is not repeated', () => {
  const c = camp({ sim_days: 5 }); const t = totals(simulate(c)); const s = evaluate(c, Math.max(1, t.cpr / 3));
  const p = s.find(x => x.action.type === 'pause'); assert.ok(p, 'pause suggested'); const after = apply(c, p); assert.equal(after.status, 'paused'); assert.ok(!evaluate(after, t.cpr / 3).some(x => x.id === p.id));
});
test('rules: budget shift moves points between channels and keeps 100%', () => {
  const c = camp({ sim_days: 6 }); const sh = { id: 'x', campaign_id: c.id, severity: 'medium', title: '', detail: '', action: { type: 'shift', from: 'instagram', to: 'google', points: 15 } };
  const n = apply(c, sh); assert.equal(n.channels.reduce((a, b) => a + b.share, 0), 100); assert.equal(n.channels.find(x => x.channel === 'google').share, 65); assert.deepEqual(n.applied, ['x']);
});
test('rules: low CPL suggests scaling, too little data suggests nothing', () => {
  const c = camp({ sim_days: 5 }); const t = totals(simulate(c)); assert.ok(evaluate(c, t.cpr * 3).some(x => x.action.type === 'budget'));
  assert.deepEqual(evaluate(camp({ sim_days: 1 }), 100), []); assert.deepEqual(evaluate(camp({ status: 'draft', sim_days: 5 }), 100), []);
});
