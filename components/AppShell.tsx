'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/data';
import { Logo } from './Logo';
import { Icon } from './Icons';
import type { AppNotification, User } from '@/lib/types';
const NAV: [string, string, string][] = [['/app/', 'Overview', 'home'], ['/app/campaigns/', 'Campaigns', 'megaphone'], ['/app/leads/', 'Leads', 'inbox'], ['/app/reports/', 'Reports', 'chart'],
  ['/app/studio/', 'Post studio', 'sparkle'], ['/app/card/', 'Business card', 'card'], ['/app/billing/', 'Plans & wallet', 'wallet'], ['/app/settings/', 'Settings', 'cog']];
const MOBILE = ['/app/', '/app/campaigns/', '/app/leads/', '/app/reports/', '/app/studio/'];
export function Bell() {
  const [items, setItems] = useState<AppNotification[]>([]); const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  const load = () => db().list<AppNotification>('notifications', { limit: 30 }).then(setItems).catch(() => {});
  useEffect(() => { load(); const h = () => load(); addEventListener('acx:notify', h); const c = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); }; addEventListener('click', c); return () => { removeEventListener('acx:notify', h); removeEventListener('click', c); }; }, []);
  const unread = items.filter(i => !i.read).length;
  async function readAll() { const u = items.filter(i => !i.read).map(i => ({ ...i, read: true })); await db().saveMany('notifications', u); load(); }
  return (<div className="bell" ref={ref}>
    <button className="btn btn-ghost btn-sm icon-btn" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} onClick={() => setOpen(!open)}><Icon n="bell" />{unread > 0 && <span className="bell-n">{unread > 9 ? '9+' : unread}</span>}</button>
    {open && (<div className="bell-pop" role="dialog" aria-label="Notifications">
      <div className="row" style={{ justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--line)' }}><strong>Notifications</strong>{unread > 0 && <button className="linkish" onClick={readAll}>Mark all read</button>}</div>
      {!items.length ? <div className="empty small" style={{ padding: 24 }}>Nothing yet. Alerts for new leads and campaign changes show up here.</div> :
        <div style={{ maxHeight: 360, overflow: 'auto' }}>{items.map(n => (<Link key={n.id} href={n.href || '/app/'} className={'bell-item' + (n.read ? '' : ' unread')} onClick={() => { db().save('notifications', { ...n, read: true }); setOpen(false); }}>
          <span className={'bi-dot ' + n.kind} /><span><b>{n.title}</b>{n.body && <i>{n.body}</i>}<em>{new Date(n.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</em></span></Link>))}</div>}
    </div>)}
  </div>);
}
export function AppShell({ user, title, actions, children }: { user: User | null; title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const p = usePathname(); const r = useRouter();
  const nav = user?.is_admin ? [...NAV, ['/admin/', 'Admin', 'shield'] as [string, string, string]] : NAV;
  const on = (h: string) => (h === '/app/' ? (p === '/app' || p === '/app/') : (p + '/').startsWith(h) || p === h) ? 'on' : '';
  return (<div className="shell">
    <aside className="side">
      <Link href="/app/"><Logo size={24} /></Link>
      <nav>{nav.map(([h, l, i]) => <Link key={h} href={h} className={on(h)}><Icon n={i} />{l}</Link>)}</nav>
      <div style={{ marginTop: 'auto' }} className="small muted">
        {db().mode === 'demo' && <div className="demo-pill" style={{ display: 'inline-block', marginBottom: 8 }}>Demo mode</div>}
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={async () => { await db().signOut(); r.replace('/login/'); }}>Sign out</button>
      </div>
    </aside>
    <main className="main">
      <div className="topline"><h2 style={{ margin: 0, fontSize: 24 }}>{title}</h2><div className="row">{actions}<Bell /></div></div>
      {children}
    </main>
    <nav className="mobile-tabs">{nav.filter(([h]) => MOBILE.includes(h)).map(([h, l, i]) => <Link key={h} href={h} className={on(h)}><Icon n={i} size={20} /><span>{l.split(' ')[0]}</span></Link>)}
      <Link href="/app/settings/" className={on('/app/settings/') || on('/app/billing/') || on('/app/card/') || on('/admin/')}><Icon n="cog" size={20} /><span>More</span></Link></nav>
  </div>);
}
export function Empty({ icon = 'sparkle', title, children, action }: { icon?: string; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (<div className="empty2"><div className="e-art" aria-hidden="true"><span className="e-ring r1" /><span className="e-ring r2" /><span className="e-ico"><Icon n={icon} size={26} color="#2F5BFF" /></span></div>
    <h3>{title}</h3>{children && <p className="muted">{children}</p>}{action}</div>);
}
