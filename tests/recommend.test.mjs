import { test } from 'node:test'; import assert from 'node:assert';
import { load } from './_build.mjs';
const { recommendSplit } = await load('recommend');
const { phoneOk, normPhone, emailOk } = await load('validate');
const { planSplit, suggestedChannels, validatePlan } = await load('campaign');
const { suggestAudience, audienceErrors } = await load('audience');
test('split sums to 100', () => { for (const c of ['Real estate', 'Healthcare & clinics', 'Other']) for (const g of ['leads', 'calls', 'messages', 'awareness']) for (const m of [3000, 20000]) assert.equal(recommendSplit(c, g, m).split.reduce((a, b) => a + b.share, 0), 100); });
test('search-heavy leans google', () => { const s = recommendSplit('Healthcare & clinics', 'leads', 20000).split; assert.equal(s.sort((a, b) => b.share - a.share)[0].channel, 'google'); });
test('small budget uses two channels', () => assert.equal(recommendSplit('Retail & fashion', 'leads', 3000).split.length, 2));
test('daily budget', () => assert.equal(recommendSplit('Other', 'leads', 30000).daily, 1000));
test('phone validation', () => { assert.ok(phoneOk('98450 12345')); assert.ok(!phoneOk('12345')); assert.equal(normPhone('9845012345'), '+919845012345'); });
test('email validation', () => { assert.ok(emailOk('a@b.co')); assert.ok(!emailOk('a@b')); });
test('planSplit over picked channels sums to 100', () => {
  for (const pick of [['facebook'], ['facebook', 'instagram'], ['google', 'facebook', 'instagram']]) { const s = planSplit('Real estate', 'leads', pick, 500); assert.equal(s.reduce((a, b) => a + b.share, 0), 100); assert.deepEqual(s.map(x => x.channel), pick); }
  assert.deepEqual(planSplit('Other', 'leads', [], 500), []);
});
test('WhatsApp goal never suggests Google', () => assert.ok(!suggestedChannels('Healthcare & clinics', 'messages', 1000).includes('google')));
test('plan validation', () => { assert.ok(validatePlan({ channels: [], daily_budget: 50, duration_days: 0 }).channels); assert.deepEqual(validatePlan({ channels: [{ channel: 'google', share: 100 }], daily_budget: 500, duration_days: 14 }), {}); });
test('audience suggestion is valid and editable', () => { const a = suggestAudience('Beauty & wellness', 'Mysuru', 'calls'); assert.deepEqual(audienceErrors(a), {}); assert.equal(a.locations[0], 'Mysuru'); assert.ok(audienceErrors({ ...a, ageMin: 70 }).age); });
