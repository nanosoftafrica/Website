# Nanosoft Website and Operations Suite

Nanosoft's public website and internal operations application in one server-rendered web solution. It brings the public product and lead experience together with tools for maintaining site content, managing customer relationships, coordinating service work, and supporting field teams.

## What the Solution Does

- **Public website:** presents the company, products and services, case studies, and articles; captures contact, demo, and service inquiries.
- **Content management:** lets authorized staff update site content, products, categories, pages, posts, media, testimonials, events, and navigation from the admin workspace.
- **CRM and sales:** tracks companies, contacts, inquiries, opportunities, follow-up activities, and audit history.
- **Service operations:** manages service requests, incidents, customer devices, maintenance, technicians, and suppliers.
- **Field Docs:** supports work orders, task plans, schedules, evidence, documents, assets, approvals, and field reports.
- **Notifications and contact:** supports configured email and SMS integrations. WhatsApp links open an external `wa.me` chat; the application does not provide a WhatsApp inbox, gateway, or automated message sending.

The system is intended for public visitors, content editors, sales and service coordinators, supervisors, and field technicians. The operational features share one deployment, while Field Docs uses a separate PostgreSQL schema and separate sign-in.

## How It Is Built

- Next.js 16 App Router with React 19, TypeScript, and JavaScript route modules.
- A persistent Node.js server; this is not a static-site export.
- PostgreSQL is the only database supported end to end. Sequelize models and SQL migrations live under `server/`; this is a shared data layer, not a separate Express server.
- Field Docs stores its records in the `field_docs` schema and initializes its schema on first use.
- Playwright end-to-end tests cover public and administrative workflows.

## Repository Map

| Path | Purpose |
| --- | --- |
| `app/` | Public pages, admin screens, Field Docs pages, and API routes |
| `components/` | Shared website, admin, and Field Docs interface components |
| `server/models/` | Sequelize models for the main application data |
| `server/migrations/` | Ordered PostgreSQL schema changes |
| `lib/` | Database access, authentication, integrations, and business logic |
| `public/` | Static assets and uploaded media |
| `tests/e2e/` | Playwright end-to-end tests |
| `docs/` | Project brief, architecture, user guide, and operations handover |

## Run Locally

Requirements: Node.js supported by the installed Next.js version and a reachable PostgreSQL database.

1. Install dependencies with `npm ci`.
2. Create `.env.local` with `DATABASE_URL`, `DB_DIALECT=postgres`, `DB_SSL`, `JWT_SECRET`, and initial admin credentials. Keep secrets out of source control.
3. Start the application with `npm run dev` and open the URL printed by Next.js.

The development command applies migrations and runs the idempotent bootstrap seed before starting Next.js, so PostgreSQL must be available. Field Docs has separate initial-account and session-secret settings; see the [operations handover](docs/DEVELOPER_OPERATIONS_HANDOVER.md).

## Run with Docker Compose

Copy `docker.env.example` to `.env`, set the required database and application secrets, then run:

```bash
docker compose up -d --build
```

The image build uses a placeholder database URL only to initialize database-backed modules during Next.js build; it does not connect to that URL. At container startup, migrations and seed use the runtime `DATABASE_URL` configured by Compose. PostgreSQL data, uploads, image descriptions, and backups use persistent Compose volumes.

## Useful Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Migrate, seed, and start the development server |
| `npm run build` | Migrate, seed, and create a production build |
| `npm start` | Migrate, seed, and start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Playwright end-to-end tests |

Build and startup commands require database access because they run migrations and seed data. Set a strong `ADMIN_PASSWORD` before the first production seed; changing it later does not rotate an existing account.

## Documentation

- [Project brief](docs/PROJECT_BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [User guide](docs/USER_GUIDE.md)
- [Developer and operations handover](docs/DEVELOPER_OPERATIONS_HANDOVER.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Historical schema design](PHASE1_SCHEMA_DESIGN.md)
- [Historical CRM parity analysis](TWENTY_CRM_PARITY_ANALYSIS.md)

The two historical planning documents are reference material, not current approved scope. The implementation plan is a proposal; confirm production ownership, hosting, backups, and support arrangements before handover.
