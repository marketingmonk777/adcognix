// Provider-independent AI layer. The browser never holds provider keys:
// calls go to the `ai` edge function, which reads keys from server secrets and logs usage.
export type ProviderId = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'ollama';
export const PROVIDERS: { id: ProviderId; name: string; free: boolean; models: string[]; note: string }[] = [
  { id: 'gemini', name: 'Google Gemini', free: true, models: ['gemini-2.5-flash', 'gemini-2.5-pro'], note: 'Free tier available. Recommended default.' },
  { id: 'groq', name: 'Groq (Llama, open models)', free: true, models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'], note: 'Free tier, very fast.' },
  { id: 'ollama', name: 'Ollama (self-hosted)', free: true, models: ['llama3.1', 'qwen2.5', 'mistral'], note: 'Runs on your own server. No per-call cost.' },
  { id: 'openai', name: 'OpenAI', free: false, models: ['gpt-4o-mini', 'gpt-4.1'], note: 'Paid per use.' },
  { id: 'anthropic', name: 'Anthropic Claude', free: false, models: ['claude-sonnet-4-5', 'claude-haiku-4-5'], note: 'Paid per use.' },
];
export const AI_TASKS = [
  { id: 'ad_copy', label: 'Ad headlines and text' }, { id: 'keywords', label: 'Keywords and hashtags' },
  { id: 'audience', label: 'Audience suggestions' }, { id: 'optimize', label: 'Optimisation tips' }];
export type AiSettings = { provider: ProviderId; model: string; perTask?: Record<string, { provider: ProviderId; model: string }> };
