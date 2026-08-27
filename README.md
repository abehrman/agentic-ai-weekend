# AgentX AI Course — public site

Public marketing and enrollment site for the live-online October 5–27, 2026
Agentic AI Intensive from AgentX AI Course.

Live target: <https://agentxaicourse.com/>

## Structure

- `index.html` — public landing page
- `register/index.html` — enrollment review and Stripe handoff
- `welcome/index.html` — post-payment confirmation and onboarding handoff
- `styles.css`, `script.js` — dependency-free design and interaction layer
- `assets/` — local lifestyle media, instructor portrait, Sol diagrams and icons
- `tests/marketing.mjs` — factual, structural, safety, and asset contract
- `.design/refero-runway-sol.md` — active visual reference lock

Lifestyle subjects are illustrative. The instructor portrait is Adam Behrman.

## Local preview

```bash
python3 -m http.server 8777
```

Open `http://127.0.0.1:8777/`.

## Verification

```bash
node --check script.js
node tests/run.mjs
```

Before publishing, verify 375px, 414px, and 1440px layouts; internal navigation;
reduced motion; registration; live-mode Stripe branding, $995 amount, fields,
terms, and redirect; console cleanliness; and no horizontal overflow.

## Hosting

The site deploys to the dedicated Google Cloud project `agentx-ai-course` with
Firebase Hosting. Cloudflare provides DNS for `agentxaicourse.com`.

```bash
npx firebase-tools deploy --only hosting --project agentx-ai-course
```

## Payment safety

The static site never handles card data. The registration page hands off to a
Stripe-hosted Payment Link. Never place a `buy.stripe.com/test_…` URL in shipped
HTML. Live enrollment uses Stripe-hosted Checkout through one active Payment
Link. Stripe handles card data and closes that link at its completed-session
limit. The current live link is `plink_1U93F0DDFFWiezA0n7daEZKl`; its first
price is $995. At each tuition boundary, expire open Checkout Sessions, count
cumulative completions, replace the link price with $1,250 or $1,495, and keep
the single cumulative completed-session limit at 20.
