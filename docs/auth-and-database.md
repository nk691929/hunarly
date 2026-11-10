# Accounts and database setup

Hunarly works without accounts: with no database settings it runs in **guest mode** (the builder
saves drafts in the browser). To turn on sign-in, saved resumes and the dashboard, set up three
things: a PostgreSQL database, a secret, and at least one sign-in method.

## 1. Install packages (once)

```bash
pnpm add next-auth@beta @auth/prisma-adapter @prisma/client@6
pnpm add -D prisma@6 dotenv-cli
pnpm pkg set "scripts.postinstall=prisma generate"
pnpm pkg set "scripts.db:generate=prisma generate"
pnpm pkg set "scripts.db:migrate=dotenv -e .env.local -- prisma migrate dev"
pnpm pkg set "scripts.db:studio=dotenv -e .env.local -- prisma studio"
```

pnpm may block Prisma's install scripts. Open `pnpm-workspace.yaml` and set `prisma`,
`@prisma/client` and `@prisma/engines` to `true` under `allowBuilds` (or run
`pnpm approve-builds` and select them with the Space key), then run `pnpm install`.

Why `dotenv-cli`: Next.js reads `.env.local`, but the Prisma command line only reads `.env`.
The `db:*` scripts above load `.env.local` for Prisma so you keep one file.

## 2. Database

Pick one.

**A. Local with Docker** (Docker Desktop must be running):

```bash
docker compose up -d
```

Connection string: `postgresql://hunarly:hunarly@localhost:5432/hunarly`

**B. Neon (free, hosted):** create a project at neon.tech, copy the connection string from the
dashboard. For production use Neon's pooled string at runtime; use the direct (non-pooled)
string for `pnpm db:migrate`.

## 3. Environment

```bash
Copy-Item .env.example .env.local        # PowerShell
```

Fill in `.env.local`:

- `DATABASE_URL`: from step 2.
- `AUTH_SECRET`: run `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- Email sign-in works in development with nothing else: the sign-in link is printed in the
  terminal running `pnpm dev`. For production, set `RESEND_API_KEY` and `EMAIL_FROM`
  (verify your sending domain in Resend first).
- Google sign-in (optional): in Google Cloud Console, create an OAuth client ("Web application")
  and add the redirect URI `http://localhost:3000/api/auth/callback/google` (plus your
  production URL later). Put the client ID and secret in `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

## 4. Create the tables

```bash
pnpm db:generate
pnpm db:migrate --name init
```

Commit the new `prisma/migrations/` folder. `pnpm db:studio` opens a browser view of the data.

## 5. Try it

1. `pnpm dev`, open `/builder`, type a few things as a guest.
2. Click **Sign in to save online**, enter your email, open the link from the terminal.
3. On the dashboard, choose **Add to my account** on the draft card.
4. Edit, refresh, sign out and back in: the resume is still there.

## Troubleshooting

- _"@prisma/client did not initialize yet"_: run `pnpm db:generate`.
- _"Environment variable not found: DATABASE_URL"_ from a Prisma command: run it through the
  `db:*` scripts so `.env.local` is loaded.
- _Sign in link not in the terminal_: it prints only in development and only when there is no
  `RESEND_API_KEY`.
- _Google "redirect_uri_mismatch"_: the redirect URI in Google Cloud must match exactly.
- _"OAuthAccountNotLinked"_: shouldn't happen (Google links by verified email); if it does,
  sign in with the method you used first.

## How it fits together

- `src/server/auth.ts`: Auth.js setup. Database sessions, Prisma adapter, Google and email.
- `src/server/resumes/`: the resume service (validation, ownership) and the Prisma repository.
- `src/features/dashboard/actions.ts`: server actions the browser calls. Each one checks the
  session, then validates the document again on the server.
- Marketing pages never read the session, so they stay static and fast.
