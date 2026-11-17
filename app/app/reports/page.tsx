'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/useSession';
import { AppShell, Empty } from '@/components/AppShell';
import { LineChart, Bars } from '@/components/Charts';
import { PlatformIcon, Icon } from '@/components/Icons';
import { toast } from '@/components/Toast';
import { db } from '@/lib/data';
import { simulate, byDay, byChannel, totals } from '@/lib/sim';
import { evaluate, apply, defaultTargetCpl, type Suggestion } from '@/lib/rules';
import { CHANNEL_LABEL, CHANNEL_COLOR, OBJECTIVES, inr } from '@/lib/campaign';
import { advance } from '@/lib/actions';
import type { Campaign } from '@/lib/types';
const METRICS = [{ k: 'reach', l: 'Reach', c: '#2F5BFF' }, { k: 'clicks', l: 'Clicks', c: '#0B1B3F' }, { k: 'results', l: 'Leads / results', c: '#FF6B4A' }, { k: 'spend', l: 'Spend', c: '#14B88F' }, { k: 'cpr', l: 'Cost per lead', c: '#E8A317' }] as const;
export default function Reports() {
  const { ready, user, biz } = useSession({ needBusiness: true });
  const [camps, setCamps] = useState<Campaign[] | null>(null); const [cid, setCid] = useState('all'); const [m, setM] = useState<(typeof METRICS)[number]['k']>('results'); const [busy, setBusy] = useState(false);
  const load = () => db().list<Campaign>('campaigns').then(c => setCamps(c.filter(x => x.status !== 'draft'))).catch(() => setCamps([]));
  useEffect(() => { if (ready) { load(); const c = new URLSearchParams(location.search).get('c'); if (c) setCid(c); } }, [ready]);
  const sel = useMemo(() => (camps || []).filter(c => cid === 'all' || c.id === cid), [camps, cid]);
  const rows = useMemo(() => sel.flatMap(simulate), [sel]);
  if (!ready || !biz) return <div className="main"><div className="skel" style={{ height: 200 }} /></div>;
  const t = totals(rows); const days = byDay(rows); const ch = byChannel(rows);
  const target = (c: Campaign) => c.target_cpl || defaultTargetCpl(biz.category);
  const sugg: Suggestion[] = sel.flatMap(c => evaluate(c, target(c)));
  const fmt = (k: string) => (n: number) => (k === 'spend' || k === 'cpr' ? inr(n) : n.toLocaleString('en-IN'));
  async function doApply(s: Suggestion) {
    const c = camps!.find(x => x.id === s.campaign_id)!; if (s.action.type === 'refresh_creative') { location.href = location.pathname.replace(/reports\/?$/, 'campaigns/new/'); return; }
    await db().save('campaigns', { ...apply(c, s), updated_at: new Date().toISOString() }); await db().log('rule.apply', { id: s.id }); toast('Applied: ' + s.title); load();
  }
  async function dismiss(s: Suggestion) { const c = camps!.find(x => x.id === s.campaign_id)!; await db().save('campaigns', { ...c, applied: [...(c.applied || []), s.id] }); load(); }
  async function sim7() { setBusy(true); try { for (const c of sel.filter(x => x.status === 'active' && x.publish?.simulated)) await advance(c, 7); await load(); toast('Simulated 7 more days'); } finally { setBusy(false); } }
  const simulated = sel.some(c => c.publish?.simulated);
  return (<AppShell user={user} title="Reports" actions={<>{simulated && <button className="btn btn-ghost btn-sm" onClick={sim7} disabled={busy}>{busy ? 'Simulating…' : 'Simulate 7 days'}</button>}
    <select className="input" style={{ width: 240, height: 34 }} aria-label="Campaign" value={cid} onChange={e => setCid(e.target.value)}><option value="all">All campaigns</option>{(camps || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></>}>
    {camps === null ? <div className="skel" style={{ height: 200 }} /> : !camps.length ? <div className="card"><Empty icon="chart" title="Reports appear after your first campaign" action={<Link className="btn btn-primary" href="/app/campaigns/new/">Create a campaign</Link>}>Reach, clicks, leads, spend and cost per lead, by day and by channel, with suggestions when something costs too much.</Empty></div> : (<>
      {simulated && <div className="sim-banner"><Icon n="shield" size={18} />Example data from simulated campaigns. Real figures appear once Meta/Google publishing is connected.</div>}
      <div className="kpis">{METRICS.map(x => <button key={x.k} className={'kpi-tile' + (m === x.k ? ' on' : '')} onClick={() => setM(x.k)} style={{ ['--c' as any]: x.c }}><i>{x.l}</i><b>{x.k === 'cpr' ? (t.results ? inr(t.cpr) : '–') : fmt(x.k)(t[x.k])}</b></button>)}</div>
      <div className="grid g-rep" style={{ marginTop: 16 }}>
        <div className="card"><h3>{METRICS.find(x => x.k === m)!.l} by day</h3><LineChart label={`${m} by day`} data={days.map(d => ({ x: 'D' + (d.day + 1), y: Math.round(d[m]) }))} color={METRICS.find(x => x.k === m)!.c} fmt={fmt(m)} /></div>
        <div className="card"><h3>By channel</h3><Bars data={ch.map(c => ({ label: CHANNEL_LABEL[c.channel], value: Math.round(c[m]), color: CHANNEL_COLOR[c.channel], icon: <PlatformIcon p={c.channel} size={14} /> }))} fmt={fmt(m)} />
          <table className="table" style={{ marginTop: 14, fontSize: 13 }}><thead><tr><th>Channel</th><th>Spend</th><th>Results</th><th>Cost</th></tr></thead><tbody>{ch.map(c => <tr key={c.channel}><td>{CHANNEL_LABEL[c.channel]}</td><td>{inr(c.spend)}</td><td>{c.results}</td><td>{c.results ? inr(c.cpr) : '–'}</td></tr>)}</tbody></table></div>
      </div>
      <div className="card" style={{ marginTop: 16 }}><div className="row" style={{ justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>Optimisation suggestions</h3><span className="small muted">Rules check cost per result against your target. Nothing changes until you apply.</span></div>
        {!sugg.length ? <p className="muted small" style={{ marginTop: 12 }}>No suggestions right now. Rules need at least two days of data per campaign.</p> : sugg.map(s => (<div key={s.id} className={'sugg ' + s.severity}>
          <span className="sg-dot" /><div style={{ flex: 1 }}><b>{s.title}</b><p className="small muted" style={{ margin: 0 }}>{s.detail} {cid === 'all' && <em>· {camps.find(c => c.id === s.campaign_id)?.name}</em>}</p></div>
          <div className="row" style={{ gap: 6 }}><button className="btn btn-primary btn-sm" onClick={() => doApply(s)}>{s.action.type === 'pause' ? 'Pause campaign' : s.action.type === 'shift' ? 'Shift budget' : s.action.type === 'budget' ? `Raise to ${inr(s.action.daily)}/day` : 'New creative'}</button><button className="btn btn-ghost btn-sm" onClick={() => dismiss(s)}>Dismiss</button></div></div>))}</div>
      <div className="card" style={{ marginTop: 16, overflowX: 'auto' }}><h3>Campaigns</h3><table className="table"><thead><tr><th>Campaign</th><th>Status</th><th>Reach</th><th>Clicks</th><th>Results</th><th>Spend</th><th>Cost/result</th><th>Target</th></tr></thead><tbody>
        {sel.map(c => { const x = totals(simulate(c)); return <tr key={c.id}><td>{c.name}<div className="small muted">{OBJECTIVES.find(o => o.id === c.objective)?.label}</div></td><td><span className="badge grey">{c.status}</span></td><td>{x.reach.toLocaleString('en-IN')}</td><td>{x.clicks.toLocaleString('en-IN')}</td><td>{x.results}</td><td>{inr(x.spend)}</td><td>{x.results ? inr(x.cpr) : '–'}</td><td>{inr(target(c))}</td></tr>; })}</tbody></table></div>
    </>)}
  </AppShell>);
}
