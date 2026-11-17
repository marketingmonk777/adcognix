# AdCognix: feature inventory (Stage A)
Reference studied: adkrity.com (home, about), its Google Play and App Store listings, and public descriptions (LinkedIn, i-Hub, investor deck summary). Clean-room: we compare features only. No copy, logos, client names, testimonials or layout text are reused.
O = observed on a public page · I = inferred (behind login/app, not inspected)

| ID | Feature | Src | Notes / AdCognix version |
|---|---|---|---|
| F01 | Marketing site + "book free session" (business name, phone) | O | Landing page + lead form → stored in DB, WhatsApp/notify |
| F02 | App store download badges | O | PWA install + Android/iOS builds later |
| F03 | Sign up / login (phone OTP likely) | I | Email magic link + Google (free); phone OTP pluggable |
| F04 | Business profile & category onboarding | I | Business name, category, city, logo, brand colours, phone |
| F05 | Choose objective (branding, leads, calls, messages, app installs, traffic) | O | Campaign wizard step 1 |
| F06 | Platform + budget selection with category recommendations | O | Step 2: Meta / Google / (later) LinkedIn; budget & duration; recommender rules |
| F07 | Ad creative from ready templates ("5L+ layouts") | O | Template engine (SVG/canvas) with brand auto-fill; template library in DB |
| F08 | AI ad copy, keywords, hashtags | O | LLM adapter (Gemini free / OpenAI / Ollama) |
| F09 | AI audience & placement suggestions | O | Rules + LLM suggestion → editable targeting JSON |
| F10 | One-click multi-platform publish | O | Publisher adapter: Meta Marketing API / Google Ads API; mock adapter in dev |
| F11 | Ad preview (feed/story) | O | Live mock previews |
| F12 | Campaign dashboard & real-time reports (reach, clicks, leads, spend) | O | Insights sync job → charts |
| F13 | AI optimization | O | Scheduled rules engine + LLM suggestions (pause/boost/budget shift) |
| F14 | In-app CRM for leads + instant lead alerts | O | Lead inbox, status pipeline, notes, call/WhatsApp buttons, push/email alerts |
| F15 | Free festival & business posts with caption + hashtags | O | Post studio + festival calendar (India) + share/download |
| F16 | Logo, banner, poster, digital business card, website maker | O | Phase 2 design tools; business card + mini website first |
| F17 | Packages / in-app purchases (ad budget + service fee) | O | Plans & wallet; Razorpay adapter (test mode free) |
| F18 | Expert help / free consultation booking | O | Booking request → admin queue |
| F19 | Admin dashboard | I | Users, businesses, campaigns, templates, festivals, plans, payments, leads, audit log |
| F20 | Static pages: about, privacy, terms, refund, contact | O | Original text |
| F21 | Notifications | I | In-app + email; web push (PWA) |

Gaps we will not imitate: placeholder FAQ text on the reference. Claims such as "2X–5X" will not be copied; AdCognix makes no performance claims without data.
