'use client';
import { useEffect, useState } from 'react';
import { decodeCard, type CardData } from '@/lib/card';
import { BizCard, MiniSite, SaveContact } from '@/components/CardView';
// Public card / mini website. Data comes from the link itself (after #), so nothing is stored on a server.
export default function PublicCard() {
  const [d, setD] = useState<CardData | null | undefined>(undefined); const [mode, setMode] = useState<'card' | 'site'>('card');
  useEffect(() => { const read = () => { setD(decodeCard(location.hash)); setMode(new URLSearchParams(location.search).get('v') === 'site' ? 'site' : 'card'); if (document) document.title = 'AdCognix card'; }; read(); addEventListener('hashchange', read); return () => removeEventListener('hashchange', read); }, []);
  useEffect(() => { if (d) document.title = d.name + (mode === 'site' ? '' : ' · Digital card'); }, [d, mode]);
  if (d === undefined) return <div className="auth-wrap"><div className="skel" style={{ width: 340, height: 420 }} /></div>;
  if (!d) return <div className="auth-wrap"><div className="card" style={{ maxWidth: 420, textAlign: 'center' }}><h2 style={{ fontSize: 22 }}>This card link is incomplete</h2><p className="muted">Ask the sender to share the full link again.</p></div></div>;
  if (mode === 'site') return <MiniSite d={d} />;
  return (<div className="card-page" style={{ ['--bc' as any]: d.color }}><div><BizCard d={d} /><div className="row" style={{ justifyContent: 'center', marginTop: 16 }}><SaveContact d={d} /></div>
    <p className="small" style={{ textAlign: 'center', marginTop: 18, opacity: .7 }}>Digital card made with AdCognix</p></div></div>);
}
