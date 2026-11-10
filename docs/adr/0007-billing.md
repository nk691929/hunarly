# ADR 0007: Billing and entitlements

Status: accepted

Decisions

- Hosted checkout through a merchant of record (Lemon Squeezy first). We never see card numbers and
  do not calculate tax ourselves.
- Provider-neutral `BillingEvent`s. Webhooks are verified and translated in the provider layer; the
  billing service applies them to our own tables (`Subscription`, `Purchase`, `PaymentEvent`).
- Entitlements are computed from our tables by one pure function, never stored. Nothing to drift.
- Limits are enforced on the server at the points where they matter: resume creation, choosing a
  Pro template, and PDF export. The browser only shows locks.
- Applying events is idempotent, ignores stale updates (by the provider's `updated_at`) and
  forgets an event if applying it fails, so provider retries work.
- Only the job-hunt pass is stored as a `Purchase`; subscription payments arrive as subscription
  events.
- Student discount: a provider discount code applied automatically for academic email addresses,
  decided on the server from the sign-in email.

Risk accepted: Lemon Squeezy is owned by Stripe and has said it is shifting development to Stripe's
own merchant-of-record product, which does not currently list Pakistan among its seller countries.
Because the provider sits behind an interface, switching vendor means a new provider file and
webhook route, not changes across the app. Re-check the vendor's status before launch.

Not built yet: manual bank transfer and local gateways (see docs/adding-a-payment-provider.md),
Paddle, AI and DOCX gating (M8). Creating the first resume is not atomic with the count check, so
two simultaneous requests could create two; acceptable for the free tier.
