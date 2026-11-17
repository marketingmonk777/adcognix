import Link from 'next/link';
import { Logo } from './Logo';
export const PHONE = '+91 901 908 8160';
export const CITY = 'Bengaluru 560064';
// Section links go through next/link so the base path (/adcognix) is always applied.
export function SiteNav() {
  return (<header className="nav"><div className="wrap">
    <Link href="/" style={{ textDecoration: 'none' }}><Logo /></Link>
    <nav className="nav-links">
      <Link className="hide-m" href="/#how">How it works</Link>
      <Link className="hide-m" href="/#features">Features</Link>
      <Link className="hide-m" href="/about/">About</Link>
      <Link href="/login/">Sign in</Link>
      <Link className="btn btn-primary btn-sm" href="/login/?new=1">Start free</Link>
    </nav></div></header>);
}
export function SiteFooter() {
  return (<footer className="footer"><div className="wrap">
    <div className="grid g4" style={{ marginBottom: 32 }}>
      <div><Logo dark /><p style={{ marginTop: 12, maxWidth: 280 }}>Ads that think ahead. Plan, create and run ads for your business from one place.</p></div>
      <div><div className="f-h">Product</div>
        <div className="grid" style={{ gap: 6 }}><Link href="/#how">How it works</Link><Link href="/#features">Features</Link><Link href="/login/?new=1">Start free</Link></div></div>
      <div><div className="f-h">Company</div>
        <div className="grid" style={{ gap: 6 }}><Link href="/about/">About</Link><Link href="/contact/">Contact</Link><Link href="/privacy/">Privacy policy</Link><Link href="/terms/">Terms of use</Link><Link href="/refund/">Refund policy</Link></div></div>
      <div><div className="f-h">Reach us</div>
        <div className="grid" style={{ gap: 6 }}><a href={`tel:${PHONE.replace(/\s/g, '')}`}>{PHONE}</a>
        <a href={`https://wa.me/${PHONE.replace(/\D/g, '')}`} target="_blank" rel="noopener">WhatsApp us</a><span>{CITY}</span></div></div>
    </div>
    <div className="small" style={{ borderTop: '1px solid #22325E', paddingTop: 16 }}>© {new Date().getFullYear()} AdCognix. All rights reserved.</div>
  </div></footer>);
}
