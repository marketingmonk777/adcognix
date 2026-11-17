// AdCognix AI gateway (Supabase Edge Function, Deno).
// One endpoint, many providers. Keys live in function secrets, never in the browser.
// Secrets: GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, GROQ_API_KEY, OLLAMA_URL (e.g. https://your-ollama-host)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
type Msg = { system?: string; prompt: string; json?: boolean; maxTokens?: number };
type Out = { text: string; inTok?: number; outTok?: number };
const env = (k: string) => Deno.env.get(k) || '';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };

async function openaiCompat(url: string, key: string, model: string, m: Msg): Promise<Out> {
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(key ? { authorization: `Bearer ${key}` } : {}) },
    body: JSON.stringify({ model, max_tokens: m.maxTokens || 800, messages: [...(m.system ? [{ role: 'system', content: m.system }] : []), { role: 'user', content: m.prompt }],
      ...(m.json ? { response_format: { type: 'json_object' } } : {}) }) });
  const j = await r.json(); if (!r.ok) throw new Error(j?.error?.message || r.statusText);
  return { text: j.choices?.[0]?.message?.content || '', inTok: j.usage?.prompt_tokens, outTok: j.usage?.completion_tokens };
}
const PROVIDERS: Record<string, (model: string, m: Msg) => Promise<Out>> = {
  async gemini(model, m) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env('GEMINI_API_KEY')}`, { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...(m.system ? { systemInstruction: { parts: [{ text: m.system }] } } : {}), contents: [{ role: 'user', parts: [{ text: m.prompt }] }],
        generationConfig: { maxOutputTokens: m.maxTokens || 800, ...(m.json ? { responseMimeType: 'application/json' } : {}) } }) });
    const j = await r.json(); if (!r.ok) throw new Error(j?.error?.message || r.statusText);
    return { text: j.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '', inTok: j.usageMetadata?.promptTokenCount, outTok: j.usageMetadata?.candidatesTokenCount };
  },
  openai: (model, m) => openaiCompat('https://api.openai.com/v1/chat/completions', env('OPENAI_API_KEY'), model, m),
  groq: (model, m) => openaiCompat('https://api.groq.com/openai/v1/chat/completions', env('GROQ_API_KEY'), model, m),
  ollama: (model, m) => openaiCompat(env('OLLAMA_URL').replace(/\/$/, '') + '/v1/chat/completions', '', model, m),
  async anthropic(model, m) {
    const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'content-type': 'application/json', 'x-api-key': env('ANTHROPIC_API_KEY'), 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model, max_tokens: m.maxTokens || 800, system: m.system, messages: [{ role: 'user', content: m.prompt }] }) });
    const j = await r.json(); if (!r.ok) throw new Error(j?.error?.message || r.statusText);
    return { text: j.content?.map((c: any) => c.text).join('') || '', inTok: j.usage?.input_tokens, outTok: j.usage?.output_tokens };
  },
};
// rough USD per 1M tokens [in, out] for cost monitoring; 0 = free tier/self-hosted
const PRICE: Record<string, [number, number]> = { 'gpt-4o-mini': [0.15, 0.6], 'gpt-4.1': [2, 8], 'claude-sonnet-4-5': [3, 15], 'claude-haiku-4-5': [1, 5] };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const sb = createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } });
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'sign in required' }), { status: 401, headers: cors });
  const { business_id, task, system, prompt, json } = await req.json();
  if (!prompt || String(prompt).length > 8000) return new Response(JSON.stringify({ error: 'bad prompt' }), { status: 400, headers: cors });
  const { data: biz } = await sb.from('businesses').select('id,settings').eq('id', business_id).maybeSingle(); // RLS: members only
  if (!biz) return new Response(JSON.stringify({ error: 'no access' }), { status: 403, headers: cors });
  const cfg = biz.settings?.ai?.perTask?.[task] || biz.settings?.ai || { provider: 'gemini', model: 'gemini-2.5-flash' };
  const run = PROVIDERS[cfg.provider]; if (!run) return new Response(JSON.stringify({ error: 'unknown provider' }), { status: 400, headers: cors });
  let out: Out | null = null, err = '';
  try { out = await run(cfg.model, { system, prompt, json }); } catch (e) { err = (e as Error).message; }
  const p = PRICE[cfg.model] || [0, 0];
  await sb.from('ai_usage').insert({ business_id, task, provider: cfg.provider, model: cfg.model, input_tokens: out?.inTok, output_tokens: out?.outTok,
    cost_usd: out ? ((out.inTok || 0) * p[0] + (out.outTok || 0) * p[1]) / 1e6 : 0, ok: !!out });
  return new Response(JSON.stringify(out ? { text: out.text, provider: cfg.provider, model: cfg.model } : { error: err }), { status: out ? 200 : 502, headers: { ...cors, 'content-type': 'application/json' } });
});
