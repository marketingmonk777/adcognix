// AdCognix plans. Prices are draft and editable in Admin → Plans. Ad spend is paid to the platforms separately.
export type Plan = { id: string; name: string; price: number; period: 'month'; blurb: string; features: string[]; limits: { activeCampaigns: number; aiCopies: number }; highlight?: boolean };
export const PLANS: Plan[] = [
  { id: 'free', name: 'Starter', price: 0, period: 'month', blurb: 'Try AdCognix with one campaign.', features: ['1 active campaign', 'Lead inbox and CSV export', 'Festival posts and captions', 'Business card and mini site'], limits: { activeCampaigns: 1, aiCopies: 20 } },
  { id: 'growth', name: 'Growth', price: 999, period: 'month', blurb: 'For a business advertising every month.', features: ['5 active campaigns', 'All creative templates', 'Optimisation suggestions', 'AI copy for every campaign', 'Email lead alerts'], limits: { activeCampaigns: 5, aiCopies: 300 }, highlight: true },
  { id: 'pro', name: 'Pro', price: 2499, period: 'month', blurb: 'For teams and multi-location businesses.', features: ['Unlimited campaigns', 'Team members', 'Priority specialist support', 'Everything in Growth'], limits: { activeCampaigns: 999, aiCopies: 2000 } },
];
export const GST_RATE = 0.18;
export const withGst = (n: number) => Math.round(n * (1 + GST_RATE));
