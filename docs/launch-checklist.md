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
