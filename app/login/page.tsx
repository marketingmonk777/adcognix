'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/data';
import { emailOk } from '@/lib/validate';
import { Logo } from '@/components/Logo';

export default function Login() {
  const r = useRouter();
  const [email, setEmail] = useState(''); const [err, setErr] = useState(''); const [sent, setSent] = useState(false); const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<'cloud' | 'demo'>('demo');
  useEffect(() => { setMode(db().mode); db().currentUser().then(u => { if (u) r.replace('/app/'); }); }, [r]);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setErr('');
    if (!emailOk(email)) return setErr('Enter a valid email address');
    setBusy(true);
    try { await db().signInEmail(email.trim().toLowerCase()); if (db().mode === 'demo') r.replace('/onboarding/'); else setSent(true); }
    catch (x: any) { setErr(x?.message || 'Could not sign in. Try again.'); } finally { setBusy(false); }
  }
  async function google() { setErr(''); try { await db().signInGoogle(); if (db().mode === 'demo') r.replace('/onboarding/'); } catch (x: any) { setErr(x?.message || 'Google sign-in is not set up yet.'); } }
  return (<div className="auth-wrap"><div className="auth-card">
    <Link href="/" style={{ display: 'inline-block', marginBottom: 28 }}><Logo /></Link>
    <div className="card">
      {sent ? (<><h2 style={{ fontSize: 24 }}>Check your inbox</h2><p className="muted">We sent a sign-in link to <strong>{email}</strong>. Open it on this device to continue.</p>
        <button className="btn btn-ghost" onClick={() => setSent(false)}>Use a different email</button></>) : (<>
        <h2 style={{ fontSize: 24 }}>Sign in to AdCognix</h2>
        <p className="muted small">New here? The same step creates your account.</p>
        <form onSubmit={go} noValidate>
          <div className="field"><label htmlFor="em">Work email</label><input id="em" className="input" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@business.com" /></div>
          {err && <p className="err">{err}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={busy}>{busy ? 'Please wait…' : mode === 'demo' ? 'Continue' : 'Email me a sign-in link'}</button>
        </form>
        <div className="row" style={{ margin: '14px 0', color: 'var(--muted)', fontSize: 12 }}><span style={{ flex: 1, height: 1, background: 'var(--line)' }} />or<span style={{ flex: 1, height: 1, background: 'var(--line)' }} /></div>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={google}>Continue with Google</button></>)}
    </div>
    {mode === 'demo' && <p className="small muted" style={{ marginTop: 14, textAlign: 'center' }}><span className="demo-pill">Demo mode</span> No backend connected. Data stays in this browser.</p>}
  </div></div>);
}
