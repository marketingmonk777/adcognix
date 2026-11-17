// Data layer. One interface, two adapters: Supabase (real) and Local (demo, this browser only).
// Pages never talk to a backend directly, so the backend can be swapped later.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getBackend, base } from './config';
import type { Business, ConsultRequest, User } from './types';

export interface DataAdapter {
  mode: 'cloud' | 'demo';
  currentUser(): Promise<User | null>;
  signInEmail(email: string): Promise<void>;
  signInGoogle(): Promise<void>;
  signOut(): Promise<void>;
  getBusiness(): Promise<Business | null>;
  saveBusiness(b: Partial<Business>): Promise<Business>;
  createConsult(r: ConsultRequest): Promise<void>;
  listConsults(): Promise<ConsultRequest[]>;
  log(action: string, meta?: Record<string, unknown>): Promise<void>;
}

const uid = () => (crypto as any).randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();

class LocalAdapter implements DataAdapter {
  mode = 'demo' as const;
  private get<T>(k: string, d: T): T { try { return JSON.parse(localStorage.getItem('acx.' + k) || 'null') ?? d; } catch { return d; } }
  private set(k: string, v: unknown) { localStorage.setItem('acx.' + k, JSON.stringify(v)); }
  async currentUser() { return this.get<User | null>('user', null); }
  async signInEmail(email: string) { this.set('user', { id: 'demo-' + email, email, is_admin: true }); }
  async signInGoogle() { this.set('user', { id: 'demo-google', email: 'demo@adcognix.app', is_admin: true }); }
  async signOut() { localStorage.removeItem('acx.user'); }
  async getBusiness() { return this.get<Business | null>('business', null); }
  async saveBusiness(b: Partial<Business>) {
    const cur = await this.getBusiness();
    const next = { ...(cur || { id: uid(), created_at: now() }), ...b, updated_at: now() } as Business;
    this.set('business', next); await this.log(cur ? 'business.update' : 'business.create'); return next;
  }
  async createConsult(r: ConsultRequest) { const l = this.get<ConsultRequest[]>('consults', []); l.unshift({ ...r, id: uid(), created_at: now() }); this.set('consults', l); }
  async listConsults() { return this.get<ConsultRequest[]>('consults', []); }
  async log(action: string, meta = {}) { const l = this.get<any[]>('audit', []); l.unshift({ action, meta, at: now() }); this.set('audit', l.slice(0, 200)); }
}

class SupabaseAdapter implements DataAdapter {
  mode = 'cloud' as const;
  constructor(private sb: SupabaseClient) {}
  async currentUser() {
    const { data } = await this.sb.auth.getUser(); const u = data.user; if (!u) return null;
    const { data: p } = await this.sb.from('profiles').select('full_name,is_admin').eq('id', u.id).maybeSingle();
    return { id: u.id, email: u.email || '', name: p?.full_name, is_admin: !!p?.is_admin };
  }
  private redirect() { return location.origin + base + '/app/'; }
  async signInEmail(email: string) { const { error } = await this.sb.auth.signInWithOtp({ email, options: { emailRedirectTo: this.redirect() } }); if (error) throw error; }
  async signInGoogle() { const { error } = await this.sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: this.redirect() } }); if (error) throw error; }
  async signOut() { await this.sb.auth.signOut(); }
  async getBusiness() {
    const { data, error } = await this.sb.from('businesses').select('*').order('created_at').limit(1).maybeSingle();
    if (error) throw error; return data as Business | null;
  }
  async saveBusiness(b: Partial<Business>) {
    const cur = await this.getBusiness();
    if (cur) { const { data, error } = await this.sb.from('businesses').update(b).eq('id', cur.id).select().single(); if (error) throw error; await this.log('business.update'); return data as Business; }
    const { data, error } = await this.sb.rpc('create_business', { p: b }); if (error) throw error; return data as Business;
  }
  async createConsult(r: ConsultRequest) { const { error } = await this.sb.from('consult_requests').insert(r); if (error) throw error; }
  async listConsults() { const { data, error } = await this.sb.from('consult_requests').select('*').order('created_at', { ascending: false }).limit(200); if (error) throw error; return data || []; }
  async log(action: string, meta = {}) { await this.sb.from('audit_log').insert({ action, meta }); }
}

let inst: DataAdapter | null = null;
export function db(): DataAdapter {
  if (inst) return inst;
  const c = getBackend();
  inst = c ? new SupabaseAdapter(createClient(c.url, c.key)) : new LocalAdapter();
  return inst;
}
export function resetDb() { inst = null; }
