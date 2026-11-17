'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/data';
import type { Business, User } from '@/lib/types';
// Client guard. Real protection is server-side (Supabase RLS); this only routes the UI.
export function useSession(opts: { needBusiness?: boolean; needAdmin?: boolean } = {}) {
  const r = useRouter();
  const [user, setUser] = useState<User | null>(null); const [biz, setBiz] = useState<Business | null>(null); const [ready, setReady] = useState(false);
  useEffect(() => { (async () => {
    const u = await db().currentUser(); if (!u) return r.replace('/login/');
    if (opts.needAdmin && !u.is_admin) return r.replace('/app/');
    const b = await db().getBusiness().catch(() => null);
    if (opts.needBusiness && !b) return r.replace('/onboarding/');
    setUser(u); setBiz(b); setReady(true);
  })(); }, []); // eslint-disable-line
  return { user, biz, setBiz, ready };
}
