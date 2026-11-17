import Link from 'next/link';
import { SiteNav, SiteFooter, PHONE } from '@/components/SiteChrome';
import { ConsultForm } from '@/components/ConsultForm';

const steps = [
  ['Tell us the goal', 'Enquiries, calls, WhatsApp chats or store visits. Pick one and AdCognix shapes the campaign around it.'],
  ['Set budget and channels', 'Choose Facebook, Instagram or Google, a daily budget and a duration. You see the suggested split before anything goes live.'],
  ['Launch and follow up', 'Ads go live from one screen. Every enquiry lands in your lead inbox, so nobody waits for a callback.'],
];
const features = [
  ['Creative studio', 'Ready layouts for your category, filled with your logo, colours and offer. Edit the text, swap the photo, done.'],
  ['Copy that fits', 'Headlines, descriptions, keywords and hashtags drafted for your business and city. You approve every word.'],
  ['Audience suggestions', 'Location radius, age and interest suggestions based on what you sell, editable before launch.'],
  ['One dashboard', 'Spend, reach, clicks and cost per lead across every channel, updated daily.'],
  ['Lead inbox', 'New enquiries arrive with name and number. Call, WhatsApp, add notes and track each one to a sale.'],
  ['Festival posts', 'A calendar of Indian festivals and business days, with posts and captions ready to share.'],
];

export default function Home() {
  return (<>
    <SiteNav />
    <main>
      <section className="hero"><div className="wrap hero-grid">
        <div>
          <div className="eyebrow">Advertising for growing businesses</div>
          <h1>Ads that think ahead.</h1>
          <p className="lead">Plan, design and run your Facebook, Instagram and Google ads from one place, and follow up every enquiry before it goes cold.</p>
          <div className="row" style={{ marginTop: 28 }}>
            <Link className="btn btn-primary" href="/login/?new=1">Create your first campaign</Link>
            <a className="btn btn-ghost" href="#contact">Talk to a specialist</a>
          </div>
          <p className="small muted" style={{ marginTop: 16 }}>Free to start. You only pay the ad platforms for the ads you run.</p>
        </div>
        <div className="preview" aria-hidden="true">
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 18 }}>
            <strong style={{ fontFamily: 'var(--font-h)' }}>This week</strong><span className="badge mint">Live</span></div>
          <div className="grid g3" style={{ gap: 12, marginBottom: 18 }}>
            {[['Leads', '46'], ['Cost / lead', '₹38'], ['Reach', '21.4k']].map(([k, v]) => (
              <div key={k} className="card" style={{ padding: 14 }}><div className="small muted">{k}</div><div className="kpi">{v}</div></div>))}
          </div>
          <div className="card" style={{ padding: 14 }}>
            {[['Priya S.', 'Interior quote', 'New'], ['Rahul K.', '2BHK site visit', 'Called'], ['Fathima N.', 'Price enquiry', 'New']].map(([n, w, s]) => (
              <div key={n} className="row" style={{ justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <span><strong style={{ fontSize: 14 }}>{n}</strong><br /><span className="small muted">{w}</span></span>
                <span className={'badge ' + (s === 'New' ? 'coral' : 'grey')}>{s}</span></div>))}
          </div>
          <p className="small muted" style={{ margin: '10px 0 0' }}>Illustration of the dashboard. Figures are examples.</p>
        </div>
      </div></section>

      <section className="section alt" id="how"><div className="wrap">
        <div className="section-head"><div className="eyebrow">How it works</div><h2>From idea to live ad in three steps</h2></div>
        <div className="grid g3">{steps.map(([t, d], i) => (<div key={t} className="card"><div className="step-n">{i + 1}</div><h3>{t}</h3><p className="muted">{d}</p></div>))}</div>
      </div></section>

      <section className="section" id="features"><div className="wrap">
        <div className="section-head"><div className="eyebrow">What you get</div><h2>Everything a small marketing team does, in one app</h2></div>
        <div className="grid g3">{features.map(([t, d]) => (<div key={t} className="feature"><h3>{t}</h3><p className="muted">{d}</p></div>))}</div>
      </div></section>

      <section className="section alt" id="contact"><div className="wrap grid g2" style={{ alignItems: 'center' }}>
        <div><div className="eyebrow">Prefer a person?</div><h2>Plan your first campaign with a specialist</h2>
          <p className="muted">Share your number and we will call to understand your business, budget and city, then set up a campaign you can approve in the app.</p>
          <p className="muted">Or call <a href={`tel:${PHONE.replace(/\s/g, '')}`}>{PHONE}</a>.</p></div>
        <ConsultForm />
      </div></section>

      <section className="section"><div className="wrap"><div className="cta-band">
        <div><h2 style={{ color: '#fff' }}>Your next customer is already scrolling.</h2><p>Set up your business in two minutes and see a campaign plan before you spend a rupee.</p></div>
        <Link className="btn btn-primary" href="/login/?new=1">Start free</Link>
      </div></div></section>
    </main>
    <SiteFooter />
  </>);
}
