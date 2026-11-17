import { SiteNav, SiteFooter, PHONE, CITY } from '@/components/SiteChrome';
import { ConsultForm } from '@/components/ConsultForm';
export const metadata = { title: 'Contact · AdCognix' };
export default function Contact() {
  const tel = PHONE.replace(/\s/g, ''); const wa = 'https://wa.me/' + PHONE.replace(/\D/g, '');
  return (<><SiteNav /><main className="section"><div className="wrap grid g2" style={{ alignItems: 'start' }}>
    <div><div className="eyebrow">Contact</div><h1 style={{ fontSize: 40 }}>Talk to the AdCognix team</h1>
      <p className="muted">Questions about a campaign, a plan or your account? Reach us directly, or leave your number and we will call you back within one working day.</p>
      <div className="grid" style={{ gap: 12, marginTop: 24 }}>
        <a className="card lift contact-row" href={`tel:${tel}`}><strong>Call</strong><span>{PHONE}</span></a>
        <a className="card lift contact-row" href={wa} target="_blank" rel="noopener"><strong>WhatsApp</strong><span>{PHONE}</span></a>
        <div className="card contact-row"><strong>Office</strong><span>{CITY}</span></div>
      </div></div>
    <ConsultForm source="contact-page" />
  </div></main><SiteFooter /></>);
}
