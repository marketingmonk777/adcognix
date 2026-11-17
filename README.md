# AdCognix

Ads that think ahead. AdCognix is an advertising platform for growing businesses: plan, create and run Facebook, Instagram and Google ads from one place, with a built-in lead inbox.

Independently designed and built: original code, brand and copy.

## Status
| Stage | What | State |
|---|---|---|
| A–D | Investigation, requirements, brand, architecture (`docs/`) | Done |
| 1 | Web foundation: landing page, callback form, sign-in, onboarding, dashboard with channel split, settings (profile, AI provider, cloud), admin callbacks, privacy/terms, PWA | **Done** |
| 2 | Campaign wizard: objective → channels and budget → creative + AI copy → audience → preview → publish (mock adapter) | Next |
| 3 | Lead inbox, alerts, reports, optimisation rules | Planned |
| 4 | Post studio, festival calendar, business card / mini site | Planned |
| 5 | Plans, wallet, Razorpay, full admin | Planned |
| 6 | Expo mobile app (Android/iOS) | Planned |
| 7 | Live Meta/Google adapters, deploy hardening | Planned |

## Run locally
```bash
npm install
npm run dev            # http://localhost:3000
npm test               # unit tests
npm run build          # static export to ./out
python3 tests/e2e.py http://localhost:8790/adcognix   # e2e (pip install playwright)
```
With no backend configured, the app runs in **demo mode** (data stays in the browser).

## Connect the free backend (Supabase)
1. Create a free Supabase project.
2. SQL Editor: run `supabase/schema.sql`.
3. Auth → URL configuration: add your site URL (e.g. `https://marketingmonk777.github.io/adcognix/app/`) to redirect URLs. Enable Google under Providers if you want Google sign-in.
4. In the app, open Settings → Cloud workspace and paste the Project URL and **publishable** key, or set them in `.env` (see `.env.example`) before building.
5. After your first sign-in, make yourself admin (last line of `schema.sql`).

## Swap AI providers
Deploy `supabase/functions/ai` and set one or more secrets: `GEMINI_API_KEY` (free tier), `GROQ_API_KEY` (free tier), `OLLAMA_URL` (self-hosted), `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`. Choose the provider and model per business (and per task) in Settings → AI provider. Usage and estimated cost are logged in `ai_usage`.

## Structure
`app/` pages · `components/` shared UI · `lib/` data adapter (Supabase | demo), validation, recommender, AI registry · `supabase/` schema and edge functions · `docs/` inventory and architecture · `tests/` unit and e2e.

## Security
Row Level Security on every table; the browser only ever holds the publishable key, and secret keys are refused in the UI. Provider keys live in edge-function secrets. Inputs are validated in the UI and by database constraints.
