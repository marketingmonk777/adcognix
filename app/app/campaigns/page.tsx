'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/useSession';
import { AppShell, Empty } from '@/components/AppShell';
import { Svg } from '@/components/AdPreview';
import { PlatformIcon, Icon } from '@/components/Icons';
import { toast } from '@/components/Toast';
import { db } from '@/lib/data';
import { OBJECTIVES, inr } from '@/lib/campaign';
import { renderSvg } from '@/lib/templates';
import { simulate, totals } from '@/lib/sim';
import { advance, setStatus } from '@/lib/actions';
import type { Campaign } from '@/lib/types';
const BADGE: Record<string, string> = { active: 'mint', paused: 'grey', draft: '', ended: 'grey', failed: 'coral' };
export default function Campaigns() {
  const { ready, user, biz } = useSession({ needBusiness: true });
  const [rows, setRows] = useState<Campaign[] | null>(null); const [busy, setBusy] = useState(''); const [f, setF] = useState('all');
  const load = () => db().list<Campaign>('campaigns').then(setRows).catch(e => { toast(e.message); setRows([]); });
  useEffect(() => { if (ready) load(); }, [ready]);
  if (!ready || !biz) return <div className="main"><div className="skel" style={{ height: 200 }} /></div>;
  async function act(c: Campaign, what: 'pause' | 'resume' | 'day' | 'week' | 'delete') {
    setBusy(c.id + what);
    try {
      if (what === 'pause' || what === 'resume') { await setStatus(c, what === 'pause' ? 'paused' : 'active'); toast(what === 'pause' ? 'Paused' : 'Resumed'); }
      else if (what === 'delete') { if (!confirm('Delete this draft?')) return; await db().remove('campaigns', c.id); }
      else { const r = await advance(c, what === 'day' ? 1 : 7); toast(`Simulated ${what === 'day' ? '1 day' : '7 days'}${r.leads ? ` · ${r.leads} example leads` : ''}`); }
      await load();
    } catch (x: any) { toast(x?.message || 'Something went wrong'); } finally { setBusy(''); }
  }
  const list = (rows || []).filter(c => f === 'all' || c.status === f);
  return (<AppShell user={user} title="Campaigns" actions={<Link className="btn btn-primary btn-sm" href="/app/campaigns/new/"><Icon n="plus" size={16} />New campaign</Link>}>
    <div className="tabs" role="tablist">{['all', 'active', 'paused', 'draft', 'ended'].map(s => <button key={s} role="tab" aria-selected={f === s} className={f === s ? 'on' : ''} onClick={() => setF(s)}>{s[0].toUpperCase() + s.slice(1)} <span>{(rows || []).filter(c => s === 'all' || c.status === s).length}</span></button>)}</div>
    {rows === null ? <div className="skel" style={{ height: 160 }} /> : !list.length ? (<div className="card"><Empty icon="megaphone" title={f === 'all' ? 'Launch your first campaign' : `No ${f} campaigns`} action={<Link className="btn btn-primary" href="/app/campaigns/new/">Create a campaign</Link>}>
      Pick a goal, set a budget and AdCognix builds the creative, text and audience for you. You approve everything before it goes live.</Empty></div>) : (
      <div className="grid" style={{ gap: 14 }}>{list.map(c => { const t = totals(simulate(c)); const obj = OBJECTIVES.find(o => o.id === c.objective)!; return (
        <div key={c.id} className="card camp lift">
          <div className="camp-thumb"><Svg svg={renderSvg(c.creative.templateId, { name: biz.name, headline: c.creative.headline || c.copy.headlines[0] || c.name, sub: c.creative.sub, offer: c.creative.offer, cta: c.copy.cta, color: c.creative.color, accent: c.creative.accent, logo: biz.logo_url }, 1080, 1080)} /></div>
          <div className="camp-main">
            <div className="row" style={{ gap: 8 }}><h3 style={{ margin: 0 }}>{c.name}</h3><span className={'badge ' + BADGE[c.status]}>{c.status}</span>{c.publish?.simulated && <span className="badge" style={{ background: '#FFF6E5', color: '#9A6A00' }} title={c.publish.note}>Simulated</span>}</div>
            <div className="small muted" style={{ margin: '4px 0 10px' }}>{obj.label} · {inr(c.daily_budget)}/day · {c.duration_days} days · <span className="row" style={{ display: 'inline-flex', gap: 4, verticalAlign: 'middle' }}>{c.channels.map(x => <PlatformIcon key={x.channel} p={x.channel} size={13} />)}</span>
              {c.status !== 'draft' && <> · day {Math.min(c.sim_days, c.duration_days)} of {c.duration_days}</>}</div>
            {c.status !== 'draft' && <div className="camp-kpis"><div><i>Reach</i><b>{t.reach.toLocaleString('en-IN')}</b></div><div><i>Clicks</i><b>{t.clicks.toLocaleString('en-IN')}</b></div><div><i>{obj.result}</i><b>{t.results.toLocaleString('en-IN')}</b></div><div><i>Spend</i><b>{inr(t.spend)}</b></div><div><i>Cost/{obj.result.toLowerCase().replace(/s$/, '')}</i><b>{t.results ? inr(t.cpr) : '–'}</b></div></div>}
          </div>
          <div className="camp-act">
            {c.status === 'draft' && <><Link className="btn btn-primary btn-sm" href={`/app/campaigns/new/?id=${c.id}`}>Continue</Link><button className="btn btn-ghost btn-sm" onClick={() => act(c, 'delete')}>Delete</button></>}
            {c.status === 'active' && <button className="btn btn-ghost btn-sm" disabled={!!busy} onClick={() => act(c, 'pause')}><Icon n="pause" size={14} />Pause</button>}
            {c.status === 'paused' && <button className="btn btn-primary btn-sm" disabled={!!busy} onClick={() => act(c, 'resume')}><Icon n="play" size={14} />Resume</button>}
            {c.status === 'active' && c.publish?.simulated && <><button className="btn btn-ghost btn-sm" disabled={!!busy} onClick={() => act(c, 'day')}>Simulate 1 day</button><button className="btn btn-ghost btn-sm" disabled={!!busy} onClick={() => act(c, 'week')}>Simulate 7 days</button></>}
            {c.status !== 'draft' && <Link className="btn btn-ghost btn-sm" href={`/app/reports/?c=${c.id}`}>Report</Link>}
          </div>
        </div>); })}</div>)}
    {!!rows?.some(c => c.publish?.simulated) && <p className="small muted" style={{ marginTop: 14 }}>Simulated: real Meta/Google publishing needs API approval. Figures for simulated campaigns are example data, not real ad results.</p>}
  </AppShell>);
}
