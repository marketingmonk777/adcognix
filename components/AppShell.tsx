'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { db } from '@/lib/data';
import { Logo } from './Logo';
import type { User } from '@/lib/types';
const NAV = [['/app/', 'Overview'], ['/app/settings/', 'Settings']];
export function AppShell({ user, title, actions, children }: { user: User | null; title: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const p = usePathname(); const r = useRouter();
  const nav = user?.is_admin ? [...NAV, ['/admin/', 'Admin']] : NAV;
  const on = (h: string) => (p === h || p + '/' === h ? 'on' : '');
  return (<div className="shell">
    <aside className="side">
      <Link href="/app/"><Logo size={24} /></Link>
      <nav>{nav.map(([h, l]) => <Link key={h} href={h} className={on(h)}>{l}</Link>)}</nav>
      <div style={{ marginTop: 'auto' }} className="small muted">
        {db().mode === 'demo' && <div className="demo-pill" style={{ display: 'inline-block', marginBottom: 8 }}>Demo mode</div>}
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={async () => { await db().signOut(); r.replace('/login/'); }}>Sign out</button>
      </div>
    </aside>
    <main className="main">
      <div className="topline"><h2 style={{ margin: 0, fontSize: 24 }}>{title}</h2><div className="row">{actions}</div></div>
      {children}
    </main>
    <nav className="mobile-tabs">{nav.map(([h, l]) => <Link key={h} href={h} className={on(h)}>{l}</Link>)}
      <a href="#" onClick={async e => { e.preventDefault(); await db().signOut(); r.replace('/login/'); }}>Sign out</a></nav>
  </div>);
}
