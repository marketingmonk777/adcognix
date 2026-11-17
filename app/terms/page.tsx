import { SiteNav, SiteFooter, CITY } from '@/components/SiteChrome';
export const metadata = { title: 'Terms of use · AdCognix' };
export default function T() { return (<><SiteNav /><main className="section"><div className="wrap prose"><h1 style={{ fontSize: 36 }}>Terms of use</h1><p className="muted">Draft for review by your legal adviser before launch.</p>
  <h2>The service</h2><p>AdCognix helps you plan, create and publish ads on third-party platforms such as Meta and Google. Those platforms review and may reject ads under their own policies.</p>
  <h2>Ad spend</h2><p>Money paid to ad platforms is separate from any AdCognix fee. Results such as leads and sales are not guaranteed.</p>
  <h2>Your content</h2><p>You are responsible for the claims, images and offers in your ads, and you confirm you have the right to use them.</p>
  <h2>Accounts</h2><p>Keep your sign-in secure. We may suspend accounts that misuse the service or break platform policies.</p>
  <h2>Governing law</h2><p>These terms are governed by the laws of India, with courts at {CITY.split(' ')[0]}.</p></div></main><SiteFooter /></>); }
