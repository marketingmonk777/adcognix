'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/components/useSession';
import { AppShell } from '@/components/AppShell';
import { FeedPreview, StoryPreview, SearchPreview, Svg } from '@/components/AdPreview';
import { PlatformIcon, Icon } from '@/components/Icons';
import { toast } from '@/components/Toast';
import { db, uid } from '@/lib/data';
import { OBJECTIVES, CHANNEL_LABEL, planSplit, suggestedChannels, validatePlan, inr, totalBudget } from '@/lib/campaign';
import { suggestAudience, audienceErrors } from '@/lib/audience';
import { fallbackCopy } from '@/lib/copy';
import { templatesFor, renderSvg, type TplVars } from '@/lib/templates';
import { writeCopy, publishCampaign } from '@/lib/actions';
import { publisher, checkPublishable } from '@/lib/publisher';
import { resizeImage } from '@/lib/png';
import { defaultTargetCpl } from '@/lib/rules';
import type { Campaign, Channel, Objective, AdCopy } from '@/lib/types';

const STEPS = ['Goal', 'Platforms & budget', 'Creative', 'Ad text', 'Audience', 'Preview & publish'];
const OBJ_ICON: Record<Objective, string> = { leads: 'inbox', calls: 'phone', messages: 'sparkle', traffic: 'arrow', awareness: 'megaphone', installs: 'download' };
const CHANNELS: Channel[] = ['facebook', 'instagram', 'google'];
const today = () => new Date().toISOString().slice(0, 10);

export default function NewCampaign() {
  const r = useRouter(); const { ready, user, biz, setBiz } = useSession({ needBusiness: true });
  const [step, setStep] = useState(0); const [c, setC] = useState<Campaign | null>(null); const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(''); const [interest, setInterest] = useState(''); const [loc, setLoc] = useState('');
  useEffect(() => {
    if (!biz) return;
    const id = new URLSearchParams(location.search).get('id');
    (async () => {
      if (id) { const ex = (await db().list<Campaign>('campaigns', { eq: { id } }))[0]; if (ex && ex.status === 'draft') { setC(ex); return; } }
      const objective = (['leads', 'calls', 'messages', 'traffic', 'awareness', 'installs'].includes(biz.goal || '') ? biz.goal : 'leads') as Objective;
      const daily = Math.max(100, Math.round((biz.monthly_budget || 9000) / 30));
      const ch = suggestedChannels(biz.category, objective, daily);
      setC({ id: uid(), name: `${biz.name} · ${new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`, objective, channels: planSplit(biz.category, objective, ch, daily), daily_budget: daily, duration_days: 14, start_date: today(), status: 'draft',
        creative: { templateId: templatesFor(biz.category)[0].id, headline: '', sub: `${biz.category} in ${biz.city}`, offer: '', color: biz.brand_color || '#2F5BFF', accent: '#FF6B4A' },
        copy: { ...fallbackCopy({ name: biz.name, category: biz.category, city: biz.city, objective }), headlines: [] }, audience: suggestAudience(biz.category, biz.city, objective), sim_days: 0, target_cpl: defaultTargetCpl(biz.category), created_at: new Date().toISOString() });
    })();
  }, [biz]);
  const vars: TplVars | null = useMemo(() => c && biz ? ({ name: biz.name, headline: c.creative.headline || c.copy.headlines[0] || `${biz.category} in ${biz.city}`, sub: c.creative.sub, offer: c.creative.offer, cta: c.copy.cta, color: c.creative.color, accent: c.creative.accent, phone: biz.phone, city: biz.city, logo: biz.logo_url }) : null, [c, biz]);
  if (!ready || !biz || !c || !vars) return <div className="main"><div className="skel" style={{ height: 300 }} /></div>;
  const set = (p: Partial<Campaign>) => setC({ ...c, ...p });
  const picked = c.channels.map(x => x.channel);
  const togglePlatform = (ch: Channel) => { const next = picked.includes(ch) ? picked.filter(x => x !== ch) : [...picked, ch]; set({ channels: planSplit(biz.category, c.objective, next, c.daily_budget) }); };
  const setShare = (ch: Channel, v: number) => {
    const others = c.channels.filter(x => x.channel !== ch); const rest = 100 - v; const ot = others.reduce((a, b) => a + b.share, 0) || 1;
    const next = others.map(x => ({ ...x, share: Math.round(x.share / ot * rest) })); const sum = v + next.reduce((a, b) => a + b.share, 0); if (next[0]) next[0].share += 100 - sum;
    set({ channels: [{ channel: ch, share: v }, ...next].sort((a, b) => CHANNELS.indexOf(a.channel) - CHANNELS.indexOf(b.channel)) });
  };
  function check(s: number) {
    let e: Record<string, string> = {};
    if (s === 0 && !c!.name.trim()) e.name = 'Give the campaign a name';
    if (s === 1) e = validatePlan(c!);
    if (s === 2 && !c!.creative.templateId) e.tpl = 'Choose a template';
    if (s === 3) { if (!c!.copy.headlines.filter(Boolean).length) e.copy = 'Add at least one headline'; if (c!.copy.headlines.some(h => h.length > 40)) e.copy = 'Keep headlines to 40 characters'; if (!c!.copy.primary.filter(Boolean).length) e.primary = 'Add the main ad text'; }
    if (s === 4) e = audienceErrors(c!.audience);
    setErr(e); return !Object.keys(e).length;
  }
  async function next() { if (!check(step)) return; const s = step + 1; if (s === 3 && !c!.copy.headlines.length) await genCopy(); setStep(s); try { await db().save('campaigns', { ...c!, updated_at: new Date().toISOString() }); } catch { /* draft save best-effort */ } window.scrollTo({ top: 0, behavior: 'smooth' }); }
  async function genCopy() {
    setBusy('copy'); try { const cp = await writeCopy({ name: biz!.name, category: biz!.category, city: biz!.city, objective: c!.objective, offer: c!.creative.offer }); setC(x => x && ({ ...x, copy: cp })); toast(cp.source === 'ai' ? `Written by ${cp.provider}` : 'Drafted by the offline writer'); }
    finally { setBusy(''); }
  }
  async function uploadLogo(f?: File) { if (!f) return; try { const url = await resizeImage(f, 256); const b = await db().saveBusiness({ logo_url: url }); setBiz(b); toast('Logo saved'); } catch (x: any) { toast(x.message); } }
  async function publish() {
    const probs = checkPublishable(c!); if (probs.length) { setErr({ publish: probs.join(' ') }); return; }
    setBusy('publish'); try { await publishCampaign(c!); toast('Campaign published (simulated)'); r.push('/app/campaigns/?published=' + c!.id); }
    catch (x: any) { setErr({ publish: x?.message || 'Could not publish' }); } finally { setBusy(''); }
  }
  const editList = (k: keyof AdCopy, i: number, v: string) => { const arr = [...(c.copy[k] as string[])]; arr[i] = v; set({ copy: { ...c.copy, [k]: arr } }); };
  const tpls = templatesFor(biz.category);
  return (<AppShell user={user} title="New campaign" actions={<Link className="btn btn-ghost btn-sm" href="/app/campaigns/">Cancel</Link>}>
    <div className="wiz-steps" role="list">{STEPS.map((s, i) => <button key={s} role="listitem" className={'ws' + (i === step ? ' on' : '') + (i < step ? ' done' : '')} onClick={() => i < step && setStep(i)} disabled={i > step}><span>{i < step ? <Icon n="check" size={13} stroke={3} /> : i + 1}</span>{s}</button>)}</div>
    <div className="wiz card" key={step}>
      {step === 0 && (<><h3>What should this campaign do?</h3><p className="muted small">Pick one goal. AdCognix shapes channels, text and audience around it.</p>
        <div className="grid g3 obj-grid">{OBJECTIVES.map(o => (<button key={o.id} type="button" className={'obj-card' + (c.objective === o.id ? ' on' : '')} aria-pressed={c.objective === o.id}
          onClick={() => { const ch = suggestedChannels(biz.category, o.id, c.daily_budget); set({ objective: o.id, channels: planSplit(biz.category, o.id, ch, c.daily_budget), audience: suggestAudience(biz.category, biz.city, o.id), copy: { ...c.copy, cta: o.cta, headlines: [] } }); }}>
          <span className="oc-ic"><Icon n={OBJ_ICON[o.id]} size={20} /></span><b>{o.label}</b><span className="small muted">{o.desc}</span></button>))}</div>
        <div className="field" style={{ maxWidth: 420, marginTop: 18 }}><label htmlFor="cn">Campaign name</label><input id="cn" className="input" value={c.name} onChange={e => set({ name: e.target.value.slice(0, 80) })} />{err.name && <span className="err">{err.name}</span>}</div></>)}

      {step === 1 && (<><h3>Platforms and budget</h3><p className="muted small">Suggested for {biz.category.toLowerCase()} with a “{OBJECTIVES.find(o => o.id === c.objective)?.label}” goal. Adjust anything.</p>
        <div className="row" style={{ marginBottom: 18 }}>{CHANNELS.map(ch => { const off = c.objective === 'messages' && ch === 'google'; return (
          <button key={ch} type="button" disabled={off} title={off ? 'WhatsApp message ads run on Meta only' : ''} className={'plat' + (picked.includes(ch) ? ' on' : '')} aria-pressed={picked.includes(ch)} onClick={() => togglePlatform(ch)}><PlatformIcon p={ch} size={20} />{CHANNEL_LABEL[ch]}{picked.includes(ch) && <Icon n="check" size={14} stroke={3} />}</button>); })}</div>
        {err.channels && <p className="err">{err.channels}</p>}
        <div className="grid g3" style={{ gap: 12 }}>
          <div className="field"><label htmlFor="db">Daily budget (₹)</label><input id="db" type="number" min={100} step={50} className="input" value={c.daily_budget} onChange={e => set({ daily_budget: Number(e.target.value) })} />{err.daily_budget && <span className="err">{err.daily_budget}</span>}</div>
          <div className="field"><label htmlFor="dd">Duration (days)</label><input id="dd" type="number" min={1} max={90} className="input" value={c.duration_days} onChange={e => set({ duration_days: Number(e.target.value) })} />{err.duration_days && <span className="err">{err.duration_days}</span>}</div>
          <div className="field"><label htmlFor="sd">Start date</label><input id="sd" type="date" min={today()} className="input" value={c.start_date} onChange={e => set({ start_date: e.target.value })} /></div>
        </div>
        <div className="split-box">{c.channels.map(s => (<div key={s.channel} className="split-row"><span className="row" style={{ gap: 8, width: 170 }}><PlatformIcon p={s.channel} size={18} /><b>{CHANNEL_LABEL[s.channel]}</b></span>
          <input type="range" min={c.channels.length > 1 ? 5 : 100} max={c.channels.length > 1 ? 95 : 100} value={s.share} aria-label={`${CHANNEL_LABEL[s.channel]} share`} onChange={e => setShare(s.channel, Number(e.target.value))} disabled={c.channels.length < 2} />
          <span className="small" style={{ width: 150, textAlign: 'right' }}>{s.share}% · {inr(c.daily_budget * s.share / 100)}/day</span></div>))}
          <div className="row small muted" style={{ justifyContent: 'space-between', marginTop: 8 }}><span>Total for {c.duration_days} days</span><strong style={{ color: 'var(--ink)' }}>{inr(totalBudget(c))}</strong></div></div>
        <div className="field" style={{ maxWidth: 260, marginTop: 14 }}><label htmlFor="tc">Target cost per result (₹)</label><input id="tc" type="number" min={10} className="input" value={c.target_cpl || ''} onChange={e => set({ target_cpl: Number(e.target.value) })} /><span className="small muted">Used by optimisation suggestions.</span></div></>)}

      {step === 2 && (<div className="grid g2" style={{ alignItems: 'start' }}><div><h3>Creative</h3><p className="muted small">Original layouts filled with your name, colours and offer.</p>
        <div className="tpl-grid">{tpls.map(t => (<button key={t.id} type="button" className={'tpl' + (c.creative.templateId === t.id ? ' on' : '')} aria-pressed={c.creative.templateId === t.id} onClick={() => set({ creative: { ...c.creative, templateId: t.id } })}>
          <Svg svg={renderSvg(t.id, vars, 1080, 1080)} label={t.name} /><span>{t.name}</span></button>))}</div></div>
        <div><div className="field"><label htmlFor="hl">Headline on the image</label><input id="hl" className="input" maxLength={60} value={c.creative.headline} placeholder={vars.headline} onChange={e => set({ creative: { ...c.creative, headline: e.target.value } })} /></div>
          <div className="field"><label htmlFor="sb">Line below</label><input id="sb" className="input" maxLength={70} value={c.creative.sub} onChange={e => set({ creative: { ...c.creative, sub: e.target.value } })} /></div>
          <div className="field"><label htmlFor="of">Offer (optional)</label><input id="of" className="input" maxLength={34} value={c.creative.offer} placeholder="e.g. Free consultation this month" onChange={e => set({ creative: { ...c.creative, offer: e.target.value } })} /></div>
          <div className="row"><div className="field"><label htmlFor="cc">Main colour</label><input id="cc" type="color" className="color-in" value={c.creative.color} onChange={e => set({ creative: { ...c.creative, color: e.target.value } })} /></div>
            <div className="field"><label htmlFor="ac">Accent</label><input id="ac" type="color" className="color-in" value={c.creative.accent} onChange={e => set({ creative: { ...c.creative, accent: e.target.value } })} /></div>
            <div className="field"><label htmlFor="lg">Logo</label><input id="lg" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="small" onChange={e => uploadLogo(e.target.files?.[0])} /></div></div>
          <Svg svg={renderSvg(c.creative.templateId, vars, 1080, 1080)} className="big-prev" /></div></div>)}

      {step === 3 && (<><div className="row" style={{ justifyContent: 'space-between' }}><div><h3 style={{ margin: 0 }}>Ad text, keywords and hashtags</h3><p className="muted small" style={{ margin: '4px 0 0' }}>
          {c.copy.source === 'ai' ? `Written by AI (${c.copy.provider}). Review every line.` : 'Drafted by the offline writer (no AI provider connected). Edit freely; connect a provider in Settings for AI drafts.'}</p></div>
          <button className="btn btn-ghost btn-sm" onClick={genCopy} disabled={busy === 'copy'}><Icon n="sparkle" size={15} />{busy === 'copy' ? 'Writing…' : 'Rewrite'}</button></div>
        <div className="grid g2" style={{ marginTop: 16, gap: 18 }}>
          <div>{c.copy.headlines.map((h, i) => <div key={i} className="field"><label htmlFor={'h' + i}>Headline {i + 1} <span className={'cnt' + (h.length > 40 ? ' bad' : '')}>{h.length}/40</span></label><input id={'h' + i} className="input" value={h} onChange={e => editList('headlines', i, e.target.value)} /></div>)}
            {err.copy && <p className="err">{err.copy}</p>}
            {c.copy.primary.map((p, i) => <div key={i} className="field"><label htmlFor={'p' + i}>Main text {i + 1}</label><textarea id={'p' + i} className="input" value={p} maxLength={250} onChange={e => editList('primary', i, e.target.value)} /></div>)}
            {err.primary && <p className="err">{err.primary}</p>}</div>
          <div><div className="field"><label>Descriptions</label>{c.copy.descriptions.map((d, i) => <input key={i} className="input" style={{ marginBottom: 8 }} value={d} maxLength={90} onChange={e => editList('descriptions', i, e.target.value)} aria-label={'Description ' + (i + 1)} />)}</div>
            <div className="field"><label htmlFor="kw">Search keywords (Google)</label><textarea id="kw" className="input" value={c.copy.keywords.join('\n')} onChange={e => set({ copy: { ...c.copy, keywords: e.target.value.split('\n').slice(0, 20) } })} /></div>
            <div className="field"><label htmlFor="ht">Hashtags</label><input id="ht" className="input" value={c.copy.hashtags.join(' ')} onChange={e => set({ copy: { ...c.copy, hashtags: e.target.value.split(/\s+/).filter(Boolean).slice(0, 15) } })} /></div>
            <div className="field"><label htmlFor="ct">Button</label><input id="ct" className="input" maxLength={20} value={c.copy.cta} onChange={e => set({ copy: { ...c.copy, cta: e.target.value } })} /></div></div>
        </div></>)}

      {step === 4 && (<><h3>Who should see it?</h3><p className="muted small">Suggested for your category and goal. Edit anything.</p>
        <div className="grid g2" style={{ gap: 18 }}>
          <div><div className="field"><label>Locations</label><div className="tags">{c.audience.locations.map(l => <span key={l} className="tag">{l}<button aria-label={'Remove ' + l} onClick={() => set({ audience: { ...c.audience, locations: c.audience.locations.filter(x => x !== l) } })}>×</button></span>)}</div>
              <form className="row" onSubmit={e => { e.preventDefault(); if (loc.trim()) { set({ audience: { ...c.audience, locations: Array.from(new Set([...c.audience.locations, loc.trim()])) } }); setLoc(''); } }}><input className="input" style={{ flex: 1 }} value={loc} onChange={e => setLoc(e.target.value)} placeholder="Add area or city" aria-label="Add location" /><button className="btn btn-ghost btn-sm">Add</button></form>{err.locations && <span className="err">{err.locations}</span>}</div>
            <div className="field"><label htmlFor="rk">Radius: {c.audience.radiusKm} km</label><input id="rk" type="range" min={1} max={80} value={c.audience.radiusKm} onChange={e => set({ audience: { ...c.audience, radiusKm: Number(e.target.value) } })} />{err.radiusKm && <span className="err">{err.radiusKm}</span>}</div>
            <div className="row"><div className="field"><label htmlFor="a1">Age from</label><input id="a1" type="number" min={18} max={65} className="input" style={{ width: 100 }} value={c.audience.ageMin} onChange={e => set({ audience: { ...c.audience, ageMin: Number(e.target.value) } })} /></div>
              <div className="field"><label htmlFor="a2">to</label><input id="a2" type="number" min={18} max={65} className="input" style={{ width: 100 }} value={c.audience.ageMax} onChange={e => set({ audience: { ...c.audience, ageMax: Number(e.target.value) } })} /></div>
              <div className="field"><label htmlFor="gn">Gender</label><select id="gn" className="input" value={c.audience.gender} onChange={e => set({ audience: { ...c.audience, gender: e.target.value as any } })}><option value="all">Everyone</option><option value="women">Women</option><option value="men">Men</option></select></div></div>
            {err.age && <p className="err">{err.age}</p>}</div>
          <div><div className="field"><label>Interests</label><div className="tags">{c.audience.interests.map(l => <span key={l} className="tag">{l}<button aria-label={'Remove ' + l} onClick={() => set({ audience: { ...c.audience, interests: c.audience.interests.filter(x => x !== l) } })}>×</button></span>)}</div>
              <form className="row" onSubmit={e => { e.preventDefault(); if (interest.trim()) { set({ audience: { ...c.audience, interests: Array.from(new Set([...c.audience.interests, interest.trim()])) } }); setInterest(''); } }}><input className="input" style={{ flex: 1 }} value={interest} onChange={e => setInterest(e.target.value)} placeholder="Add interest" aria-label="Add interest" /><button className="btn btn-ghost btn-sm">Add</button></form></div>
            <div className="field"><label>Languages</label><div className="row">{['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi', 'Bengali'].map(l => <label key={l} className="chk"><input type="checkbox" checked={c.audience.languages.includes(l)} onChange={e => set({ audience: { ...c.audience, languages: e.target.checked ? [...c.audience.languages, l] : c.audience.languages.filter(x => x !== l) } })} />{l}</label>)}</div></div></div>
        </div></>)}

      {step === 5 && (<><h3>Preview and publish</h3>
        <div className="sim-banner"><Icon n="shield" size={18} />{publisher().simulated ? 'Simulated: real Meta/Google publishing needs API approval. This campaign runs on example data so you can try the full flow.' : 'Publishing to live ad accounts.'}</div>
        <div className="prev-wrap">
          {picked.includes('facebook') && <div><div className="prev-l"><PlatformIcon p="facebook" size={14} />Facebook feed</div><FeedPreview tpl={c.creative.templateId} v={vars} copy={c.copy} name={biz.name} logo={biz.logo_url} /></div>}
          {picked.includes('instagram') && <div><div className="prev-l"><PlatformIcon p="instagram" size={14} />Instagram feed</div><FeedPreview platform="instagram" tpl={c.creative.templateId} v={vars} copy={c.copy} name={biz.name} logo={biz.logo_url} /></div>}
          {(picked.includes('instagram') || picked.includes('facebook')) && <div><div className="prev-l"><Icon n="play" size={14} />Story</div><StoryPreview tpl={c.creative.templateId} v={vars} copy={c.copy} name={biz.name} /></div>}
          {picked.includes('google') && <div style={{ flexBasis: '100%' }}><div className="prev-l"><PlatformIcon p="google" size={14} />Google Search</div><SearchPreview copy={c.copy} name={biz.name} site={biz.website} /></div>}
        </div>
        <div className="summary"><div><i>Goal</i><b>{OBJECTIVES.find(o => o.id === c.objective)?.label}</b></div><div><i>Channels</i><b>{c.channels.map(x => `${CHANNEL_LABEL[x.channel]} ${x.share}%`).join(', ')}</b></div>
          <div><i>Budget</i><b>{inr(c.daily_budget)}/day · {c.duration_days} days · {inr(totalBudget(c))}</b></div><div><i>Audience</i><b>{c.audience.locations.join(', ')} +{c.audience.radiusKm} km · {c.audience.ageMin}–{c.audience.ageMax}</b></div></div>
        {err.publish && <p className="err">{err.publish}</p>}
        <button className="btn btn-primary btn-lg" onClick={publish} disabled={busy === 'publish'}>{busy === 'publish' ? 'Publishing…' : 'Publish campaign'}</button></>)}

      {step < 5 && (<div className="row wiz-nav">{step > 0 ? <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button> : <span />}
        <button className="btn btn-primary" onClick={next} disabled={busy === 'copy'}>{busy === 'copy' ? 'Writing ad text…' : 'Continue'}</button></div>)}
    </div>
  </AppShell>);
}
