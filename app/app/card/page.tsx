'use client';
import { useEffect, useState } from 'react';
import { useSession } from '@/components/useSession';
import { AppShell } from '@/components/AppShell';
import { BizCard, MiniSite } from '@/components/CardView';
import { Icon, PlatformIcon } from '@/components/Icons';
import { toast } from '@/components/Toast';
import { db } from '@/lib/data';
import { base } from '@/lib/config';
import { encodeCard, sanitize, waHref, type CardData } from '@/lib/card';
import { phoneOk, emailOk } from '@/lib/validate';
export default function CardEditor() {
  const { ready, user, biz, setBiz } = useSession({ needBusiness: true });
  const [d, setD] = useState<CardData | null>(null); const [view, setView] = useState<'card' | 'site'>('card'); const [err, setErr] = useState<Record<string, string>>({}); const [svc, setSvc] = useState('');
  useEffect(() => { if (biz) setD(biz.settings?.card || { v: 1, name: biz.name, phone: biz.phone, whatsapp: biz.phone, website: biz.website?.startsWith('https://') ? biz.website : undefined, color: biz.brand_color || '#2F5BFF', logo: biz.logo_url, tagline: `${biz.category} in ${biz.city}`, address: biz.city, services: [], about: '' }); }, [biz]);
  if (!ready || !biz || !d) return <div className="main"><div className="skel" style={{ height: 300 }} /></div>;
  const set = (p: Partial<CardData>) => setD({ ...d, ...p });
  const F = (k: keyof CardData, label: string, ph = '', type = 'text') => (<div className="field"><label htmlFor={'cd' + k}>{label}</label><input id={'cd' + k} className="input" type={type} placeholder={ph} value={(d[k] as string) || ''} onChange={e => set({ [k]: e.target.value } as any)} />{err[k] && <span className="err">{err[k]}</span>}</div>);
  function validate() { const e: Record<string, string> = {}; if (!d!.name.trim()) e.name = 'Required'; if (!phoneOk(d!.phone)) e.phone = 'Enter a valid number'; if (d!.whatsapp && !phoneOk(d!.whatsapp)) e.whatsapp = 'Enter a valid number'; if (d!.email && !emailOk(d!.email)) e.email = 'Enter a valid email';
    if (d!.website && !/^https:\/\//.test(d!.website)) e.website = 'Start with https://'; if (d!.maps && !/^https:\/\//.test(d!.maps)) e.maps = 'Paste a https:// map link'; setErr(e); return !Object.keys(e).length; }
  const link = (v: 'card' | 'site') => { try { return `${location.origin}${base}/card/${v === 'site' ? '?v=site' : ''}#${encodeCard(d)}`; } catch { return ''; } };
  async function save() { if (!validate()) return; const clean = sanitize(d)!; const b = await db().saveBusiness({ settings: { ...(biz!.settings || {}), card: clean } }); setBiz(b); toast('Card saved'); }
  async function share(v: 'card' | 'site') { if (!validate()) return; await save(); const l = link(v); try { if (navigator.share) await navigator.share({ title: d!.name, url: l }); else { await navigator.clipboard.writeText(l); toast('Link copied'); } } catch { /* cancelled */ } }
  return (<AppShell user={user} title="Business card & mini website" actions={<button className="btn btn-primary btn-sm" onClick={save}>Save</button>}>
    <div className="card-editor">
      <div className="card"><h3>Details</h3><p className="muted small">One set of details powers both your digital card and a one-page website. Share the link anywhere; the details travel inside the link.</p>
        <div className="grid g2" style={{ gap: 12 }}>{F('name', 'Business name')}{F('tagline', 'Tagline', 'Modular kitchens and wardrobes')}{F('person', 'Your name')}{F('role', 'Role', 'Founder')}
          {F('phone', 'Phone')}{F('whatsapp', 'WhatsApp number')}{F('email', 'Email', '', 'email')}{F('website', 'Website', 'https://')}{F('instagram', 'Instagram handle', '@yourbusiness')}{F('hours', 'Hours', 'Mon–Sat, 10am–7pm')}</div>
        {F('address', 'Address')}{F('maps', 'Google Maps link', 'https://maps.app.goo.gl/…')}
        <div className="field"><label htmlFor="cdab">About (for the website)</label><textarea id="cdab" className="input" maxLength={600} value={d.about || ''} onChange={e => set({ about: e.target.value })} /></div>
        <div className="field"><label>Services</label><div className="tags">{(d.services || []).map(s => <span key={s} className="tag">{s}<button aria-label={'Remove ' + s} onClick={() => set({ services: (d.services || []).filter(x => x !== s) })}>×</button></span>)}</div>
          <form className="row" onSubmit={e => { e.preventDefault(); if (svc.trim() && (d.services || []).length < 8) { set({ services: [...(d.services || []), svc.trim().slice(0, 60)] }); setSvc(''); } }}><input className="input" style={{ flex: 1 }} value={svc} onChange={e => setSvc(e.target.value)} placeholder="Add a service" aria-label="Add a service" /><button className="btn btn-ghost btn-sm">Add</button></form></div>
        <div className="field"><label htmlFor="cdc">Colour</label><input id="cdc" type="color" className="color-in" value={d.color} onChange={e => set({ color: e.target.value })} /></div></div>
      <div className="card-stage"><div className="tabs" style={{ margin: 0 }}><button className={view === 'card' ? 'on' : ''} onClick={() => setView('card')}>Card</button><button className={view === 'site' ? 'on' : ''} onClick={() => setView('site')}>Mini website</button></div>
        {view === 'card' ? <BizCard d={d} /> : <div className="site-frame"><MiniSite d={d} /></div>}
        <div className="row" style={{ justifyContent: 'center' }}><button className="btn btn-primary btn-sm" onClick={() => share(view)}><Icon n="arrow" size={15} color="#fff" />Share {view === 'card' ? 'card' : 'website'} link</button>
          <a className="btn btn-ghost btn-sm" href={link(view)} target="_blank" rel="noopener">Open preview</a>
          <a className="btn btn-sm wa-btn" href={waHref('', link(view))} target="_blank" rel="noopener"><PlatformIcon p="whatsapp" size={14} mono="#fff" />Send</a></div>
        <p className="small muted" style={{ textAlign: 'center', margin: 0 }}>Anyone with the link can see these details.</p></div>
    </div>
  </AppShell>);
}
