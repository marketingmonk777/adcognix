import { SiteNav, SiteFooter, PHONE, CITY } from '@/components/SiteChrome';
export const metadata = { title: 'Refund and cancellation policy · AdCognix' };
export default function Refund() { return (<><SiteNav /><main className="section"><div className="wrap prose"><h1 style={{ fontSize: 36 }}>Refund and cancellation policy</h1>
  <p className="demo-pill" style={{ display: 'inline-block' }}>Draft for review by your legal adviser before launch</p>
  <h2>Plans</h2><p>You can cancel a paid plan at any time from Billing. The plan stays active until the end of the period you paid for and does not renew. Plan fees for a period that has started are not refunded, except where the law requires it or where we could not provide the service.</p>
  <h2>Wallet balance</h2><p>Unused wallet balance can be refunded to the original payment method on request, within 180 days of the top-up, minus any payment-gateway charges that the gateway does not return to us. Refunds are usually processed within 7–10 working days after approval.</p>
  <h2>Ad spend</h2><p>Money paid to ad platforms (Meta, Google and others) for ads that have already run is governed by those platforms&apos; own terms and cannot be refunded by AdCognix.</p>
  <h2>Failed or duplicate payments</h2><p>If you are charged twice or a payment fails after money leaves your account, contact us with the payment reference. We will refund the duplicate or failed amount after checking with the gateway.</p>
  <h2>How to ask</h2><p>Call or WhatsApp {PHONE}, or write to us from your registered email. AdCognix, {CITY}.</p></div></main><SiteFooter /></>); }
