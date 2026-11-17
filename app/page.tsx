import Link from 'next/link';
import { SiteNav, SiteFooter, PHONE } from '@/components/SiteChrome';
import { ConsultForm } from '@/components/ConsultForm';
import { Hero } from '@/components/Hero';
import { MotionInit } from '@/components/Motion';
import { Phone } from '@/components/Phone';
import { PlatformIcon, Icon, type Platform } from '@/components/Icons';
import { TEMPLATES } from '@/lib/templates';
import { FESTIVALS } from '@/lib/festivals';
import { OBJECTIVES } from '@/lib/campaign';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const CATS = ['Interior studios', 'Clinics', 'Salons and spas', 'Real estate', 'Coaching classes', 'Restaurants and cafés', 'Fashion stores', 'Gyms', 'Travel agents', 'Car service', 'Wedding planners', 'Insurance advisors', 'Manufacturers', 'Dental care', 'Bakeries', 'Pet care'];
const steps = [
  ['Pick a goal', 'Enquiries, calls, WhatsApp chats, website visits, app installs or awareness. AdCognix shapes the campaign around it.'],
  ['Set budget and channels', 'Choose Facebook, Instagram or Google, a daily budget and a duration. See the suggested split before anything goes live.'],
  ['Launch and follow up', 'Publish from one screen. Every enquiry lands in your lead inbox with call and WhatsApp buttons.'],
];
const GOAL_ICONS: Record<string, Platform[]> = { leads: ['facebook', 'instagram'], calls: ['google', 'facebook'], messages: ['whatsapp', 'instagram'], traffic: ['google', 'facebook', 'instagram'], awareness: ['instagram', 'facebook', 'youtube'], installs: ['google', 'facebook'] };

export default function Home() {
  return (<>
    <SiteNav />
    <MotionInit />
    <main id="top">
      <Hero />

      <div className="marquee" aria-label="Built for businesses like these"><div className="marquee-track">
        {[...CATS, ...CATS].map((c, i) => <span key={i} className="chip" aria-hidden={i >= CATS.length}>{c}</span>)}</div></div>

      <section className="section stats"><div className="wrap grid g4">
        {[[TEMPLATES.length, '+', 'ready ad layouts'], [FESTIVALS.length, '+', 'festival and business days, 2026–27'], [OBJECTIVES.length, '', 'campaign goals to choose from'], [0, '', 'to start. Pay the platforms only for ads you run']].map(([n, suf, l], i) => (
          <div key={i} className="stat card lift" data-reveal style={{ ['--d' as any]: i * 90 + 'ms' }}>
            <div className="stat-n">{i === 3 ? '₹0' : <span data-count={n} data-suffix={suf}>0</span>}</div><div className="muted small">{l}</div></div>))}
      </div></section>

      <section className="how" id="how"><svg className="waves" viewBox="0 0 1440 520" preserveAspectRatio="none" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => <path key={i} className="wave" style={{ animationDelay: `${-i * 0.7}s` }} d={`M-200 ${300 + i * 9} C 200 ${180 + i * 14}, 520 ${420 - i * 6}, 860 ${260 + i * 8} S 1500 ${200 + i * 12}, 1700 ${300 + i * 6}`} />)}
        </svg>
        <div className="wrap how-grid">
          <div><div className="eyebrow on-dark">How it works</div><h2 className="on-dark-h">From idea to live ad in three steps</h2>
            <div className="grid" style={{ gap: 16, marginTop: 28 }}>{steps.map(([t, d], i) => (
              <div key={t} className="step-card lift" data-reveal style={{ ['--d' as any]: i * 120 + 'ms' }}><div className="step-num">{i + 1}</div><div><h3>{t}</h3><p className="muted">{d}</p></div></div>))}</div></div>
          <div className="how-phone" data-reveal>
            <Phone title="New campaign">
              <div className="small muted" style={{ margin: '4px 0 10px' }}>What should this ad do?</div>
              {OBJECTIVES.map((o, i) => (<div key={o.id} className={'obj-row' + (i === 0 ? ' sel' : '')}><span className="obj-ic"><Icon n={['inbox', 'phone', 'sparkle', 'arrow', 'megaphone', 'download'][i]} size={15} /></span>
                <span className="obj-t"><b>{o.label}</b><i>{o.desc}</i></span><span className="obj-p">{GOAL_ICONS[o.id].map(p => <PlatformIcon key={p} p={p} size={12} />)}</span></div>))}
            </Phone>
            <span className="drift-chip c1"><PlatformIcon p="facebook" size={18} />Facebook</span>
            <span className="drift-chip c2"><PlatformIcon p="instagram" size={18} />Instagram</span>
            <span className="drift-chip c3"><PlatformIcon p="google" size={18} />Google</span>
          </div>
        </div></section>

      <section className="section" id="features"><div className="wrap">
        <div className="section-head" data-reveal><div className="eyebrow">What you get</div><h2>Everything a small marketing team does, in one app</h2></div>

        <div className="frow" data-reveal><div className="fpanel p-blue"><Phone title="Leads">
            <div className="tabs-mini"><span className="on">All</span><span>New</span><span>Contacted</span></div>
            {[['Priya S.', 'Modular kitchen quote', 'New', 'coral'], ['Rahul K.', 'Site visit Saturday', 'Contacted', 'blue'], ['Fathima N.', 'Price list please', 'Qualified', 'mint']].map(([n, w, s, c]) => (
              <div key={n} className="lead-mini"><span className="av">{n[0]}</span><span className="lm-t"><b>{n}</b><i>{w}</i><em className={'st ' + c}>{s}</em></span>
                <span className="lm-b"><span className="ib wa"><PlatformIcon p="whatsapp" size={13} mono="#fff" /></span><span className="ib call"><Icon n="phone" size={13} color="#fff" /></span></span></div>))}
          </Phone><div className="float-card fc1"><span className="av">A</span><div><b>New lead</b><i>Interior quote · just now</i></div></div></div>
          <div className="ftext"><div className="eyebrow">Lead inbox</div><h3>Every enquiry in one place, with one-tap follow-up</h3><p className="muted">Leads arrive with name and number. Call or WhatsApp from the inbox, add notes, move them from new to won, and export to CSV whenever you need.</p>
            <ul className="ticks"><li>Statuses from new to won</li><li>Notes and reminders</li><li>Instant in-app alerts</li></ul><Link href="/login/?new=1" className="link-arrow">Open the lead inbox <Icon n="arrow" size={16} /></Link></div></div>

        <div className="frow rev" data-reveal><div className="fpanel p-coral"><Phone title="Publish to">
            {(['facebook', 'instagram', 'google', 'youtube', 'linkedin'] as Platform[]).map((p, i) => (
              <div key={p} className={'chk-row' + (i > 2 ? ' soon' : '')}><span className={'cb' + (i < 3 ? ' on' : '')}>{i < 3 && <Icon n="check" size={12} color="#fff" stroke={3} />}</span><PlatformIcon p={p} size={18} /><b>{['Facebook', 'Instagram', 'Google Search', 'YouTube', 'LinkedIn'][i]}</b>{i > 2 && <em>Soon</em>}</div>))}
            <div className="pub-btn">Publish campaign</div>
          </Phone><div className="float-card fc2"><Icon n="check" size={18} color="#14B88F" stroke={3} /><div><b>Ready to publish</b><i>3 channels · ₹500/day</i></div></div></div>
          <div className="ftext"><div className="eyebrow">Multi-platform publishing</div><h3>One campaign, every channel that matters</h3><p className="muted">Pick the platforms, see the suggested budget split for your category, and publish from one screen. Track everything in a single dashboard.</p>
            <ul className="ticks"><li>Facebook, Instagram and Google Search</li><li>Budget split you can adjust</li><li>YouTube and LinkedIn on the roadmap</li></ul></div></div>

        <div className="frow" data-reveal><div className="fpanel p-mint"><Phone title="Ad insights">
            <div className="tabs-mini"><span className="on">7 days</span><span>30 days</span></div>
            <div className="ins-kpis"><div><i>Leads</i><b>38</b></div><div><i>Cost / lead</i><b>₹142</b></div></div>
            <svg viewBox="0 0 200 80" className="ins-chart"><defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F5BFF" stopOpacity=".35" /><stop offset="1" stopColor="#2F5BFF" stopOpacity="0" /></linearGradient></defs>
              <path d="M0 70 L30 58 L60 62 L90 40 L120 44 L150 24 L200 12 V80 H0Z" fill="url(#ga)" /><path className="draw" d="M0 70 L30 58 L60 62 L90 40 L120 44 L150 24 L200 12" fill="none" stroke="#2F5BFF" strokeWidth="3" strokeLinejoin="round" /></svg>
            {[['Google Search', 46, '#2F5BFF'], ['Facebook', 34, '#0B1B3F'], ['Instagram', 20, '#FF6B4A']].map(([n, v, c]) => (<div key={n as string} className="bar-row"><span>{n}</span><span className="bar"><span style={{ width: v + '%', background: c as string }} /></span><b>{v}%</b></div>))}
          </Phone><div className="float-card fc3"><Icon n="sparkle" size={18} color="#2F5BFF" /><div><b>Suggestion</b><i>Shift 15% to Google Search</i></div></div></div>
          <div className="ftext"><div className="eyebrow">Ad insights</div><h3>Reports you can read in ten seconds</h3><p className="muted">Reach, clicks, leads, spend and cost per lead across channels, plus plain-language suggestions when a channel costs too much. Nothing changes until you tap apply.</p>
            <ul className="ticks"><li>Daily charts per channel</li><li>Cost-per-lead target alerts</li><li>One-tap budget shifts</li></ul></div></div>

        <div className="frow rev" data-reveal><div className="fpanel p-violet"><Phone title="Festival posts">
            <div className="post-grid">{['#FF6B4A', '#2F5BFF', '#14B88F', '#E8A317'].map((c, i) => (<div key={c} className="post-tile" style={{ background: `linear-gradient(140deg, ${c}, #0B1B3F)` }}><span>{['Diwali', 'Holi', 'Onam', 'Ugadi'][i]}</span></div>))}</div>
            <div className="small muted" style={{ marginTop: 8 }}>Captions and hashtags ready to copy</div>
          </Phone></div>
          <div className="ftext"><div className="eyebrow">Post studio</div><h3>Festival and business-day posts, ready to share</h3><p className="muted">A calendar of Indian festivals and business days with original artwork and captions, filled with your name, colours and number. Download and post.</p>
            <ul className="ticks"><li>2026–27 calendar</li><li>Three styles per day</li><li>Digital business card and mini website</li></ul></div></div>
      </div></section>

      <section className="section alt"><div className="wrap">
        <div className="section-head" data-reveal><div className="eyebrow">Made for local businesses</div><h2>Built for people who run the shop, not the ad account</h2></div>
        <div className="grid g4 owners">{[['owner-interior', 'Interior studios', 'Quote requests from homeowners nearby'], ['owner-clinic', 'Clinics', 'Appointment calls from the neighbourhood'], ['owner-salon', 'Salons', 'WhatsApp bookings for the weekend'], ['owner-shop', 'Local stores', 'Footfall for festive offers']].map(([img, t, d], i) => (
          <div key={img} className="owner-card lift" data-reveal style={{ ['--d' as any]: i * 100 + 'ms' }}><div className="oc-img" data-parallax="0.04"><img src={`${base}/images/${img}.webp`} alt={`Illustration: ${t.toLowerCase()} owner`} width={300} height={340} loading="lazy" decoding="async" /></div><h3>{t}</h3><p className="muted small">{d}</p></div>))}</div>
      </div></section>

      <section className="section" id="contact"><div className="wrap grid g2" style={{ alignItems: 'center' }}>
        <div data-reveal><div className="eyebrow">Prefer a person?</div><h2>Plan your first campaign with a specialist</h2>
          <p className="muted">Share your number and we will call to understand your business, budget and city, then set up a campaign you can approve in the app.</p>
          <p className="muted">Or call <a href={`tel:${PHONE.replace(/\s/g, '')}`}>{PHONE}</a>.</p></div>
        <div data-reveal style={{ ['--d' as any]: '120ms' }}><ConsultForm /></div>
      </div></section>

      <section className="section" style={{ paddingTop: 0 }}><div className="wrap"><div className="cta-band2" data-reveal>
        <svg className="cta-lines" viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <path key={i} d={`M0 ${140 + i * 6} Q150 ${60 + i * 10} 300 ${120 + i * 4} T600 ${80 + i * 8}`} />)}</svg>
        <div><h2>Your next customer is already scrolling.</h2><p>Set up your business in two minutes and see a campaign plan before you spend a rupee.</p></div>
        <Link className="btn btn-white btn-lg" href="/login/?new=1">Start free</Link>
      </div></div></section>
    </main>
    <a className="fab" href="#contact"><Icon n="phone" size={18} color="#fff" /><span>Talk to a specialist</span></a>
    <SiteFooter />
  </>);
}
