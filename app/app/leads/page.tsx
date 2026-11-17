'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/useSession';
import { AppShell, Empty } from '@/components/AppShell';
import { PlatformIcon, Icon } from '@/components/Icons';
import { toast } from '@/components/Toast';
import { db, uid } from '@/lib/data';
import { downloadCsv } from '@/lib/png';
import { phoneOk, normPhone, clean, req } from '@/lib/validate';
import { CHANNEL_LABEL } from '@/lib/campaign';
import { LEAD_STATUSES, type Lead, type LeadNote, type LeadStatus, type Campaign } from '@/lib/types';
const ST: Record<LeadStatus, string> = { new: 'coral', contacted: '', qualified: 'mint', won: 'mint', lost: 'grey' };
const when = (s: string) => new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
export default function Leads() {
  const { ready, user } = useSession({ needBusiness: true });
  const [rows, setRows] = useState<Lead[] | null>(null); const [camps, setCamps] = useState<Campaign[]>([]); const [notes, setNotes] = useState<LeadNote[]>([]);
  const [f, setF] = useState<'all' | LeadStatus>('all'); const [q, setQ] = useState(''); const [sel, setSel] = useState<string | null>(null); const [note, setNote] = useState('');
  const [add, setAdd] = useState(false); const [nl, setNl] = useState({ name: '', phone: '', message: '' }); const [err, setErr] = useState<Record<string, string>>({});
  const load = async () => { const [l, c, n] = await Promise.all([db().list<Lead>('leads'), db().list<Campaign>('campaigns'), db().list<LeadNote>('lead_notes')]); setRows(l); setCamps(c); setNotes(n); };
  useEffect(() => { if (ready) load().catch(e => { toast(e.message); setRows([]); }); }, [ready]);
  const list = useMemo(() => (rows || []).filter(l => (f === 'all' || l.status === f) && (!q || (l.name + l.phone + (l.message || '')).toLowerCase().includes(q.toLowerCase()))), [rows, f, q]);
  if (!ready) return <div className="main"><div className="skel" style={{ height: 200 }} /></div>;
  const lead = (rows || []).find(l => l.id === sel) || null; const cname = (id?: string | null) => camps.find(c => c.id === id)?.name;
  async function setStatus(l: Lead, s: LeadStatus) { await db().save('leads', { ...l, status: s, updated_at: new Date().toISOString() }); await db().log('lead.status', { id: l.id, status: s }); await load(); toast(`Marked ${s}`); }
  async function addNote(e: React.FormEvent) { e.preventDefault(); if (!lead || !note.trim()) return; await db().save<LeadNote>('lead_notes', { id: uid(), lead_id: lead.id, text: clean(note, 1000), created_at: new Date().toISOString() }); setNote(''); await load(); }
  async function addLead(e: React.FormEvent) {
    e.preventDefault(); const er: Record<string, string> = {}; if (!req(nl.name)) er.name = 'Enter a name'; if (!phoneOk(nl.phone)) er.phone = 'Enter a valid mobile number'; setErr(er); if (Object.keys(er).length) return;
    await db().save<Lead>('leads', { id: uid(), name: clean(nl.name, 80), phone: normPhone(nl.phone), message: clean(nl.message, 500), status: 'new', created_at: new Date().toISOString(), campaign_id: null }); setAdd(false); setNl({ name: '', phone: '', message: '' }); await load(); toast('Lead added');
  }
  const csv = () => downloadCsv([['Name', 'Phone', 'Status', 'Message', 'Channel', 'Campaign', 'Example data', 'Received'], ...list.map(l => [l.name, l.phone, l.status, l.message, l.channel ? CHANNEL_LABEL[l.channel] : '', cname(l.campaign_id) || '', l.example ? 'yes' : 'no', l.created_at])], 'adcognix-leads.csv');
  const tel = (p: string) => 'tel:' + p.replace(/[^\d+]/g, ''); const wa = (p: string) => 'https://wa.me/' + p.replace(/\D/g, '');
  return (<AppShell user={user} title="Leads" actions={<><button className="btn btn-ghost btn-sm" onClick={() => setAdd(true)}><Icon n="plus" size={15} />Add lead</button><button className="btn btn-ghost btn-sm" onClick={csv} disabled={!list.length}><Icon n="download" size={15} />Export CSV</button></>}>
    <div className="row" style={{ justifyContent: 'space-between', marginBottom: 14 }}>
      <div className="tabs" role="tablist" style={{ margin: 0 }}>{(['all', ...LEAD_STATUSES] as const).map(s => <button key={s} role="tab" aria-selected={f === s} className={f === s ? 'on' : ''} onClick={() => setF(s)}>{s[0].toUpperCase() + s.slice(1)} <span>{(rows || []).filter(l => s === 'all' || l.status === s).length}</span></button>)}</div>
      <input className="input" style={{ maxWidth: 260 }} placeholder="Search name, phone, message" aria-label="Search leads" value={q} onChange={e => setQ(e.target.value)} /></div>
    {rows === null ? <div className="skel" style={{ height: 200 }} /> : !rows.length ? (<div className="card"><Empty icon="inbox" title="Your lead inbox is ready" action={<Link className="btn btn-primary" href="/app/campaigns/new/">Create a campaign</Link>}>
      Enquiries from your campaigns land here with call and WhatsApp buttons. You can also add a lead by hand.</Empty></div>) : (
      <div className="leads-grid">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>{!list.length ? <div className="empty small">No leads match.</div> : list.map(l => (
          <button key={l.id} className={'lead-row' + (sel === l.id ? ' on' : '')} onClick={() => setSel(l.id)}>
            <span className="av">{l.name[0]}</span><span className="lr-main"><b>{l.name}{l.example && <em className="ex">Example</em>}</b><i>{l.message || '—'}</i>
              <span className="small muted">{l.channel && <PlatformIcon p={l.channel} size={11} />} {when(l.created_at)}{cname(l.campaign_id) ? ' · ' + cname(l.campaign_id) : ''}</span></span>
            <span className={'badge ' + ST[l.status]}>{l.status}</span></button>))}</div>
        <div className="card lead-detail">{!lead ? <div className="empty small"><Icon n="inbox" size={28} color="#8A93A6" /><p>Select a lead to call, WhatsApp, change status or add notes.</p></div> : (<>
          <div className="row" style={{ gap: 12 }}><span className="av lg">{lead.name[0]}</span><div><h3 style={{ margin: 0 }}>{lead.name}</h3><div className="small muted">{lead.phone}{lead.example && ' · example lead from a simulated campaign'}</div></div></div>
          {lead.message && <p className="lead-msg">“{lead.message}”</p>}
          <div className="row" style={{ margin: '12px 0' }}><a className="btn btn-primary btn-sm" href={tel(lead.phone)}><Icon n="phone" size={15} color="#fff" />Call</a>
            <a className="btn btn-sm wa-btn" href={wa(lead.phone)} target="_blank" rel="noopener"><PlatformIcon p="whatsapp" size={15} mono="#fff" />WhatsApp</a></div>
          <div className="field"><label>Status</label><div className="row" style={{ gap: 6 }}>{LEAD_STATUSES.map(s => <button key={s} className={'btn btn-sm ' + (lead.status === s ? 'btn-dark' : 'btn-ghost')} onClick={() => setStatus(lead, s)}>{s}</button>)}</div></div>
          <div className="field"><label htmlFor="nt">Notes</label>
            {notes.filter(n => n.lead_id === lead.id).map(n => <div key={n.id} className="note"><span>{n.text}</span><i>{when(n.created_at)}</i></div>)}
            <form onSubmit={addNote} className="row"><input id="nt" className="input" style={{ flex: 1 }} placeholder="Called, will visit Saturday…" value={note} onChange={e => setNote(e.target.value)} /><button className="btn btn-ghost btn-sm">Add note</button></form></div>
          <div className="small muted">Received {when(lead.created_at)}{lead.channel ? ' via ' + CHANNEL_LABEL[lead.channel] : ''}{cname(lead.campaign_id) ? ' · ' + cname(lead.campaign_id) : ''}</div></>)}</div>
      </div>)}
    {add && (<div className="modal-bg" onClick={() => setAdd(false)}><form className="modal" onClick={e => e.stopPropagation()} onSubmit={addLead} noValidate><h3>Add a lead</h3>
      <div className="field"><label htmlFor="ln">Name</label><input id="ln" className="input" value={nl.name} onChange={e => setNl({ ...nl, name: e.target.value })} />{err.name && <span className="err">{err.name}</span>}</div>
      <div className="field"><label htmlFor="lp">Mobile</label><input id="lp" className="input" inputMode="tel" value={nl.phone} onChange={e => setNl({ ...nl, phone: e.target.value })} />{err.phone && <span className="err">{err.phone}</span>}</div>
      <div className="field"><label htmlFor="lm">What they asked</label><textarea id="lm" className="input" value={nl.message} onChange={e => setNl({ ...nl, message: e.target.value })} /></div>
      <div className="row" style={{ justifyContent: 'flex-end' }}><button type="button" className="btn btn-ghost" onClick={() => setAdd(false)}>Cancel</button><button className="btn btn-primary">Save lead</button></div></form></div>)}
  </AppShell>);
}
