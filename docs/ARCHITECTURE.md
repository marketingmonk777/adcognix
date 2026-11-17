# AdCognix: architecture plan (Stage D)
Goal: free to start, simple, and every external tool swappable.

## Stack
- **Web app + admin:** Next.js (React, TypeScript), Tailwind with our own design tokens. Free hosting on Vercel or Cloudflare Pages.
- **Backend/DB/Auth/Storage:** Supabase free tier (Postgres + Row Level Security, Auth, Storage, Edge Functions, pg_cron). Can be self-hosted later; access goes only through the `/lib/data` layer.
- **Mobile:** Expo (React Native, TypeScript), sharing types and API client with web. Builds on the EAS free tier. Store accounts are paid (Google $25 one-time, Apple $99/year).
- **AI:** `ai/` adapter with one interface `generate({task, input}) → output`. Providers: Gemini (free tier, default), OpenAI, Anthropic, Groq, Ollama (local). Chosen in admin settings per task; usage and cost are logged to `ai_usage`.
- **Ad publishing:** `publishers/` adapter with `meta`, `google` and `mock`. Real Meta publishing needs a Meta app with Marketing API access (app review + Business verification). Google Ads needs a developer token. Until approved, the mock adapter is used and clearly labelled.
- **Payments:** `payments/` adapter: Razorpay (test mode free), with a mock adapter.
- **Notifications:** email via Resend free tier / SMTP adapter; web push; WhatsApp Cloud API adapter (optional).
- **Creative rendering:** templates stored as JSON layers. Rendering is client-side (canvas → PNG), with server-side satori/resvg for exports.

## Core tables
profiles, businesses, business_members(role), plans, subscriptions, wallet_txns, templates, template_categories, festivals, creatives, campaigns, ad_sets(targeting jsonb), ads, publish_jobs, insights_daily, leads, lead_notes, posts, bookings, notifications, ai_providers, ai_usage, settings, audit_log. All rows are business-scoped with RLS; admins via `is_admin()`.

## Stages
A investigation ✓ · B requirements (this + inventory) ✓ · C brand ✓
1. Web foundation: auth, onboarding, business profile, design system, landing page
2. Campaign wizard (objective → platform/budget → creative + AI copy → targeting → preview → publish via mock)
3. Leads CRM + notifications + reports/insights + optimization rules
4. Post studio + festival calendar + business card / mini site
5. Plans, wallet, Razorpay (test), admin dashboard
6. Expo mobile app
7. Real Meta/Google adapters (after API approvals), tests, docs, deploy
