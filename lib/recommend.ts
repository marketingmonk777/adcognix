// Budget split recommender (rules-based, explainable). Used by the dashboard and the campaign wizard.
export type Split = { channel: 'facebook' | 'instagram' | 'google'; share: number; why: string }[];
const SEARCH_HEAVY = ['Healthcare & clinics', 'Interiors & home services', 'Manufacturing & B2B', 'Automobile', 'Finance & insurance', 'Travel & hospitality'];
const VISUAL = ['Restaurants & cafés', 'Retail & fashion', 'Beauty & wellness', 'Events & weddings', 'Real estate'];
export function recommendSplit(category: string, goal: string, monthly: number): { split: Split; daily: number; note: string } {
  let g = 0.3, f = 0.4, i = 0.3;
  if (SEARCH_HEAVY.includes(category)) { g = 0.5; f = 0.3; i = 0.2; }
  if (VISUAL.includes(category)) { g = 0.2; f = 0.4; i = 0.4; }
  if (goal === 'calls') { g += 0.1; i -= 0.1; }
  if (goal === 'messages') { g -= 0.1; f += 0.1; }
  if (goal === 'awareness') { g -= 0.1; i += 0.1; }
  if (monthly < 6000) { // small budgets: concentrate on two channels
    const low = Math.min(g, f, i); if (low === g) { f += g / 2; i += g / 2; g = 0; } else if (low === i) { f += i; i = 0; } else { i += f; f = 0; }
  }
  const t = g + f + i; const r = (x: number) => Math.round((x / t) * 100);
  const split: Split = ([
    ['google', r(g), 'People searching for what you sell right now'],
    ['facebook', r(f), 'Lead forms and WhatsApp chats from local audiences'],
    ['instagram', r(i), 'Visual reach with reels and stories'],
  ] as const).filter(([, s]) => s > 0).map(([channel, share, why]) => ({ channel, share, why }));
  const diff = 100 - split.reduce((a, b) => a + b.share, 0); if (split[0]) split[0].share += diff;
  const daily = Math.round(monthly / 30);
  return { split, daily, note: monthly < 6000 ? 'Smaller budgets work better on two channels, so the third is left out.' : 'Spread across three channels. Shifts toward what performs after the first week.' };
}
