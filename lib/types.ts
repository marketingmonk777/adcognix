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
