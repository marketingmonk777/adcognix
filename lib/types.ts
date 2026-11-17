export type Role = 'owner' | 'admin' | 'member';
export type Business = {
  id: string; name: string; category: string; city: string; phone: string;
  website?: string; brand_color: string; logo_url?: string; goal?: string; monthly_budget?: number; settings?: Record<string, any>;
  created_at: string; updated_at: string;
};
export type User = { id: string; email: string; name?: string; is_admin?: boolean };
export type ConsultRequest = { id?: string; business_name: string; phone: string; city?: string; message?: string; source?: string; created_at?: string };
export const CATEGORIES = ['Real estate','Education & coaching','Healthcare & clinics','Restaurants & cafés','Retail & fashion','Beauty & wellness','Finance & insurance','Interiors & home services','Manufacturing & B2B','Travel & hospitality','Automobile','Events & weddings','Other'];
export const GOALS = [
  { id: 'leads', label: 'Get enquiries (leads)' }, { id: 'calls', label: 'Get phone calls' },
  { id: 'messages', label: 'Get WhatsApp messages' }, { id: 'traffic', label: 'Website visits' },
  { id: 'awareness', label: 'Brand awareness' }, { id: 'installs', label: 'App installs' }];
export const BRAND_COLORS = ['#2F5BFF','#0B1B3F','#FF6B4A','#14B88F','#7C3AED','#E8A317','#DB2777','#0E1525'];

// ---- Stage 2–5 entities ----
export type Objective = 'leads' | 'calls' | 'messages' | 'traffic' | 'awareness' | 'installs';
export type Channel = 'facebook' | 'instagram' | 'google';
export type ChannelShare = { channel: Channel; share: number };
export type Audience = { locations: string[]; radiusKm: number; ageMin: number; ageMax: number; gender: 'all' | 'women' | 'men'; interests: string[]; languages: string[] };
export type AdCopy = { headlines: string[]; primary: string[]; descriptions: string[]; keywords: string[]; hashtags: string[]; cta: string; source: 'ai' | 'offline'; provider?: string };
export type Creative = { templateId: string; headline: string; sub: string; offer: string; color: string; accent: string };
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended' | 'failed';
export type PublishResult = { adapter: string; simulated: boolean; refs: Partial<Record<Channel, string>>; at: string; note: string };
export type Campaign = {
  id: string; business_id?: string; name: string; objective: Objective; channels: ChannelShare[];
  daily_budget: number; duration_days: number; start_date: string; status: CampaignStatus;
  creative: Creative; copy: AdCopy; audience: Audience; publish?: PublishResult | null;
  sim_days: number; target_cpl?: number; applied?: string[]; created_at: string; updated_at?: string;
};
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'won' | 'lost';
export const LEAD_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'won', 'lost'];
export type Lead = { id: string; business_id?: string; campaign_id?: string | null; name: string; phone: string; email?: string; message?: string; channel?: Channel; status: LeadStatus; example?: boolean; created_at: string; updated_at?: string };
export type LeadNote = { id: string; business_id?: string; lead_id: string; text: string; created_at: string };
export type AppNotification = { id: string; business_id?: string; kind: 'lead' | 'campaign' | 'billing' | 'tip'; title: string; body?: string; href?: string; read: boolean; created_at: string };
export type WalletTxn = { id: string; business_id?: string; kind: 'topup' | 'plan' | 'refund' | 'adjust'; amount: number; status: 'success' | 'failed' | 'pending'; provider: 'mock' | 'razorpay'; ref?: string; note?: string; created_at: string };
export type Subscription = { id: string; business_id?: string; plan_id: string; status: 'active' | 'cancelled'; started_at: string; renews_at: string; created_at: string };
export type SavedPost = { id: string; business_id?: string; festival_date: string; name: string; caption: string; template: string; created_at: string };
export type AuditRow = { id?: string | number; action: string; meta?: Record<string, unknown>; at?: string; created_at?: string; user_id?: string };
