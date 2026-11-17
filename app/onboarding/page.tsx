'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/data';
import { useSession } from '@/components/useSession';
import { CATEGORIES, GOALS, BRAND_COLORS, Business } from '@/lib/types';
import { req, phoneOk, normPhone, clean } from '@/lib/validate';
import { Logo } from '@/components/Logo';

export default function Onboarding() {
  const r = useRouter(); const { ready, biz } = useSession();
  const [step, setStep] = useState(0); const [busy, setBusy] = useState(false); const [err, setErr] = useState<Record<string, string>>({});
  const [f, setF] = useState<Partial<Business>>({ name: '', category: '', city: '', phone: '', website: '', brand_color: BRAND_COLORS[0], goal: 'leads', monthly_budget: 10000 });
  useEffect(() => { if (biz) setF({ ...f, ...biz }); }, [biz]); // eslint-disable-line
  const set = (k: keyof Business, v: any) => setF({ ...f, [k]: v });
  function check(s: number) {
    const e: Record<string, string> = {};
    if (s === 0) { if (!req(f.name)) e.name = 'Enter your business name'; if (!f.category) e.category = 'Pick a category'; if (!req(f.city)) e.city = 'Enter your city'; }
    if (s === 1) { if (!phoneOk(f.phone || '')) e.phone = 'Enter a valid mobile number'; if (f.website && !/^https?:\/\/\S+\.\S+/.test(f.website)) e.website = 'Start with https://'; }
    if (s === 2) { if (!f.monthly_budget || f.monthly_budget < 1000) e.monthly_budget = 'Minimum ₹1,000 a month'; }
    setErr(e); return !Object.keys(e).length;
  }
  async function finish() {
    if (!check(2)) return; setBusy(true);
    try { await db().saveBusiness({ ...f, name: clean(f.name!, 120), city: clean(f.city!, 60), phone: normPhone(f.phone!), website: f.website ? clean(f.website, 200) : undefined }); r.replace('/app/'); }
    catch (x: any) { setErr({ form: x?.message || 'Could not save. Try again.' }); setBusy(false); }
  }
  if (!ready) return <div className="auth-wrap"><div className="skel" style={{ width: 320, height: 220 }} /></div>;
  const E = (k: string) => err[k] && <span className="err">{err[k]}</span>;
  return (<div className="auth-wrap"><div className="auth-card" style={{ width: 'min(520px,100%)' }}>
    <div style={{ marginBottom: 24 }}><Logo /></div>
    <div className="card">
      <div className="steps">{[0, 1, 2].map(i => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
      {step === 0 && (<><h2 style={{ fontSize: 24 }}>About your business</h2><p className="muted small">This shapes your ad suggestions.</p>
        <div className="field"><label htmlFor="n">Business name</label><input id="n" className="input" value={f.name} onChange={e => set('name', e.target.value)} />{E('name')}</div>
        <div className="field"><label htmlFor="c">Category</label><select id="c" className="input" value={f.category} onChange={e => set('category', e.target.value)}><option value="">Select</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>{E('category')}</div>
        <div className="field"><label htmlFor="ci">City</label><input id="ci" className="input" value={f.city} onChange={e => set('city', e.target.value)} placeholder="Bengaluru" />{E('city')}</div></>)}
      {step === 1 && (<><h2 style={{ fontSize: 24 }}>Contact and brand</h2><p className="muted small">Customers will call or WhatsApp this number.</p>
        <div className="field"><label htmlFor="p">Business mobile</label><input id="p" className="input" inputMode="tel" value={f.phone} onChange={e => set('phone', e.target.value)} />{E('phone')}</div>
        <div className="field"><label htmlFor="w">Website (optional)</label><input id="w" className="input" value={f.website} onChange={e => set('website', e.target.value)} placeholder="https://" />{E('website')}</div>
        <div className="field"><label>Brand colour</label><div className="row">{BRAND_COLORS.map(c => <button type="button" key={c} aria-label={c} className={'swatch' + (f.brand_color === c ? ' on' : '')} style={{ background: c }} onClick={() => set('brand_color', c)} />)}</div></div></>)}
      {step === 2 && (<><h2 style={{ fontSize: 24 }}>Goal and budget</h2><p className="muted small">You can change these for every campaign.</p>
        <div className="field"><label>Main goal</label><div className="grid g2" style={{ gap: 8 }}>{GOALS.map(g => <button type="button" key={g.id} className={'btn ' + (f.goal === g.id ? 'btn-dark' : 'btn-ghost')} onClick={() => set('goal', g.id)}>{g.label}</button>)}</div></div>
        <div className="field"><label htmlFor="b">Monthly ad budget (₹)</label><input id="b" className="input" type="number" min={1000} step={500} value={f.monthly_budget} onChange={e => set('monthly_budget', Number(e.target.value))} />{E('monthly_budget')}
          <span className="small muted">Paid to the ad platforms. AdCognix suggests how to split it.</span></div></>)}
      {err.form && <p className="err">{err.form}</p>}
      <div className="row" style={{ justifyContent: 'space-between', marginTop: 8 }}>
        {step > 0 ? <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button> : <span />}
        {step < 2 ? <button className="btn btn-primary" onClick={() => check(step) && setStep(step + 1)}>Continue</button>
          : <button className="btn btn-primary" onClick={finish} disabled={busy}>{busy ? 'Saving…' : 'Finish setup'}</button>}
      </div>
    </div></div></div>);
}
