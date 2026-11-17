import Link from 'next/link';
import { SiteNav, SiteFooter, CITY } from '@/components/SiteChrome';
export const metadata = { title: 'About · AdCognix' };
export default function About() { return (<><SiteNav /><main>
  <section className="section page-hero"><div className="wrap prose"><div className="eyebrow">About AdCognix</div><h1 style={{ fontSize: 44 }}>Advertising that a busy owner can actually run.</h1>
    <p className="lead muted">Most small businesses know their customers are on Instagram, Facebook and Google. What they lack is the time to learn three ad managers. AdCognix puts planning, creative, publishing and follow-up into one simple app.</p></div></section>
  <section className="section" style={{ paddingTop: 0 }}><div className="wrap prose">
    <h2>What we believe</h2>
    <p><strong>Clarity over jargon.</strong> Every screen explains what a setting does in plain words, and every suggestion says why.</p>
    <p><strong>Your money, your decision.</strong> AdCognix suggests budgets and changes, but nothing goes live or moves without your approval.</p>
    <p><strong>Honest numbers.</strong> We show results from your own campaigns. Where a screen uses example data, it says so.</p>
    <p><strong>Leads are yours.</strong> Export them any time. We never sell your data or your customers&apos; data.</p>
    <h2>Where we are</h2><p>AdCognix is built in {CITY}. The product is in early access: campaign planning, creative, lead inbox, reports and festival posts work today, and live publishing to Meta and Google is being connected as platform approvals come through.</p>
    <p><Link className="btn btn-primary" href="/login/?new=1">Try it free</Link> <Link className="btn btn-ghost" href="/contact/" style={{ marginLeft: 8 }}>Contact us</Link></p>
  </div></section></main><SiteFooter /></>); }
