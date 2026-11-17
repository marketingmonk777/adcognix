'use client';
import { useState } from 'react';
import { db } from '@/lib/data';
import { phoneOk, req, normPhone, clean } from '@/lib/validate';
export function ConsultForm({ source = 'website' }: { source?: string }) {
  const [f, setF] = useState({ business_name: '', phone: '', city: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'fail'>('idle');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!req(f.business_name)) er.business_name = 'Enter your business name';
    if (!phoneOk(f.phone)) er.phone = 'Enter a valid 10-digit mobile number';
    setErr(er); if (Object.keys(er).length) return;
    setState('busy');
    try { await db().createConsult({ business_name: clean(f.business_name, 120), phone: normPhone(f.phone), city: clean(f.city, 60), source }); setState('done'); }
    catch { setState('fail'); }
  }
  if (state === 'done') return (<div className="card"><h3>Thanks, we have your details.</h3><p className="muted">An AdCognix specialist will call you within one working day to plan your first campaign.</p></div>);
  return (<form className="card" onSubmit={submit} noValidate>
    <h3>Talk to an ads specialist</h3><p className="muted small">Free 20-minute call. We will look at your business and suggest where to advertise.</p>
    <div className="field"><label htmlFor="cb">Business name</label><input id="cb" className="input" value={f.business_name} onChange={e => setF({ ...f, business_name: e.target.value })} />{err.business_name && <span className="err">{err.business_name}</span>}</div>
    <div className="field"><label htmlFor="cp">Mobile number</label><input id="cp" className="input" inputMode="tel" value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="98xxxxxxxx" />{err.phone && <span className="err">{err.phone}</span>}</div>
    <div className="field"><label htmlFor="cc">City (optional)</label><input id="cc" className="input" value={f.city} onChange={e => setF({ ...f, city: e.target.value })} /></div>
    <button className="btn btn-primary" style={{ width: '100%' }} disabled={state === 'busy'}>{state === 'busy' ? 'Sending…' : 'Request a call'}</button>
    {state === 'fail' && <p className="err" style={{ marginTop: 8 }}>Could not send right now. Please call or WhatsApp us instead.</p>}
  </form>);
}
