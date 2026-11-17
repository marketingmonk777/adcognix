'use client';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { RotatingWord } from './Motion';
import { PLATFORM, PlatformIcon, type Platform } from './Icons';
import { base } from '@/lib/config';
const WORDS: Platform[] = ['instagram', 'facebook', 'google', 'whatsapp', 'youtube'];
const OWNERS = [
  { src: '/images/owner-interior.webp', who: 'Interior studio', line: 'New enquiry: 2BHK modular kitchen' },
  { src: '/images/owner-clinic.webp', who: 'Neighbourhood clinic', line: 'Call booked: general check-up' },
  { src: '/images/owner-salon.webp', who: 'Salon and spa', line: 'WhatsApp chat: bridal trial' },
  { src: '/images/owner-shop.webp', who: 'Local store', line: 'Store visit: festive offer' },
];
const ORBIT: { p: Platform; x: string; y: string; d: string }[] = [
  { p: 'facebook', x: '14%', y: '6%', d: '0s' }, { p: 'google', x: '62%', y: '2%', d: '.6s' }, { p: 'linkedin', x: '90%', y: '20%', d: '1.2s' },
  { p: 'youtube', x: '2%', y: '28%', d: '.9s' }, { p: 'whatsapp', x: '-3%', y: '56%', d: '1.5s' }, { p: 'instagram', x: '92%', y: '70%', d: '.3s' },
];
export function Hero() {
  const [i, setI] = useState(0); const onIndex = useCallback((n: number) => setI(n % OWNERS.length), []);
  const o = OWNERS[i];
  return (<section className="hero2"><div className="hero-bg" aria-hidden="true"><span className="orb o1" /><span className="orb o2" /><span className="grid-fade" /></div>
    <div className="wrap hero2-grid">
      <div className="hero-copy">
        <div className="pill-tag"><span className="dot" />Advertising for growing businesses</div>
        <h1 className="hero-h">Run <RotatingWord words={WORDS.map(p => ({ text: PLATFORM[p].name, grad: PLATFORM[p].grad }))} onIndex={onIndex} /><br />ads that bring<br /><span className="ink-under">customers in.</span></h1>
        <p className="lead">Plan, design and launch ads for your business from one simple app, then follow up every enquiry before it goes cold.</p>
        <div className="row" style={{ marginTop: 28 }}>
          <Link className="btn btn-primary btn-lg shine" href="/login/?new=1">Create your first campaign</Link>
          <a className="btn btn-ghost btn-lg" href="#contact">Talk to a specialist</a>
        </div>
        <ul className="hero-ticks"><li>Free to start</li><li>No agency needed</li><li>You approve every ad</li></ul>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="blob"><div className="blob-a" /><div className="blob-b" />
          {OWNERS.map((x, k) => <img key={x.src} src={base + x.src} alt="" width={520} height={600} className={'owner' + (k === i ? ' on' : '')} loading={k ? 'lazy' : 'eager'} fetchPriority={k ? 'low' : 'high'} decoding="async" />)}
        </div>
        {ORBIT.map(f => <span key={f.p} className="float-ico" style={{ left: f.x, top: f.y, animationDelay: f.d }}><PlatformIcon p={f.p} size={26} /></span>)}
        <div className="cap-card" key={o.who}><span className="cap-dot" /><div><strong>{o.who}</strong><span>{o.line}</span></div></div>
        <div className="cap-chip"><span className="spark" />Ad live on 3 channels</div>
      </div>
    </div>
    <p className="wrap small muted art-note">Photos are illustrative. Ad and lead details shown are examples.</p>
  </section>);
}
