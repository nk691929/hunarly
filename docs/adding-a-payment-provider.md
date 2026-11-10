# Adding a payment provider

A provider turns "start a checkout" into a hosted page and turns the vendor's webhooks into
provider-neutral events. The rest of the app never learns which vendor is behind it.

## 1. Implement the interface

Create `src/server/providers/payments/<name>.ts` exporting a function that returns a
`PaymentProvider` (see `index.ts`):

- `id`: a short lowercase name, stored with every subscription and purchase. Never change it later.
- `createCheckout({ userId, email, sku, discountCode, successUrl })`: ask the vendor for a hosted
  checkout and return `{ url }`. Pass `userId` through the vendor's custom data so the webhook can
  tell us who paid. Never put secrets or resume content in the request.
- `verifyAndParseWebhook(rawBody, signature)`: verify the signature over the raw body (constant-time
  comparison) and throw `InvalidWebhookSignatureError` if it is wrong. Then translate the payload
  into a `BillingEvent` (`src/server/billing/events.ts`):
  - `subscription`: current status, period end, whether it will cancel, a manage link
  - `purchase`: a paid one-time order (only the job-hunt pass becomes access)
  - `refund`
  - `ignored`: anything else
    Give every event an id that is the same on a retry and different for a different change.

Map the vendor's statuses to ours in `subscriptionGrantsAccess` terms: `active`, `on_trial`,
`past_due`, `cancelled` (access until the period ends), and anything else means no access.

## 2. Register it

In `src/server/providers/payments/instance.ts`, build your provider from environment values (add
them to `src/config/env.ts` and `.env.example`) and return it when configured.

## 3. Add a webhook route

Copy `src/app/api/webhooks/lemonsqueezy/route.ts` to `src/app/api/webhooks/<name>/route.ts`. It
reads the raw body, verifies and parses, then calls `billingService.applyEvent(provider.id, event)`.
Return 401 for a bad signature and 500 for a processing error (so the vendor retries).

## 4. Test it

Copy the structure of `tests/billing/lemonsqueezy.test.ts`: signature, each event type, unknown
products, checkout request body and failures. The service tests in `tests/billing/` already cover
what happens after an event is parsed.

## Manual and local payment methods

Bank transfer, JazzCash and Easypaisa have no webhooks: a person approves the payment by hand. Model
that as an admin action that calls `billingService.applyEvent("<name>", { kind: "purchase", ... })`
with `sku: "job_hunt_pass"`, or a subscription event with an end date. The entitlement logic is the
same. The admin screen and the pending-payment table are not built yet.
