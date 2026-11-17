'use client';
import { useEffect, useState } from 'react';
import { useSession } from '@/components/useSession';
import { AppShell } from '@/components/AppShell';
import { db } from '@/lib/data';
import type { ConsultRequest } from '@/lib/types';
export default function Admin() {
  const { ready, user } = useSession({ needAdmin: true });
  const [rows, setRows] = useState<ConsultRequest[] | null>(null); const [q, setQ] = useState(''); const [err, setErr] = useState('');
  useEffect(() => { if (ready) db().listConsults().then(setRows).catch(e => { setErr(e.message); setRows([]); }); }, [ready]);
  if (!ready) return <div className="main"><div className="skel" style={{ height: 200 }} /></div>;
  const list = (rows || []).filter(r => !q || (r.business_name + r.phone + (r.city || '')).toLowerCase().includes(q.toLowerCase()));
  function csv() {
    const s = ['business_name,phone,city,source,created_at', ...list.map(r => [r.business_name, r.phone, r.city || '', r.source || '', r.created_at || ''].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/csv' })); a.download = 'callback-requests.csv'; a.click();
  }
  return (<AppShell user={user} title="Admin" actions={<button className="btn btn-ghost btn-sm" onClick={csv} disabled={!list.length}>Export CSV</button>}>
    <div className="card"><div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}><h3 style={{ margin: 0 }}>Callback requests</h3>
      <input className="input" style={{ maxWidth: 260 }} placeholder="Search name, phone, city" value={q} onChange={e => setQ(e.target.value)} aria-label="Search" /></div>
      {err && <p className="err">{err}</p>}
      {rows === null ? <div className="skel" style={{ height: 120 }} /> : !list.length ? (<div className="empty"><div className="ico">0</div>{q ? 'No matches.' : 'No callback requests yet. They appear here when someone fills the form on the website.'}</div>) : (
        <div style={{ overflowX: 'auto' }}><table className="table"><thead><tr><th>Business</th><th>Phone</th><th>City</th><th>Received</th><th></th></tr></thead><tbody>
          {list.map(r => (<tr key={r.id}><td>{r.business_name}</td><td>{r.phone}</td><td>{r.city || '–'}</td><td className="small muted">{r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</td>
            <td><a className="btn btn-ghost btn-sm" href={`https://wa.me/${r.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener">WhatsApp</a></td></tr>))}
        </tbody></table></div>)}
    </div>
  </AppShell>);
}
