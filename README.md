# Official Akogun Furniture — Website

A production-ready website for a bespoke furniture and interior woodwork business: cinematic dark-luxury marketing site, database-driven portfolio/catalogue/blog, quotation workflow, customer project-tracking portal, and a secure admin dashboard.

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4**, **Prisma 7 + SQLite**, and **pdf-lib** (quotation PDFs).

---

## Feature overview

### Public site
- Cinematic homepage with CSS parallax + scroll reveals (respects `prefers-reduced-motion`)
- Portfolio with category/status filters, gallery + lightbox, related projects
- Furniture catalogue — products, availability, optional prices (never invented)
- Services, About (editable process timeline), Blog (safe Markdown renderer)
- Quote request form (enquiry) and Contact form with rate limiting
- Project-tracking landing page → customer portal login
- SEO: sitemap.xml, robots.txt, per-page metadata, noindex on private areas

### Customer portal (`/portal`)
- Register / login / password reset (email-based; Resend or logged locally)
- View assigned projects: progress bar, milestones, timeline updates
- View quotations: totals, PDF download, approve/decline
- Ownership enforced on every server action and data fetch

### Admin dashboard (`/admin`)
- Overview with live counts (enquiries, quotations, active projects, upcoming deadlines)
- Portfolio & catalogue CRUD with image upload
- Enquiries: status pipeline, internal notes, assignment, reply-by-email, private attachments
- Quotations: line items, auto totals, PDF, email send (only marked *sent* when the provider confirms), record decisions, convert approved quotes into tracked projects
- Customer projects: stage/progress, milestones, progress updates with customer visibility toggle
- Testimonials, Blog, Settings (business info, process steps, homepage copy)
- Staff user management (Super Admin only) and a full audit log

### Demo content
Seed data is clearly labelled "Demo — …" and a footer banner can flag it (`contentIsDemo` in Settings). No fabricated prices, reviews, or statistics.

---

## Quick start

```bash
# 1. Install dependencies (Node 20+)
npm install

# 2. Configure environment
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux
# Then edit .env — at minimum set SESSION_SECRET and ADMIN_PASSWORD.

# 3. Create the database and seed demo data + admin user
npx prisma migrate deploy
npm run db:seed             # or: node prisma/seed.mjs

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the port shown in the terminal).

### Seeded accounts

| Role     | Email                            | Password                                   |
| -------- | -------------------------------- | ------------------------------------------ |
| Admin    | `admin@akogunfurniture.local`    | value of `ADMIN_PASSWORD` (or printed by the seed if empty) |
| Customer | `customer@demo.local`            | `DemoCustomer123!`                          |

Change these immediately in a real deployment.

---

## Environment variables

See [`.env.example`](.env.example) for the full list with comments.

| Variable | Required | Purpose |
| -------- | -------- | ------- |
| `DATABASE_URL` | yes | SQLite path, e.g. `file:./prisma/dev.db` |
| `SESSION_SECRET` | yes (prod) | 32+ char random string; production refuses to boot without it |
| `NEXT_PUBLIC_SITE_URL` | yes (prod) | Absolute site URL used in emails, sitemap, robots |
| `NEXT_PUBLIC_BUSINESS_PHONE` / `_WHATSAPP_NUMBER` / `_BUSINESS_EMAIL` | no | Override contact details stored in admin settings |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | no | First-run admin account for the seed script |
| `RESEND_API_KEY` / `EMAIL_FROM` | no | When unset, emails are logged as `SKIPPED` and never claimed as sent |

---

## Common commands

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | TypeScript check |
| `npm test` | Run unit tests (Vitest) |
| `npm run db:migrate` | Create/apply a new migration |
| `npm run db:seed` | Idempotent seed (safe to re-run) |

---

## Architecture notes

- **Auth**: HMAC-signed session token in an `httpOnly` cookie; SHA-256 hash stored in the `Session` table; scrypt password hashing (no native deps). `proxy.ts` (Next 16 middleware) redirects unauthenticated users, but the real boundary is `requirePermission()` / ownership checks in every layout, server action, and route handler.
- **Database**: SQLite via Prisma 7. The datasource URL lives in `prisma.config.ts` (not in the schema). Statuses are plain strings validated by zod + `lib/constants.ts` (SQLite has no enums).
- **Email**: Resend HTTP API when configured; every attempt is recorded in `NotificationLog` with status `SENT` / `SKIPPED` / `FAILED`. Quotations are only marked *Sent* after provider confirmation.
- **Uploads**: marketing images → `public/uploads/` (served by Next); enquiry attachments → `data/uploads/` (private, streamed via an authenticated route handler).
- **Rate limiting**: in-memory fixed window — suitable for a single instance. For multi-instance deployments back it with Redis or the database.
- **PDFs**: generated on demand with `pdf-lib`; accessible to the owning customer or staff.

---

## Deployment

1. Provision a host with Node 20+ (VPS, Railway, Render, Fly.io, a VM behind Nginx, etc.).
2. Clone the repo and `npm ci`.
3. Copy `.env.example` → `.env`, fill every required value (`SESSION_SECRET` must be a long random string; `NEXT_PUBLIC_SITE_URL` must be the public HTTPS URL).
4. `npx prisma migrate deploy && node prisma/seed.mjs` (the seed is idempotent; skip it if you do not want demo content).
5. `npm run build && npm start`.
6. Terminate TLS at your proxy/host. Cookies are already `secure` in production.
7. Sign in at `/admin`, open **Settings**, and:
   - fill in the real business contact details;
   - switch the **demo-content banner** off once real content is in place;
   - replace demo portfolio/catalogue/blog entries with real work.

### SQLite on ephemeral hosts
SQLite stores data in a file. On hosts with ephemeral filesystems (serverless), attach a persistent volume to `prisma/` or move to a client/server database (Postgres) — the Prisma schema is portable; only the datasource provider and `prisma.config.ts` need changing.

---

## Project structure

```
app/
  (site)/         Public marketing pages
  (auth)/         Login, register, password reset
  (portal)/portal Customer project-tracking portal
  (admin)/admin   Staff dashboard
  actions/        Server actions (auth, public forms, admin)
  api/            Route handlers (PDF, uploads, attachments)
components/
  ui/             Primitives (Button, Form, Badge, Lightbox, …)
  site/           Header, Footer, Hero, Cards
  admin/          Admin-only client components (forms, uploaders)
lib/              Auth, session, prisma, validation, settings, email, upload…
prisma/           Schema, migrations, seed
docs/             Admin guide
```

---

## Security checklist (implemented)

- [x] `httpOnly` + `sameSite=lax` + `secure` (in production) session cookies
- [x] Passwords hashed with scrypt (constant-time comparison)
- [x] Route protection in `proxy.ts` **and** `requirePermission()` in every protected layout/action/handler
- [x] Permission matrix per role (`SUPER_ADMIN`, `ADMIN`, `PROJECT_MANAGER`, `STAFF`)
- [x] Ownership checks on portal data and the quotation PDF endpoint
- [x] Zod validation on every form + server-side re-validation
- [x] Rate limiting on public enquiry/contact/auth forms
- [x] Staff-only upload endpoint (type + size limits); private attachments never in `public/`
- [x] Path-traversal protection on the attachment route
- [x] Safe Markdown renderer (HTML escaped, `https://` links only)
- [x] Security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) + `noindex`/`no-store` on private areas
- [x] Audit log for sensitive admin changes

---

## License

Private — all rights reserved.
