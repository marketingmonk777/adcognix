'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from '@/components/useSession';
import { AppShell } from '@/components/AppShell';
import { Svg } from '@/components/AdPreview';
import { Icon } from '@/components/Icons';
import { toast } from '@/components/Toast';
import { db, uid } from '@/lib/data';
import { FESTIVALS, fillCaption, type Festival } from '@/lib/festivals';
import { postSvg, POST_STYLES } from '@/lib/posts';
import { svgToPng, downloadBlob } from '@/lib/png';
import type { SavedPost } from '@/lib/types';
const fmt = (d: string) => new Date(d + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
export default function Studio() {
  const { ready, user, biz } = useSession({ needBusiness: true });
  const today = new Date().toISOString().slice(0, 10);
  const [kind, setKind] = useState<'all' | 'festival' | 'business'>('all'); const [month, setMonth] = useState(''); const [q, setQ] = useState('');
  const [sel, setSel] = useState<Festival | null>(null); const [style, setStyle] = useState(0); const [text, setText] = useState(''); const [tags, setTags] = useState(''); const [size, setSize] = useState<'sq' | 'story'>('sq');
  const [saved, setSaved] = useState<SavedPost[]>([]);
  useEffect(() => { if (!ready) return; db().list<SavedPost>('posts').then(setSaved).catch(() => {}); const d = new URLSearchParams(location.search).get('d'); const f = (d && FESTIVALS.find(x => x.date === d)) || FESTIVALS.find(x => x.date >= today); if (f) pick(f); }, [ready]); // eslint-disable-line
  function pick(f: Festival) { setSel(f); if (biz) { const c = fillCaption(f, biz); setText(c.text); setTags(c.hashtags.join(' ')); } }
  useEffect(() => { if (biz && sel && !text) pick(sel); }, [biz]); // eslint-disable-line
  const list = useMemo(() => FESTIVALS.filter(f => (kind === 'all' || (kind === 'business' ? f.kind === 'business' : f.kind !== 'business')) && (!month || f.date.slice(0, 7) === month) && (!q || f.name.toLowerCase().includes(q.toLowerCase())) && (month || q || f.date >= today)), [kind, month, q, today]);
  const months = Array.from(new Set(FESTIVALS.map(f => f.date.slice(0, 7))));
  if (!ready || !biz) return <div className="main"><div className="skel" style={{ height: 200 }} /></div>;
  const W = 1080, H = size === 'sq' ? 1080 : 1920; const svg = sel ? postSvg(sel, biz, text, style, W, H) : '';
  async function download() { if (!sel) return; try { const b = await svgToPng(svg, W, H); downloadBlob(b, `${sel.date}-${sel.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-${POST_STYLES[style].toLowerCase()}.png`); toast('PNG downloaded'); } catch (x: any) { toast(x.message); } }
  async function save() { if (!sel) return; const p: SavedPost = { id: uid(), festival_date: sel.date, name: sel.name, caption: text + '\n\n' + tags, template: POST_STYLES[style], created_at: new Date().toISOString() }; await db().save('posts', p); setSaved([p, ...saved]); toast('Saved to your posts'); }
  async function copy() { try { await navigator.clipboard.writeText(text + '\n\n' + tags); toast('Caption copied'); } catch { toast('Select the caption and copy it'); } }
  return (<AppShell user={user} title="Post studio">
    <div className="studio">
      <div className="card st-list"><div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <div className="tabs" style={{ margin: 0 }}>{(['all', 'festival', 'business'] as const).map(k => <button key={k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>{k === 'all' ? 'All' : k === 'festival' ? 'Festivals' : 'Business days'}</button>)}</div></div>
        <div className="row" style={{ gap: 8, marginBottom: 10 }}><select className="input" style={{ flex: 1, height: 36 }} aria-label="Month" value={month} onChange={e => setMonth(e.target.value)}><option value="">Upcoming</option>{months.map(m => <option key={m} value={m}>{new Date(m + '-01T00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</option>)}</select>
          <input className="input" style={{ flex: 1, height: 36 }} placeholder="Search" aria-label="Search days" value={q} onChange={e => setQ(e.target.value)} /></div>
        <div className="st-scroll">{!list.length ? <p className="small muted">Nothing matches.</p> : list.map(f => (<button key={f.date + f.name} className={'st-item' + (sel === f ? ' on' : '')} onClick={() => pick(f)}>
          <span className="st-date"><b>{new Date(f.date + 'T00:00').getDate()}</b><i>{new Date(f.date + 'T00:00').toLocaleDateString('en-IN', { month: 'short' })}</i></span>
          <span style={{ flex: 1 }}><b>{f.name}</b><i>{f.kind === 'business' ? 'Business day' : f.kind === 'national' ? 'National day' : 'Festival'}{f.moon ? ' · date may shift with moon sighting' : ''}</i></span></button>))}</div>
        <p className="small muted" style={{ marginTop: 8 }}>Festival dates from the Government of India (DoPT) holiday lists for 2026 and 2027. Regional dates can differ.</p></div>
      {sel && (<div className="card st-edit"><div className="row" style={{ justifyContent: 'space-between' }}><div><h3 style={{ margin: 0 }}>{sel.name}</h3><div className="small muted">{fmt(sel.date)}</div></div>
          <div className="row" style={{ gap: 6 }}><div className="tabs" style={{ margin: 0 }}>{POST_STYLES.map((s, i) => <button key={s} className={style === i ? 'on' : ''} onClick={() => setStyle(i)}>{s}</button>)}</div>
            <div className="tabs" style={{ margin: 0 }}><button className={size === 'sq' ? 'on' : ''} onClick={() => setSize('sq')}>Post</button><button className={size === 'story' ? 'on' : ''} onClick={() => setSize('story')}>Story</button></div></div></div>
        <div className="st-grid"><Svg svg={svg} className={'st-prev ' + size} label={`${sel.name} post`} />
          <div><div className="field"><label htmlFor="cap">Caption</label><textarea id="cap" className="input" rows={5} maxLength={400} value={text} onChange={e => setText(e.target.value)} /></div>
            <div className="field"><label htmlFor="tg">Hashtags</label><textarea id="tg" className="input" rows={2} value={tags} onChange={e => setTags(e.target.value)} /></div>
            <div className="row"><button className="btn btn-primary" onClick={download}><Icon n="download" size={16} color="#fff" />Download PNG</button><button className="btn btn-ghost" onClick={copy}>Copy caption</button><button className="btn btn-ghost" onClick={save}>Save</button></div>
            {saved.length > 0 && <div style={{ marginTop: 18 }}><div className="small muted" style={{ marginBottom: 6 }}>Saved posts</div>{saved.slice(0, 5).map(p => <div key={p.id} className="note"><span>{p.name} · {p.template}</span><i>{fmt(p.festival_date)}</i></div>)}</div>}</div></div></div>)}
    </div>
  </AppShell>);
}
