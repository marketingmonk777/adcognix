'use client';
import { useEffect, useState } from 'react';
import { useSession } from '@/components/useSession';
import { AppShell } from '@/components/AppShell';
import { db, resetDb } from '@/lib/data';
import { getBackend, setBackend } from '@/lib/config';
import { CATEGORIES, GOALS, BRAND_COLORS, Business } from '@/lib/types';
import { PROVIDERS, AI_TASKS, AiSettings, ProviderId } from '@/lib/ai';
import { req, phoneOk, normPhone, clean } from '@/lib/validate';
import { toast } from '@/components/Toast';

export default function Settings() {
  const { ready, user, biz, setBiz } = useSession({ needBusiness: true });
  const [f, setF] = useState<Partial<Business>>({}); const [err, setErr] = useState<Record<string, string>>({});
  const [be, setBe] = useState({ url: '', key: '' }); const [beErr, setBeErr] = useState('');
  const [ai, setAi] = useState<AiSettings>({ provider: 'gemini', model: 'gemini-2.5-flash', perTask: {} });
  useEffect(() => { if (biz) { setF(biz); if (biz.settings?.ai) setAi(biz.settings.ai); } const b = getBackend(); if (b) setBe(b); }, [biz]);
  if (!ready || !biz) return <div className="main"><div className="skel" style={{ height: 200 }} /></div>;
  const set = (k: keyof Business, v: any) => setF({ ...f, [k]: v });
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault(); const er: Record<string, string> = {};
    if (!req(f.name)) er.name = 'Required'; if (!req(f.city)) er.city = 'Required'; if (!phoneOk(f.phone || '')) er.phone = 'Enter a valid mobile number';
    setErr(er); if (Object.keys(er).length) return;
    try { const b = await db().saveBusiness({ name: clean(f.name!, 120), category: f.category, city: clean(f.city!, 60), phone: normPhone(f.phone!), website: f.website, brand_color: f.brand_color, goal: f.goal, monthly_budget: Number(f.monthly_budget) }); setBiz(b); toast('Profile saved'); }
    catch (x: any) { toast(x?.message || 'Could not save'); }
  }
  async function saveAi() { try { const b = await db().saveBusiness({ settings: { ...(biz!.settings || {}), ai } }); setBiz(b); toast('AI settings saved'); } catch (x: any) { toast(x?.message || 'Could not save'); } }
  function connect(e: React.FormEvent) {
    e.preventDefault(); setBeErr('');
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(be.url.trim())) return setBeErr('Use your project URL, like https://abcd.supabase.co');
    try { setBackend({ url: be.url.trim().replace(/\/$/, ''), key: be.key.trim() }); resetDb(); toast('Connected. Sign in again to use your cloud workspace.'); setTimeout(() => location.assign(location.pathname.replace(/app\/settings\/?$/, 'login/')), 900); }
    catch (x: any) { setBeErr(x.message); }
  }
  const prov = (id: ProviderId) => PROVIDERS.find(p => p.id === id)!;
  return (<AppShell user={user} title="Settings">
    <div className="grid" style={{ gap: 24, maxWidth: 760 }}>
      <form className="card" onSubmit={saveProfile} noValidate><h3>Business profile</h3>
        <div className="grid g2" style={{ gap: 12 }}>
          <div className="field"><label htmlFor="n">Business name</label><input id="n" className="input" value={f.name || ''} onChange={e => set('name', e.target.value)} />{err.name && <span className="err">{err.name}</span>}</div>
          <div className="field"><label htmlFor="c">Category</label><select id="c" className="input" value={f.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
          <div className="field"><label htmlFor="ci">City</label><input id="ci" className="input" value={f.city || ''} onChange={e => set('city', e.target.value)} />{err.city && <span className="err">{err.city}</span>}</div>
          <div className="field"><label htmlFor="p">Mobile</label><input id="p" className="input" value={f.phone || ''} onChange={e => set('phone', e.target.value)} />{err.phone && <span className="err">{err.phone}</span>}</div>
          <div className="field"><label htmlFor="g">Main goal</label><select id="g" className="input" value={f.goal} onChange={e => set('goal', e.target.value)}>{GOALS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}</select></div>
          <div className="field"><label htmlFor="b">Monthly budget (₹)</label><input id="b" type="number" min={1000} className="input" value={f.monthly_budget || ''} onChange={e => set('monthly_budget', e.target.value)} /></div>
        </div>
        <div className="field"><label>Brand colour</label><div className="row">{BRAND_COLORS.map(c => <button type="button" key={c} aria-label={c} className={'swatch' + (f.brand_color === c ? ' on' : '')} style={{ background: c }} onClick={() => set('brand_color', c)} />)}</div></div>
        <button className="btn btn-primary">Save profile</button></form>

      <div className="card" id="ai"><h3>AI provider</h3><p className="muted small">AdCognix works with any of these. Switch at any time; keys stay on the server, never in the browser.</p>
        <div className="grid g2" style={{ gap: 12 }}>
          <div className="field"><label htmlFor="ap">Default provider</label><select id="ap" className="input" value={ai.provider} onChange={e => { const p = e.target.value as ProviderId; setAi({ ...ai, provider: p, model: prov(p).models[0] }); }}>
            {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}{p.free ? ' · free tier' : ''}</option>)}</select><span className="small muted">{prov(ai.provider).note}</span></div>
          <div className="field"><label htmlFor="am">Model</label><select id="am" className="input" value={ai.model} onChange={e => setAi({ ...ai, model: e.target.value })}>{prov(ai.provider).models.map(m => <option key={m}>{m}</option>)}</select></div>
        </div>
        <details style={{ marginBottom: 14 }}><summary className="small" style={{ cursor: 'pointer' }}>Use a different provider for a specific task</summary>
          {AI_TASKS.map(t => { const v = ai.perTask?.[t.id]; return (<div key={t.id} className="row" style={{ margin: '10px 0' }}><span style={{ width: 200 }} className="small">{t.label}</span>
            <select className="input" style={{ width: 220 }} value={v?.provider || ''} onChange={e => { const pt = { ...(ai.perTask || {}) }; if (!e.target.value) delete pt[t.id]; else pt[t.id] = { provider: e.target.value as ProviderId, model: prov(e.target.value as ProviderId).models[0] }; setAi({ ...ai, perTask: pt }); }}>
              <option value="">Same as default</option>{PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>); })}
        </details>
        <button className="btn btn-primary" onClick={saveAi}>Save AI settings</button></div>

      <form className="card" id="backend" onSubmit={connect}><h3>Cloud workspace</h3>
        <p className="muted small">{db().mode === 'cloud' ? 'Connected. Your data is stored in your Supabase project.' : 'You are in demo mode: data stays in this browser. Connect a free Supabase project to save it securely and invite your team.'}</p>
        <div className="field"><label htmlFor="u">Project URL</label><input id="u" className="input" value={be.url} onChange={e => setBe({ ...be, url: e.target.value })} placeholder="https://xxxx.supabase.co" /></div>
        <div className="field"><label htmlFor="k">Publishable key</label><input id="k" className="input" value={be.key} onChange={e => setBe({ ...be, key: e.target.value })} placeholder="sb_publishable_…" /><span className="small muted">Only the publishable key. Never paste a secret or service_role key.</span></div>
        {beErr && <p className="err">{beErr}</p>}
        <div className="row"><button className="btn btn-primary">Connect</button>
          {db().mode === 'cloud' && <button type="button" className="btn btn-ghost" onClick={() => { setBackend(null); resetDb(); location.reload(); }}>Disconnect</button>}</div>
      </form>
    </div>
  </AppShell>);
}
