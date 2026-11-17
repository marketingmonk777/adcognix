'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/components/useSession';
import { AppShell } from '@/components/AppShell';
import { Icon, PlatformIcon } from '@/components/Icons';
import { recommendSplit } from '@/lib/recommend';
import { GOALS, type Campaign, type Lead, type Subscription, type SavedPost } from '@/lib/types';
import { db } from '@/lib/data';
import { simulate, totals } from '@/lib/sim';
import { upcoming } from '@/lib/festivals';
import { inr } from '@/lib/campaign';
const LABEL: Record<string, string> = { google: 'Google Search', facebook: 'Facebook', instagram: 'Instagram' };
export default function Overview() {
  const { ready, user, biz } = useSession({ needBusiness: true });
  const [d, setD] = useState<{ c: Campaign[]; l: Lead[]; s: Subscription[]; p: SavedPost[] } | null>(null);
  useEffect(() => { if (ready) Promise.all([db().list<Campaign>('campaigns'), db().list<Lead>('leads'), db().list<Subscription>('subscriptions'), db().list<SavedPost>('posts', { limit: 1 })]).then(([c, l, s, p]) => setD({ c, l, s, p })).catch(() => setD({ c: [], l: [], s: [], p: [] })); }, [ready]);
  if (!ready || !biz) return <div className="main"><div className="skel" style={{ height: 180 }} /></div>;
  const rec = recommendSplit(biz.category, biz.goal || 'leads', biz.monthly_budget || 10000);
  const goal = GOALS.find(g => g.id === biz.goal)?.label;
  const live = (d?.c || []).filter(c => c.status !== 'draft'); const t = totals(live.flatMap(simulate));
  const newLeads = (d?.l || []).filter(l => l.status === 'new').length;
  const checklist: [string, boolean, string][] = [
    ['Business profile', true, '/app/settings/'],
    ['Launch your first campaign', live.length > 0, '/app/campaigns/new/'],
    ['Follow up a lead', (d?.l || []).some(l => l.status !== 'new'), '/app/leads/'],
    ['Make a festival post', (d?.p || []).length > 0, '/app/studio/'],
    ['Create your business card', !!biz.settings?.card, '/app/card/'],
    ['Choose a plan', (d?.s || []).some(s => s.status === 'active'), '/app/billing/'],
    ['Choose an AI provider', !!biz.settings?.ai?.provider, '/app/settings/#ai'],
    ['Connect your cloud workspace', db().mode === 'cloud', '/app/settings/#backend'],
  ];
  const done = checklist.filter(c => c[1]).length; const fest = upcoming(new Date().toISOString().slice(0, 10), 3);
  return (<AppShell user={user} title={`Welcome, ${biz.name}`} actions={<Link className="btn btn-primary btn-sm" href="/app/campaigns/new/"><Icon n="plus" size={16} />New campaign</Link>}>
    <div className="grid g4" style={{ marginBottom: 24, gap: 16 }}>
      <div className="card kpi-card"><div className="small muted">Live campaigns</div><div className="kpi">{live.filter(c => c.status === 'active').length}</div><Link className="small" href="/app/campaigns/">View all</Link></div>
      <div className="card kpi-card"><div className="small muted">New leads</div><div className="kpi">{newLeads}</div><Link className="small" href="/app/leads/">Open inbox</Link></div>
      <div className="card kpi-card"><div className="small muted">Spend so far</div><div className="kpi">{inr(t.spend)}</div><span className="small muted">{live.some(c => c.publish?.simulated) ? 'Includes simulated data' : 'All campaigns'}</span></div>
      <div className="card kpi-card"><div className="small muted">Main goal</div><div className="kpi" style={{ fontSize: 18 }}>{goal}</div><span className="small muted">{inr(biz.monthly_budget || 0)}/month</span></div>
    </div>
    <div className="grid g2">
      <div className="card"><h3>Suggested channel split</h3><p className="muted small">For {biz.category.toLowerCase()} in {biz.city}. {rec.note}</p>
        {rec.split.map(s => (<div key={s.channel} style={{ margin: '14px 0' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}><strong style={{ fontSize: 14 }} className="row"><PlatformIcon p={s.channel} size={16} />{LABEL[s.channel]}</strong><span className="small">{s.share}% · {inr(Math.round((biz.monthly_budget || 0) * s.share / 100))}/mo</span></div>
          <div style={{ height: 8, background: 'var(--paper)', borderRadius: 6, marginTop: 6 }}><div className="grow-bar" style={{ width: s.share + '%', height: 8, borderRadius: 6, background: s.channel === 'google' ? 'var(--cobalt)' : s.channel === 'facebook' ? 'var(--navy)' : 'var(--coral)' }} /></div>
          <div className="small muted" style={{ marginTop: 4 }}>{s.why}</div></div>))}
        {fest.length > 0 && <><h3 style={{ marginTop: 24 }}>Coming up</h3>{fest.map(f => <Link key={f.date + f.name} href={`/app/studio/?d=${f.date}`} className="fest-mini"><span>{new Date(f.date + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>{f.name}<Icon n="arrow" size={14} /></Link>)}</>}
      </div>
      <div className="card"><div className="row" style={{ justifyContent: 'space-between' }}><h3 style={{ margin: 0 }}>Get set up</h3><span className="small muted">{done} of {checklist.length}</span></div>
        <div className="progress"><span style={{ width: (done / checklist.length * 100) + '%' }} /></div>
        {checklist.map(([t, ok, href]) => (<div key={t} className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
          <span className="row" style={{ gap: 10 }}><span className={'badge ' + (ok ? 'mint' : 'grey')}>{ok ? 'Done' : 'To do'}</span>{t}</span>
          {!ok && <Link className="btn btn-ghost btn-sm" href={href}>Open</Link>}</div>))}
      </div>
    </div>
  </AppShell>);
}
