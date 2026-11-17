'use client';
import Link from 'next/link';
import { Logo } from './Logo';
import { PlatformIcon } from './Icons';
import { base } from '@/lib/config';
export function AuthLayout({ children, img = 'owner-salon', title = 'Your ads, leads and posts in one place.', points = ['Plan a campaign in minutes', 'Every enquiry lands in your inbox', 'Festival posts ready to share'] }:
  { children: React.ReactNode; img?: string; title?: string; points?: string[] }) {
  return (<div className="auth2">
    <aside className="auth-side" aria-hidden="true">
      <svg className="waves" viewBox="0 0 600 900" preserveAspectRatio="none">{Array.from({ length: 10 }, (_, i) => <path key={i} className="wave" style={{ animationDelay: `${-i}s` }} d={`M-100 ${520 + i * 12} C 120 ${420 + i * 10}, 300 ${640 - i * 8}, 700 ${470 + i * 9}`} />)}</svg>
      <Link href="/"><Logo dark /></Link>
      <h2 className="auth-h">{title}</h2>
      <ul className="auth-pts">{points.map(p => <li key={p}>{p}</li>)}</ul>
      <div className="auth-art"><div className="auth-blob" /><img src={`${base}/images/${img}.webp`} alt="" width={360} height={420} />
        <span className="float-ico" style={{ left: '4%', top: '18%' }}><PlatformIcon p="facebook" size={22} /></span>
        <span className="float-ico" style={{ right: '6%', top: '8%', animationDelay: '-2s' }}><PlatformIcon p="instagram" size={22} /></span>
        <span className="float-ico" style={{ right: '0%', top: '56%', animationDelay: '-3.5s' }}><PlatformIcon p="google" size={22} /></span>
      </div>
    </aside>
    <main className="auth-main"><div className="auth-card">{children}</div></main>
  </div>);
}
