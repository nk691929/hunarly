# Billing

Hunarly sells three things through a hosted checkout (Lemon Squeezy, acting as the seller of
record, so it also handles sales tax and VAT):

| SKU             | What it is                                     |
| --------------- | ---------------------------------------------- |
| `pro_monthly`   | Pro, billed monthly (cancel any time)          |
| `pro_yearly`    | Pro, billed yearly                             |
| `job_hunt_pass` | One-time payment, 60 days of Pro, never renews |

Without the `LEMONSQUEEZY_*` settings the site still works: everyone is on the free plan and the
billing page says payments are not available yet.

## What the server enforces

All limits live on the server, whatever the browser shows. One function decides everything:
`resolveEntitlements` in `src/server/billing/entitlements.ts`.

|            | Free                          | Pro       |
| ---------- | ----------------------------- | --------- |
| Resumes    | 1                             | unlimited |
| Templates  | ATS Classic, Fresher-Friendly | all six   |
| PDF footer | "Made with Hunarly"           | none      |

Where it is checked: creating a resume, newly choosing a Pro template when saving, and PDF export
(a Pro template on the free plan returns 402). Someone whose Pro ended can keep editing a resume
that already uses a Pro template; exporting it needs a free template or Pro.

## Try it locally without a payment account

1. In `.env.local` set dummy values for all six variables (any text; the numbers are made up):

   ```
   LEMONSQUEEZY_API_KEY=test-key
   LEMONSQUEEZY_STORE_ID=1
   LEMONSQUEEZY_WEBHOOK_SECRET=local-test-secret-123456
   LEMONSQUEEZY_VARIANT_MONTHLY=11
   LEMONSQUEEZY_VARIANT_YEARLY=22
   LEMONSQUEEZY_VARIANT_PASS=33
   ```

   Leave `DEV_PRO_UNLOCK` empty, or Pro is on for everyone. Restart `pnpm dev`.

2. Sign in, open `/billing`. You are on Free. Try a second resume, a Pro template, and a PDF with
   a Pro template: each should be blocked.
3. Pretend a payment arrived (use the email you signed in with):

   ```powershell
   pnpm exec dotenv -e .env.local -- node scripts/send-test-webhook.mjs --email you@example.com --sku pro_yearly
   ```

   Refresh `/billing`: you are Pro. Other things to send: `--sku job_hunt_pass`, `--sku pro_monthly
--status cancelled`, `--sku pro_yearly --status expired`, and a refund of a pass:
   `--sku job_hunt_pass --order 123` then `--refund --order 123`.

The button "Continue to checkout" will fail with a friendly message until you add real Lemon
Squeezy values (the fake key is rejected).

## Setting up Lemon Squeezy

Menu names change, so follow the labels loosely. Stay in **test mode** until the end.

1. Create an account and a store. Complete the identity and payout details (Pakistan appears on
   Lemon Squeezy's bank payout list; check the current list in their help center before relying
   on it, and read their tax-form and minimum payout rules).
2. Create three products: Pro monthly (subscription, monthly), Pro yearly (subscription, yearly)
   and Job-hunt pass (single payment). Set prices to match `src/config/plans.ts`. Open each
   product's variant and copy its numeric id.
3. Create an API key (Settings, API) and note your store id.
4. Add a webhook (Settings, Webhooks): URL `https://YOUR-DOMAIN/api/webhooks/lemonsqueezy`, a long
   random signing secret (the same value as `LEMONSQUEEZY_WEBHOOK_SECRET`), and the events
   `subscription_created`, `subscription_updated`, `subscription_cancelled`, `subscription_resumed`,
   `subscription_expired`, `subscription_paused`, `subscription_unpaused`, `order_created` and
   `order_refunded`. Lemon Squeezy must reach a public address, so locally use a tunnel (ngrok or
   Cloudflare Tunnel) or the local script above.
5. Put the six values in `.env.local` (or your host's settings), run a test purchase with their
   test card, and watch `/billing` change.

## Discount codes and the student discount

- Any discount code created in Lemon Squeezy can be typed on `/billing`. Lemon Squeezy validates it.
- Student discount: create a code in Lemon Squeezy (for example 30% off) and set
  `STUDENT_DISCOUNT_CODE` to it. It is applied automatically when the signed-in email is academic
  (`.edu`, `.edu.pk`, `.ac.uk` and similar). That is a convenience check, not proof of enrolment, so
  decide how much the discount is worth before advertising it. Keep its percentage equal to
  `STUDENT_DISCOUNT_PERCENT` in `src/config/plans.ts`.

## Prices and currencies

The pricing page shows USD, EUR, GBP and PKR from `src/config/plans.ts`. These are display prices.
What the buyer pays is set in Lemon Squeezy, which may convert from USD. Check that the two agree,
or say on the page that local-currency amounts are approximate.

## How it fits together

- `src/server/providers/payments/`: the `PaymentProvider` interface and the Lemon Squeezy version
  (checkout creation, webhook signature check, translation to provider-neutral events).
- `src/server/billing/`: entitlements, the service that applies events (idempotent, ignores stale
  updates, retry-safe), and the Prisma storage.
- `src/app/api/webhooks/lemonsqueezy/route.ts`: receives events.
- `src/features/billing/`: checkout action and form; `/billing` page.
