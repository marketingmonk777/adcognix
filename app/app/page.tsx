'use client';
import Link from 'next/link';
import { useSession } from '@/components/useSession';
import { AppShell } from '@/components/AppShell';
import { recommendSplit } from '@/lib/recommend';
import { GOALS } from '@/lib/types';
import { db } from '@/lib/data';
const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const LABEL: Record<string, string> = { google: 'Google Search', facebook: 'Facebook', instagram: 'Instagram' };
export default function Overview() {
  const { ready, user, biz } = useSession({ needBusiness: true });
  if (!ready || !biz) return <div className="main"><div className="skel" style={{ height: 180 }} /></div>;
  const rec = recommendSplit(biz.category, biz.goal || 'leads', biz.monthly_budget || 10000);
  const goal = GOALS.find(g => g.id === biz.goal)?.label;
  const checklist = [
    ['Business profile', true, '/app/settings/'],
    ['Connect your cloud workspace', db().mode === 'cloud', '/app/settings/#backend'],
    ['Choose an AI provider', !!biz.settings?.ai?.provider, '/app/settings/#ai'],
  ] as const;
  return (<AppShell user={user} title={`Welcome, ${biz.name}`}>
    <div className="grid g3" style={{ marginBottom: 24 }}>
      <div className="card"><div className="small muted">Main goal</div><div className="kpi" style={{ fontSize: 20 }}>{goal}</div></div>
      <div className="card"><div className="small muted">Monthly ad budget</div><div className="kpi">{inr(biz.monthly_budget || 0)}</div></div>
      <div className="card"><div className="small muted">Suggested daily spend</div><div className="kpi">{inr(rec.daily)}</div></div>
    </div>
    <div className="grid g2">
      <div className="card"><h3>Suggested channel split</h3><p className="muted small">For {biz.category.toLowerCase()} in {biz.city}. {rec.note}</p>
        {rec.split.map(s => (<div key={s.channel} style={{ margin: '14px 0' }}>
          <div className="row" style={{ justifyContent: 'space-between' }}><strong style={{ fontSize: 14 }}>{LABEL[s.channel]}</strong><span className="small">{s.share}% · {inr(Math.round((biz.monthly_budget || 0) * s.share / 100))}/mo</span></div>
          <div style={{ height: 8, background: 'var(--paper)', borderRadius: 6, marginTop: 6 }}><div style={{ width: s.share + '%', height: 8, borderRadius: 6, background: s.channel === 'google' ? 'var(--cobalt)' : s.channel === 'facebook' ? 'var(--navy)' : 'var(--coral)' }} /></div>
          <div className="small muted" style={{ marginTop: 4 }}>{s.why}</div></div>))}
      </div>
      <div className="card"><h3>Get set up</h3>
        {checklist.map(([t, done, href]) => (<div key={t} className="row" style={{ justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
          <span className="row" style={{ gap: 10 }}><span className={'badge ' + (done ? 'mint' : 'grey')}>{done ? 'Done' : 'To do'}</span>{t}</span>
          {!done && <Link className="btn btn-ghost btn-sm" href={href}>Open</Link>}</div>))}
        <p className="small muted" style={{ marginTop: 14 }}>Campaign builder, lead inbox and reports arrive in the next releases.</p>
      </div>
    </div>
  </AppShell>);
}
