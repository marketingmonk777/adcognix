import { SiteNav, SiteFooter, PHONE, CITY } from '@/components/SiteChrome';
export const metadata = { title: 'Privacy policy · AdCognix' };
export default function P() { return (<><SiteNav /><main className="section"><div className="wrap prose"><h1 style={{ fontSize: 36 }}>Privacy policy</h1><p className="muted">Draft for review by your legal adviser before launch.</p>
  <h2>What we collect</h2><p>Your account email, business details you enter, the ads you create, and enquiries (leads) your ads collect. If you connect an ad account, we store access tokens needed to run your ads.</p>
  <h2>How we use it</h2><p>Only to run AdCognix for you: creating and publishing ads, showing reports and delivering leads. We do not sell your data or your customers&apos; data.</p>
  <h2>AI providers</h2><p>Text you ask the AI to write is sent to the AI provider you select. We send only what the task needs.</p>
  <h2>Your rights</h2><p>You can export or delete your data at any time by writing to us. Leads you collect belong to you.</p>
  <h2>Contact</h2><p>AdCognix, {CITY}. Phone {PHONE}.</p></div></main><SiteFooter /></>); }
