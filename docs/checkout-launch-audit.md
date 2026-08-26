# AgentX checkout launch audit

Audited August 26, 2026 against the local repository, the live Firebase site,
Google Cloud project `agentx-ai-course`, and the live AgentX Stripe account.

## Recommendation

Launch with the live Stripe Payment Link that now exists. Stripe's native
`restrictions.completed_sessions.limit` is set to 20, so Stripe enforces the
completed-payment ceiling without a new backend.

Only one tuition link may be active at a time. Stripe does not allow the Price
on an existing Payment Link line item to be replaced: its update schema accepts
the existing line-item ID and quantity, but not a new Price ID. At each price
boundary, close the old link, expire every open Checkout Session from it,
calculate remaining capacity, then create and publish a new link at the next
price. This preserves one shared 20-seat cap across all three price windows.

Do not create three simultaneously active links with limits of 20. That would
permit 60 completed sessions.

## Observed state

### Stripe live account

- Card charges and payouts are enabled.
- One live Payment Link exists:
  - ID: `plink_1U8qKbDDFFWiezA0tzPE7W03`
  - URL: `https://book.stripe.com/5kQ14n3ir9Uwabz2rO7IY00`
  - Amount: $1,950 USD for one seat
  - Completed-session restriction: limit 20, count 0
  - Required individual name and Stripe terms consent
  - Redirect to `/welcome/` with the Checkout Session ID
  - Automatic tax off, promotion codes off, quantity fixed at one
- One unpaid Checkout Session opened during launch QA is still open. It does not
  count toward the 20 completed-session limit and will expire automatically.
- No webhook endpoints exist.
- No Stripe Tax registrations exist. Do not enable automatic tax until the
  business confirms it has a registration in every jurisdiction where it must
  collect.
- The product image and `AGENTX COURSE` product statement descriptor are set.
  Account-level Checkout logo and icon assets remain unset.
- The public support email and support URL are unset.
- The account statement descriptor is `AGENTX`.
- Three active one-time USD prices exist on one active product:

| Window | Amount | Price ID | Lookup key | Live metadata |
| --- | ---: | --- | --- | --- |
| Launch | $1,950 | `price_1U8YstDDFFWiezA042osEIFH` | `agentx_oct_2026_launch` | Aug 26–Sep 13, New York time |
| Standard | $2,250 | `price_1U8Yt5DDFFWiezA0E9CFhKgx` | `agentx_oct_2026_standard` | Sep 14–27, New York time |
| Full | $2,500 | `price_1U8Yt4DDFFWiezA00qRU599n` | `agentx_oct_2026_full` | From Sep 28, New York time |

The amounts and metadata dates now match the site.

### Site and Firebase

- Production `register/index.html` opens the live Payment Link and has no email
  fallback in the primary action.
- Production `/register/**` and `/welcome/**` return
  `Cache-Control: private, no-store, max-age=0`.
- `welcome/index.html` is a public, static page. It must not be treated as proof
  of payment or as an entitlement gate.
- The site has no backend dependencies or root `package.json`.
- Firebase Hosting is configured and live at both the custom domain and the
  default `web.app` domain.
- Google Cloud billing is disabled.
- Firestore, Cloud Functions, Cloud Run, Cloud Build, Secret Manager, Eventarc,
  and Artifact Registry are not enabled.
- The custom domain serves the live checkout URL, current script cache version,
  CSP, HSTS, `X-Frame-Options: DENY`, and the intended enrollment cache policy.
- Private repository material under `/launch/` and `/docs/` is excluded from
  Firebase Hosting and returns 404 on the public domain.

## Live checkout configuration

### Implemented Payment Link

```text
ID: plink_1U8qKbDDFFWiezA0tzPE7W03
URL: https://book.stripe.com/5kQ14n3ir9Uwabz2rO7IY00
price: price_1U8YstDDFFWiezA042osEIFH
quantity: 1; not adjustable
completed session limit: 20; current count: 0
after completion: https://agentxaicourse.com/welcome/?session_id={CHECKOUT_SESSION_ID}
individual name collection: required
Stripe terms of service consent: required
promotion codes: off
automatic tax: off
customer creation: always
submit type: book
```

UTM parameters are retained by the site's checkout handoff. The Payment Link
also carries cohort, source, pricing-window, terms-version, and privacy-version
metadata.

### Remaining Stripe public-profile work

Set or verify these in the live AgentX account:

- Checkout logo, icon, and AgentX violet accent.
- Support email: `adam.behrman@gmail.com`.
- Support URL: `https://agentxaicourse.com/`.
- Privacy URL: `https://agentxaicourse.com/privacy/`.
- Terms URL: `https://agentxaicourse.com/terms/`.
- Confirm customer receipt emails are enabled.
- Confirm the `AGENTX` statement descriptor is clear enough on a card statement.

Optional future Checkout fields:

- Required dropdown: `Computer for the course`
  - `Mac with M1 or newer M-series chip`
  - `Windows 10/11 laptop`
- Optional text: `Participant name if different from the payer`

The static readiness check is useful UX, but it is not retained. The required
name is retained by Stripe; a device field would make preflight easier but is
not a payment-launch blocker.

### Completed site launch verification

- Firebase Hosting is deployed and the custom-domain registration page opens
  the live Stripe URL.
- `/register/` and `/welcome/` return the intended private no-store policy.
- Live Checkout shows AgentX, $1,950, one seat, required name and terms, and the
  expected return details.
- A complete test-mode card payment verified the redirect, paid status, name,
  terms consent, UTM retention, statement suffix, and automatic link closure at
  its test capacity of one.

The local JavaScript syntax check, full dependency-free test suite, and
`git diff --check` all pass. Tests now cover the live Stripe URL, no-store
routes, private launch-kit exclusion, security headers, and cache versions.

No Stripe key belongs in the repository or browser. A Payment Link is public by
design and is safe to place in HTML.

### Fulfillment for the first 20-person cohort

Stripe sends its own receipt. Adam can monitor completed payments in the Stripe
Dashboard and send the course welcome manually. This avoids blocking launch on
a mail service or a new Google Cloud backend.

The public welcome page contains no course access link or private data. Keep it
that way until payment verification exists.

## Price-transition runbook

Perform these steps at 12:00 AM America/New_York on September 14 and September
28. A brief closed-enrollment interval is safer than overlapping links.

1. Deactivate the old Payment Link.
2. List all open Checkout Sessions created by the old Payment Link.
3. Explicitly expire every open session. Deactivation alone must not be assumed
   to invalidate sessions that were already opened.
4. Verify zero old sessions remain open.
5. Count cumulative completed sessions across every prior tuition link. Review
   delayed-payment failures and refunds; do not automatically reopen a refunded
   seat without Adam's decision.
6. Compute `remaining = 20 - cumulative completed sessions`.
7. If `remaining` is zero, publish the full/waitlist state and stop.
8. Create the next live Payment Link using its correct Price ID and a completed
   session limit equal to `remaining`.
9. Wire the new URL into `register/index.html`, deploy Hosting, and verify the
   custom domain returns the new URL with `Cache-Control: no-store`.
10. Complete one non-charging inspection of Checkout: live mode, AgentX brand,
    correct amount, one seat, required name and terms, and the correct return
    URL.

This procedure closes the only cross-link race: an already-open old-price
session completing after the next link is published.

## Automated Google Cloud architecture

This is a phase-two improvement, not the fastest launch path. It becomes useful
when enrollment, welcome email, certificate issuance, refunds, and future
cohorts need automation.

### Current blocker

Attach a billing account and move the Firebase project to Blaze. Cloud Functions
deployment requires billing. Then create Firestore and enable the Functions,
Cloud Run, Cloud Build, Artifact Registry, Eventarc, and Secret Manager APIs.

### Files

```text
functions/package.json
functions/index.js
functions/lib/pricing.js
functions/lib/capacity.js
functions/lib/stripe-events.js
functions/test/pricing.test.js
functions/test/capacity.test.js
functions/test/webhook.test.js
firestore.rules
firestore.indexes.json
```

Update `firebase.json` with a Node.js 22 Functions source, Firestore rules and
indexes, and narrow Hosting rewrites for `/api/create-checkout-session` and
`/api/stripe-webhook`. Keep static files ahead of rewrites.

### Infrastructure and secrets

- Region: `us-east1` for Functions and Firestore.
- Firestore clients: deny all reads and writes; only Admin SDK functions access
  enrollment data.
- Secret Manager:
  - `STRIPE_RESTRICTED_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Use a least-privilege restricted Stripe key with Checkout Session write/read
  and Price read access.
- Never store either secret in source, `.env`, HTML, logs, or Firebase Hosting.

### Server behavior

- `createCheckoutSession`
  - Accept POST only and validate same-origin requests.
  - Determine the price window on the server in `America/New_York`.
  - Resolve the server-owned Price ID; never accept a price from the browser.
  - Reserve one seat with an atomic Firestore transaction before creating a
    30-minute Stripe-hosted Checkout Session.
  - Use a unique Stripe idempotency key and metadata containing cohort,
    reservation ID, and price window.
  - Return only the Checkout URL.
- `stripeWebhook`
  - Verify the Stripe signature against the unmodified raw request body.
  - Deduplicate by Stripe event ID.
  - Handle `checkout.session.completed` and
    `checkout.session.async_payment_succeeded`, gated on payment status.
  - Handle `checkout.session.async_payment_failed` and
    `checkout.session.expired` by releasing a pending reservation exactly once.
  - Record refunds but do not automatically reopen a seat.
- `reconcileReservations`
  - Periodically reconcile stale reservations against Stripe.
  - Never release an ambiguous reservation in a way that can allow both its
    Checkout Session and a replacement seat to complete.

Firestore must enforce the invariant `occupied <= capacity` in one transaction.
Every reservation state transition must be idempotent. Add abuse protection
because otherwise a bot can create 20 unpaid sessions and temporarily reserve
the cohort.

## Launch verification checklist

### Stripe

- [x] AgentX live mode; never sandbox or test mode.
- [x] Checkout is configured for $1,950 USD and quantity one.
- [x] Payment Link restriction limit is 20 and count starts at zero.
- [x] Name and terms acceptance are required.
- [ ] Privacy, terms, support, branding, and statement descriptor are correct.
- [x] No promotion code or adjustable quantity is available.
- [x] Automatic tax is off; no Stripe Tax registration is active.
- [x] Success redirects to the custom-domain welcome page.
- [x] Deactivated-link message points to the waitlist email.

### Site

- [x] The deployed registration primary action opens the live Stripe-hosted
      domain.
- [x] The current site price and Stripe amount match.
- [x] The button cannot be activated until readiness and terms are checked.
- [x] `/register/` and `/welcome/` return `Cache-Control: private, no-store,
      max-age=0`.
- [x] No secret key, webhook secret, or test link is shipped.
- [x] Mobile and desktop registration have no overflow or clipped controls.
- [x] The public welcome page grants no private access.

### Capacity and failure tests

- [ ] An expired or abandoned checkout does not count as a completed seat.
- [ ] The 20th completed Checkout Session succeeds.
- [ ] A 21st attempt sees Stripe's inactive/full message.
- [ ] Old links are inactive and all their open sessions are expired before a
      new price link goes live.
- [ ] Cumulative completed sessions plus the new link's limit equals 20.
- [ ] Refunds do not silently reopen seats.
- [ ] Adam receives a Stripe notification/receipt record and can send onboarding.

## Source basis

- Stripe Payment Links can enforce a maximum number of completed Checkout
  Sessions and automatically deactivate at the limit:
  https://docs.stripe.com/payment-links/customize
- Stripe's Payment Link update API does not accept a replacement Price on an
  existing line item:
  https://docs.stripe.com/api/payment-link/update
- Stripe requires webhook-driven fulfillment for automated post-payment work:
  https://docs.stripe.com/checkout/fulfillment
- Stripe Checkout Sessions can expire from 30 minutes to 24 hours after
  creation: https://docs.stripe.com/api/checkout/sessions/create
- Firestore transactions are atomic and retry on concurrent edits:
  https://firebase.google.com/docs/firestore/manage-data/transactions
- Firebase Functions secrets integrate with Google Cloud Secret Manager:
  https://firebase.google.com/docs/functions/config-env
