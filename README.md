# Nanosoft Website

## Hosting and Database Options

This is a server-rendered Next.js application. A deployment needs a persistent
Node.js server; static-only hosting is not supported. cPanel is an option only
when the hosting plan provides a Node.js application manager (such as
Passenger), supports the Next.js-required Node version, passes a `PORT` value,
and permits the app to reach its database. Confirm those capabilities with the
hosting provider before deploying.

PostgreSQL remains the supported database for the complete application. Set
`DB_DIALECT=postgres` and configure `DATABASE_URL` (plus `DB_SSL=true` when the
database provider requires SSL). The main Sequelize connection now recognizes
`DB_DIALECT=mysql`, and the MySQL driver is installed, but MySQL/MariaDB is not
yet supported end to end: the migration runner and Field Docs database layer
still use PostgreSQL-specific SQL. Do not select MySQL for production yet.

For a cPanel Node.js application, install dependencies with `npm ci`, provide
the production environment variables in cPanel, build with `npm run build`,
and start the app with `npm start` (or the equivalent startup command required
by the host). Build and startup run migrations and the idempotent Sequelize
bootstrap seed, so both commands need database access. Set `ADMIN_PASSWORD`
before first production deployment; the seed will refuse to create the initial
admin without it. If the plan does not provide a persistent Node.js application,
use a Node-capable host instead.

### Docker Compose

Copy `docker.env.example` to `.env`, set the database and application secrets,
then run `docker compose up -d --build`. The image build supplies a placeholder
database URL so Next.js can initialize database-backed modules during build;
it does not connect to that URL. At container startup, migrations and seed use
the real `DATABASE_URL` configured by Docker Compose. Uploaded files, image
descriptions, database data, and backups are stored in Compose volumes.

## WhatsApp

The application does not include a WhatsApp gateway, inbox, or automated
message sending. WhatsApp buttons open an external `wa.me` chat, while website
inquiries are recorded in the CRM and can be routed through configured email
or SMS integrations.

Planned architecture direction (not implemented): Clerk for identity, Resend
with React Email for transactional email, Novu for notifications, and TanStack
Table for the CRM data grids. Paystack is not part of this deployment change.

## Field Docs

The Field Docs work-order and field-document workflows are integrated at
`/field-docs`. Their records live in a separate `field_docs` PostgreSQL schema,
and Field Docs login/session credentials are separate from Nanosoft Admin.

Configure these optional variables before first use:

- `FIELD_DOCS_ADMIN_EMAIL` (defaults to `admin@example.com`)
- `FIELD_DOCS_ADMIN_PASSWORD` (defaults to `changeme`; set a strong value)
- `FIELD_DOCS_SESSION_SECRET` (set a unique random secret)
- `FIELD_DOCS_COOKIE_SECURE` (`1` when served over HTTPS)
- `FIELD_DOCS_APP_URL` (public base URL for email links)
- `FIELD_DOCS_SMTP_HOST`, `FIELD_DOCS_SMTP_PORT`, `FIELD_DOCS_SMTP_USER`, `FIELD_DOCS_SMTP_PASS`, `FIELD_DOCS_MAIL_FROM`

Field Docs initializes its tables automatically on first request using the
existing `DATABASE_URL`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
