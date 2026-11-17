// Data layer. One interface, two adapters: Supabase (real) and Local (demo, this browser only).
// Pages never talk to a backend directly, so the backend can be swapped later.
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getBackend, base } from './config';
import type { AuditRow, Business, ConsultRequest, User } from './types';

export type Coll = 'campaigns' | 'leads' | 'lead_notes' | 'notifications' | 'wallet_txns' | 'subscriptions' | 'posts';
export type ListOpts = { eq?: Record<string, string | number | boolean>; limit?: number };

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
  // Business-scoped collections (RLS: members of the business only).
  list<T>(c: Coll, o?: ListOpts): Promise<T[]>;
  save<T extends { id: string }>(c: Coll, row: T): Promise<T>;
  saveMany<T extends { id: string }>(c: Coll, rows: T[]): Promise<void>;
  remove(c: Coll, id: string): Promise<void>;
  // Admin (RLS: is_admin()) and shared catalogue (templates, festivals, plans overrides).
  adminList<T>(c: Coll | 'businesses' | 'profiles', limit?: number): Promise<T[]>;
  listAudit(limit?: number): Promise<AuditRow[]>;
  getCatalog<T>(key: string, d: T): Promise<T>;
  setCatalog(key: string, value: unknown): Promise<void>;
  // AI gateway (edge function). Throws when no provider is reachable; callers fall back to offline writers.
  ai(task: string, system: string, prompt: string): Promise<{ text: string; provider?: string }>;
}

export const uid = () => (crypto as any).randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
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
  async log(action: string, meta = {}) { const l = this.get<any[]>('audit', []); l.unshift({ action, meta, at: now() }); this.set('audit', l.slice(0, 300)); }
  private rows(c: string) { return this.get<any[]>('t.' + c, []); }
  async list<T>(c: Coll, o: ListOpts = {}) {
    let r = this.rows(c); if (o.eq) r = r.filter(x => Object.entries(o.eq!).every(([k, v]) => x[k] === v));
    r = [...r].sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || ''))); return (o.limit ? r.slice(0, o.limit) : r) as T[];
  }
  async save<T extends { id: string }>(c: Coll, row: T) { await this.saveMany(c, [row]); return row; }
  async saveMany<T extends { id: string }>(c: Coll, rows: T[]) {
    const r = this.rows(c); const idx = new Map(r.map((x, i) => [x.id, i]));
    for (const row of rows) { const i = idx.get(row.id); if (i === undefined) { r.push(row); idx.set(row.id, r.length - 1); } else r[i] = { ...r[i], ...row }; }
    this.set('t.' + c, r);
  }
  async remove(c: Coll, id: string) { this.set('t.' + c, this.rows(c).filter(x => x.id !== id)); }
  async adminList<T>(c: Coll | 'businesses' | 'profiles') {
    if (c === 'businesses') { const b = await this.getBusiness(); return (b ? [b] : []) as T[]; }
    if (c === 'profiles') { const u = await this.currentUser(); return (u ? [{ id: u.id, email: u.email, is_admin: u.is_admin, created_at: (await this.getBusiness())?.created_at }] : []) as T[]; }
    return this.list<T>(c);
  }
  async listAudit(limit = 200) { return this.get<AuditRow[]>('audit', []).slice(0, limit); }
  async getCatalog<T>(key: string, d: T) { return this.get<T>('cat.' + key, d); }
  async setCatalog(key: string, value: unknown) { this.set('cat.' + key, value); await this.log('catalog.update', { key }); }
  async ai(): Promise<{ text: string; provider?: string }> { throw new Error('No AI provider in demo mode'); }
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
  async log(action: string, meta = {}) { const b = this.bizId; await this.sb.from('audit_log').insert({ action, meta, ...(b ? { business_id: b } : {}) }); }
  private bizId: string | null = null;
  private async biz() { if (!this.bizId) { const b = await this.getBusiness(); if (!b) throw new Error('Set up your business first'); this.bizId = b.id; } return this.bizId; }
  async list<T>(c: Coll, o: ListOpts = {}) {
    let q = this.sb.from(c).select('*').eq('business_id', await this.biz());
    for (const [k, v] of Object.entries(o.eq || {})) q = q.eq(k, v as any);
    const { data, error } = await q.order('created_at', { ascending: false }).limit(o.limit || 1000); if (error) throw error; return (data || []) as T[];
  }
  async save<T extends { id: string }>(c: Coll, row: T) {
    const { data, error } = await this.sb.from(c).upsert({ ...row, business_id: await this.biz() }).select().single(); if (error) throw error; return data as T;
  }
  async saveMany<T extends { id: string }>(c: Coll, rows: T[]) {
    if (!rows.length) return; const b = await this.biz();
    const { error } = await this.sb.from(c).upsert(rows.map(r => ({ ...r, business_id: b }))); if (error) throw error;
  }
  async remove(c: Coll, id: string) { const { error } = await this.sb.from(c).delete().eq('id', id); if (error) throw error; }
  async adminList<T>(c: Coll | 'businesses' | 'profiles', limit = 500) {
    const { data, error } = await this.sb.from(c).select('*').order('created_at', { ascending: false }).limit(limit); if (error) throw error; return (data || []) as T[];
  }
  async listAudit(limit = 200) { const { data, error } = await this.sb.from('audit_log').select('*').order('created_at', { ascending: false }).limit(limit); if (error) throw error; return (data || []) as AuditRow[]; }
  async getCatalog<T>(key: string, d: T) { const { data } = await this.sb.from('app_catalog').select('value').eq('key', key).maybeSingle(); return (data?.value as T) ?? d; }
  async setCatalog(key: string, value: unknown) { const { error } = await this.sb.from('app_catalog').upsert({ key, value }); if (error) throw error; await this.log('catalog.update', { key }); }
  async ai(task: string, system: string, prompt: string) {
    const { data, error } = await this.sb.functions.invoke('ai', { body: { business_id: await this.biz(), task, system, prompt, json: true } });
    if (error || !data?.text) throw new Error(error?.message || data?.error || 'AI unavailable'); return { text: data.text as string, provider: `${data.provider}/${data.model}` };
  }
}

let inst: DataAdapter | null = null;
export function db(): DataAdapter {
  if (inst) return inst;
  const c = getBackend();
  inst = c ? new SupabaseAdapter(createClient(c.url, c.key)) : new LocalAdapter();
  return inst;
}
export function resetDb() { inst = null; }
