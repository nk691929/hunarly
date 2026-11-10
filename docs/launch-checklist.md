# Launch checklist

Items discovered while building. Tick each before going live.

## Content and legal

- [ ] Replace `contactEmail` in `src/config/site.ts` with a real, monitored address.
- [ ] Have a lawyer review `/privacy` and `/terms` for the countries you will serve (GDPR, UK GDPR, CCPA, Pakistan).
- [ ] Confirm the claim "we do not use your resume content to train models" matches your AI provider settings.
- [ ] Confirm prices in `src/config/plans.ts` (USD, EUR, GBP, PKR) and the student discount percentage.
- [ ] Decide how the student discount is verified before advertising it at checkout (M7).
- [ ] Add real testimonials and numbers to the landing page only once they are real.

## Domain, SEO and analytics

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain.
- [ ] Verify the domain in Google Search Console and submit `/sitemap.xml`.
- [ ] Check social previews for `/opengraph-image` and `/twitter-image`.

## Payments

- [ ] Confirm your merchant payout is supported for a Pakistan-based seller.
- [ ] Switch payment providers from sandbox to live mode.

## Accounts (added in M5)

- [ ] Create the production database (Neon or Supabase) and run migrations against it.
- [ ] Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` in production.
- [ ] Add the production redirect URI to the Google OAuth client.
- [ ] Verify your sending domain in Resend; set `RESEND_API_KEY` and `EMAIL_FROM`.
- [ ] Send yourself a real sign-in email and check it does not land in spam.
- [ ] Publish the Google OAuth consent screen (or add test users while in testing mode).
- [ ] Add rate limits for sign-in emails and saves (M10) before opening to the public.

## PDF export (added in M6)

- [ ] Decide where Chromium runs in production (large-limit function or a small container) and test it.
- [ ] Set `PDF_BASE_URL` if the renderer must reach the app on a different internal address.
- [ ] Run the PDF text check against the production build and read one real PDF in a few viewers.
- [ ] Confirm `DEV_PRO_UNLOCK` is not set in production (it is ignored there, but keep it clean).
- [ ] Move the PDF rate limit to a shared store (M10) before public launch.
- [ ] Neon free tier sleeps idle databases, which slows the first request. Put the app and database in the same region.

## Payments (added in M7)

- [ ] Re-check Lemon Squeezy's status and its Stripe transition plans; decide whether to launch on it or switch provider.
- [ ] Confirm Pakistan on their current bank payout list, the payout minimum, fees, and the tax forms they require.
- [ ] Create the three products, copy the variant ids, and set all `LEMONSQUEEZY_*` values in production.
- [ ] Add the production webhook URL and signing secret; send a test event and a real test-mode purchase.
- [ ] Make PKR, EUR and GBP display prices match what checkout charges (or label them approximate).
- [ ] Create the student discount code, set `STUDENT_DISCOUNT_CODE`, and decide how strictly to verify students.
- [ ] Test the full cycle in test mode: buy, cancel, expire, refund, and the job-hunt pass ending after 60 days.
- [ ] Add a refund policy and link it from the pricing and terms pages; update the Terms to match.
- [ ] Switch Lemon Squeezy from test mode to live mode and repeat one real purchase.
- [ ] Move the checkout and PDF rate limits to a shared store (M10).
