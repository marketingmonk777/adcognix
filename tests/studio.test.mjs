import { test } from 'node:test'; import assert from 'node:assert';
import { load } from './_build.mjs';
const { FESTIVALS, fillCaption, upcoming, nthWeekday } = await load('festivals');
const { postSvg } = await load('posts');
const { encodeCard, decodeCard, sanitize, vcard } = await load('card');
test('festival calendar covers 2026–2027 with valid, sorted dates', () => {
  assert.ok(FESTIVALS.length >= 80); const ds = FESTIVALS.map(f => f.date); assert.deepEqual([...ds].sort(), ds);
  for (const f of FESTIVALS) { assert.match(f.date, /^202[67]-\d\d-\d\d$/); assert.ok(!isNaN(new Date(f.date + 'T00:00:00Z'))); assert.ok(f.caption.includes('{b}')); }
});
test('key dates match the DoPT holiday lists', () => {
  const at = n => FESTIVALS.filter(f => f.name === n).map(f => f.date);
  assert.deepEqual(at('Diwali'), ['2026-11-08', '2027-10-29']); assert.deepEqual(at('Holi'), ['2026-03-04', '2027-03-23']);
  assert.deepEqual(at('Dussehra'), ['2026-10-20', '2027-10-09']); assert.deepEqual(at('Republic Day'), ['2026-01-26', '2027-01-26']);
  assert.ok(FESTIVALS.find(f => f.name === 'Id-ul-Fitr').moon);
});
test('computed business days', () => { assert.equal(nthWeekday(2026, 5, 0, 2), 10); assert.ok(FESTIVALS.some(f => f.name === "Mother's Day" && f.date === '2026-05-10')); assert.ok(FESTIVALS.some(f => f.name === 'Black Friday sale season' && f.date === '2026-11-27')); });
test('captions fill business name and city, hashtags are clean', () => {
  const c = fillCaption(FESTIVALS.find(f => f.name === 'Diwali'), { name: 'Sharma Interiors', city: 'Bengaluru' });
  assert.ok(c.text.includes('Sharma Interiors') && !c.text.includes('{')); assert.ok(c.hashtags.includes('#Bengaluru') && c.hashtags.every(h => /^#[A-Za-z0-9]+$/.test(h)));
  assert.equal(upcoming('2026-11-17', 2)[0].date >= '2026-11-17', true);
});
test('post SVG renders all styles and escapes text', () => { const f = FESTIVALS[0]; for (const s of [0, 1, 2]) { const svg = postSvg(f, { name: 'A<B', city: 'Pune', brand_color: '#14B88F' }, 'Hi & welcome', s); assert.ok(svg.startsWith('<svg') && svg.includes('A&lt;B') && svg.includes('Hi &amp; welcome') && !/NaN|undefined/.test(svg)); } });
test('business card link round-trips and is sanitised', () => {
  const d = { v: 1, name: 'Sharma Interiors', phone: '+919845012345', color: '#2F5BFF', services: ['Kitchens', 'Wardrobes'], website: 'https://example.in', about: 'नमस्ते — we design homes' };
  const back = decodeCard('#' + encodeCard(d)); assert.equal(back.name, d.name); assert.deepEqual(back.services, d.services); assert.equal(back.about, d.about);
  assert.equal(sanitize({ ...d, website: 'javascript:alert(1)' }).website, undefined); assert.equal(sanitize({ ...d, color: 'red' }).color, '#2F5BFF'); assert.equal(sanitize({ ...d, name: '<script>x' }).name, 'scriptx');
  assert.equal(decodeCard('#garbage!!'), null); assert.equal(sanitize({ phone: '1' }), null); assert.ok(vcard(back).includes('TEL;TYPE=CELL:+919845012345'));
});
