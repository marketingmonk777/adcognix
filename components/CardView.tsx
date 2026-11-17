'use client';
import { useState } from 'react';
import { PlatformIcon, Icon } from './Icons';
import { telHref, waHref, vcard, type CardData } from '@/lib/card';
import { initials, onColor, mix } from '@/lib/templates';
export function BizCard({ d }: { d: CardData }) {
  const ink = onColor(d.color);
  return (<div className="bcard" style={{ ['--bc' as any]: d.color, ['--bci' as any]: ink, ['--bc2' as any]: mix(d.color, '#0B1B3F', 0.4) }}>
    <div className="bc-top"><span className="bc-logo">{d.logo ? <img src={d.logo} alt="" /> : initials(d.name)}</span><div><b>{d.name}</b>{d.tagline && <i>{d.tagline}</i>}</div></div>
    {(d.person || d.role) && <div className="bc-person"><b>{d.person}</b><span>{d.role}</span></div>}
    <div className="bc-actions">
      <a href={telHref(d.phone)} className="bc-btn"><Icon n="phone" size={18} /><span>Call</span></a>
      <a href={waHref(d.whatsapp || d.phone, `Hi ${d.name}`)} target="_blank" rel="noopener" className="bc-btn"><PlatformIcon p="whatsapp" size={18} mono="currentColor" /><span>WhatsApp</span></a>
      {d.email && <a href={'mailto:' + d.email} className="bc-btn"><Icon n="inbox" size={18} /><span>Email</span></a>}
      {d.maps && <a href={d.maps} target="_blank" rel="noopener" className="bc-btn"><Icon n="target" size={18} /><span>Directions</span></a>}
    </div>
    <div className="bc-lines">{[d.phone, d.email, d.website?.replace(/^https:\/\//, ''), d.address, d.hours].filter(Boolean).map(x => <div key={x}>{x}</div>)}</div>
  </div>);
}
export function SaveContact({ d }: { d: CardData }) {
  return <button className="btn btn-dark" onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([vcard(d)], { type: 'text/vcard' })); a.download = d.name.replace(/[^a-z0-9]+/gi, '-') + '.vcf'; a.click(); }}><Icon n="download" size={16} color="#fff" />Save contact</button>;
}
export function MiniSite({ d }: { d: CardData }) {
  const [sent, setSent] = useState(false); const [m, setM] = useState('');
  return (<div className="msite" style={{ ['--bc' as any]: d.color, ['--bci' as any]: onColor(d.color) }}>
    <header className="ms-hero"><span className="bc-logo lg">{d.logo ? <img src={d.logo} alt="" /> : initials(d.name)}</span><h1>{d.name}</h1>{d.tagline && <p>{d.tagline}</p>}
      <div className="row" style={{ justifyContent: 'center' }}><a className="btn ms-btn" href={telHref(d.phone)}>Call {d.phone}</a><a className="btn ms-btn2" href={waHref(d.whatsapp || d.phone, `Hi ${d.name}`)} target="_blank" rel="noopener">WhatsApp us</a></div></header>
    {d.about && <section className="ms-sec"><h2>About us</h2><p>{d.about}</p></section>}
    {!!d.services?.length && <section className="ms-sec"><h2>What we offer</h2><div className="ms-svcs">{d.services.map(s => <div key={s} className="ms-svc"><Icon n="check" size={16} />{s}</div>)}</div></section>}
    <section className="ms-sec"><h2>Visit or contact</h2><div className="ms-contact">
      {d.address && <div><b>Address</b><span>{d.address}</span>{d.maps && <a href={d.maps} target="_blank" rel="noopener">Get directions</a>}</div>}
      {d.hours && <div><b>Hours</b><span>{d.hours}</span></div>}
      <div><b>Phone</b><a href={telHref(d.phone)}>{d.phone}</a></div>{d.email && <div><b>Email</b><a href={'mailto:' + d.email}>{d.email}</a></div>}
      {d.instagram && <div><b>Instagram</b><a href={'https://instagram.com/' + d.instagram} target="_blank" rel="noopener">@{d.instagram}</a></div>}</div></section>
    <section className="ms-sec"><h2>Send an enquiry</h2>{sent ? <p>Opening WhatsApp with your message…</p> : <form onSubmit={e => { e.preventDefault(); if (!m.trim()) return; setSent(true); window.open(waHref(d.whatsapp || d.phone, m), '_blank'); }} className="row"><input className="input" style={{ flex: 1 }} value={m} onChange={e => setM(e.target.value)} placeholder="Hi, I would like to know…" aria-label="Your message" /><button className="btn ms-btn">Send on WhatsApp</button></form>}</section>
    <footer className="ms-foot">© {new Date().getFullYear()} {d.name} · Made with AdCognix</footer>
  </div>);
}
