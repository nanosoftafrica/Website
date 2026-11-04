# Developer and Operations Handover

**System:** Nanosoft Website and Operations Suite\
**Last reviewed:** 2026-11-03\
**Environment-specific values and contacts:** To be supplied by the system owner; do not commit secrets here.

## 1. Service Ownership and Deployment Record

Complete this table for each environment before handover. The repository does not identify a production host or named owners.

| Item | Value to record |
| --- | --- |
| Environment / public URL | TBD |
| Node.js host / process manager | TBD |
| Node.js version | Record deployed version and confirm it is supported by installed Next.js |
| Database provider / database name | TBD; PostgreSQL required |
| DNS / TLS owner and renewal | TBD |
| Application owner / escalation contact | TBD |
| Database and backup owner | TBD |
| SMTP / WAHA / SMS provider owners | TBD |
| Upload storage and retention | TBD |
| RPO / RTO / backup retention | Obtain business approval |

## 2. Local Development Setup

1. Install a supported Node.js version and npm.
2. Install dependencies from the repository root with `npm ci`.
3. Create root `.env.local` with a reachable PostgreSQL URL and local secrets. Never commit it.
4. Run `npm run dev`. The script applies SQL migrations, runs the idempotent Sequelize bootstrap seed, prints LAN addresses and starts Next.js.
5. Open `http://localhost:3000` or the actual URL and port reported by Next. Keep the process terminal open; stop it with `Ctrl+C`.
6. In PowerShell, if `npm.ps1` is blocked by execution policy, use `npm.cmd run dev`. Do not change machine policy just to launch the project.

The scripts for `dev`, `build` and `start` require PostgreSQL access because they run migrations and seed before serving. `npm run migrate` applies SQL migrations; `npm run seed` runs the idempotent bootstrap seed. Review a migration before applying it to production.

## 3. Environment Variable Reference

Set secrets in the deployment platform's secret manager. Values below describe what code reads, not values to copy into source control.

### Core / Admin

| Variable | Use | Guidance |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection for Sequelize, migrations and Field Docs | Required; restrict database network access and use TLS when provided by host. |
| `DB_DIALECT` | Main Sequelize dialect | Set `postgres`; MySQL is not supported end to end. |
| `DB_SSL` | Enables SSL options in main connection and migration runner | Use `true` when required by database provider; verify provider certificate policy. |
| `JWT_SECRET` | Signs/verifies Nanosoft Admin sessions | Required for admin auth; use a high-entropy secret and rotate with session invalidation planned. |
| `JWT_EXPIRES_IN` | Admin session lifetime | Defaults to `7d`; choose according to security policy. |
| `ADMIN_USERNAME` | Bootstrap admin username | Defaults to `admin`; set intentionally. |
| `ADMIN_PASSWORD` | Password for an admin created by initial seed | Must be set before first production seed. It does not update an existing admin password. |
| `NODE_ENV` | Next.js runtime mode | Set by the production process manager to `production`. |
| `PORT` | HTTP port supplied by the hosting platform | Must be passed through by host; local port can change if occupied. |

The code contains development fallback behavior for an initial admin. Do not expose a database initialized with development credentials. Provision/reset the existing account through the approved password process; changing `ADMIN_PASSWORD` alone does not rotate it.

### Email and messaging

| Variables | Use | Notes |
| --- | --- | --- |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` | SMTP host and account | Needed by relevant email paths. |
| `SMTP_PASS` | Public contact-form notification path | This route reads `SMTP_PASS`. |
| `SMTP_PASSWORD` | Shared email/integration service path | Some modules read `SMTP_PASSWORD`; set both password names if both paths use the same SMTP account. |
| `SMTP_SECURE` | Shared SMTP service TLS toggle | `true` enables secure transport in the shared service. |
| `EMAIL_PROVIDER`, `EMAIL_FROM` | Shared email service provider/from address | Configure and test with the selected provider. |
| `NOTIFY_EMAIL`, `NOTIFY_PHONE` | Contact-form notifications | Optional recipient/phone overrides. |
| `DEFAULT_REMINDER_EMAIL` | Admin task reminders | Optional fallback recipient; use a monitored address. |
| `WAHA_BASE_URL`, `WAHA_API_KEY`, `WAHA_DEFAULT_SESSION` | WhatsApp through WAHA | Optional; protect key and verify session status before use. |
| `AT_USERNAME`, `AT_API_KEY`, `AT_SENDER_ID` | Africa's Talking SMS | Optional; use provider-approved production credentials. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_GTM_ID` | Browser-visible analytics identifiers | IDs only; never put secrets in `NEXT_PUBLIC_*`. |

Integration settings may override environment fallbacks in the admin integration records. Document where production credentials are actually managed.

### Field Docs

| Variable | Use | Guidance |
| --- | --- | --- |
| `FIELD_DOCS_ADMIN_EMAIL`, `FIELD_DOCS_ADMIN_PASSWORD` | Initial Field Docs administrator | Set before first Field Docs request initializes an empty user table. Defaults in code are unsafe; rotate any account created with them. |
| `FIELD_DOCS_SESSION_SECRET` | Signs Field Docs cookies | Required for production; code currently falls back to `dev-secret`. |
| `FIELD_DOCS_COOKIE_SECURE` | Secure attribute for Field Docs cookies | Set to `1` when using HTTPS. |
| `FIELD_DOCS_APP_URL` | Base URL used in Field Docs notification links | Set to the canonical deployed URL. |
| `APP_URL` | Base URL used in Field Docs password-reset links | Set to canonical URL; do not rely on request-host fallback in production. |
| `FIELD_DOCS_SMTP_HOST`, `FIELD_DOCS_SMTP_PORT`, `FIELD_DOCS_SMTP_USER`, `FIELD_DOCS_SMTP_PASS`, `FIELD_DOCS_MAIL_FROM` | Field Docs email and notifications | Optional; configure and test as a separate mail path. |
| `FIELD_DOCS_VAPID_SUBJECT` | Push-notification contact identifier | Optional; use a monitored `mailto:` value. |

Field Docs schema setup is performed lazily on the first request. Its initial account seeding is independent of the Nanosoft Admin seed.

## 4. Common Commands

| Command | Behavior |
| --- | --- |
| `npm run dev` | Migrate, bootstrap seed, print LAN URLs, start Next development server |
| `npm run build` | Migrate, bootstrap seed, build Next, copy public/static assets into standalone output |
| `npm start` | Migrate, bootstrap seed, start standalone production server |
| `npm run migrate` | Apply pending sorted SQL files using `schema_migrations` |
| `npm run seed` | Sync Sequelize models and create baseline rows when absent |
| `npm run lint` | ESLint |
| `npm test` | Playwright end-to-end tests |
| `npm run test:ui` | Playwright UI mode |

Playwright uses one worker because tests share database state. Its configuration can reuse an existing local server; ensure the base URL and database point to a safe test environment.

## 5. Production Release and Rollback

### Release checklist

1. Confirm database backup and restore point; verify target environment and migration review.
2. Set required secrets and non-secret settings in the host, including admin JWT, initial admin credentials when needed, Field Docs session secret and cookie settings.
3. Install with `npm ci` and run `npm run build` on a database-enabled deployment/build environment.
4. Start with `npm start` under the host's persistent process manager and pass the platform `PORT`.
5. Verify health from outside the server, public pages, admin login/mutations, Field Docs login/work order, email/integration checks and uploaded-file persistence.
6. Record build/version, migration result, checks, release owner and timestamp.

### Rollback

A code rollback does not automatically reverse database migrations or restore deleted/changed records. Stop promotion, preserve logs, and compare the deployed migration ledger and backup point. Use a reviewed forward fix or a tested database restore plan; do not run destructive rollback SQL on production without database-owner approval.

## 6. Backup and Restore

No maintained backup/restore script or verified backup policy was found in the active repository. Configure managed PostgreSQL backups or a controlled `pg_dump` process, with encryption, retention, access control and a documented restore owner. Back up uploaded files separately if they are stored on local disk.

Illustrative commands only; substitute protected connection details and test restores into an isolated database:

```powershell
pg_dump --format=custom --no-owner --file=nanosoft.dump "$env:DATABASE_URL"
pg_restore --list nanosoft.dump
```

A restore procedure should cover both the main schema and `field_docs`, validate record counts and application login/workflows, and record the recovery point. Never test restore by overwriting production.

## 7. Routine Maintenance

### Each release

- Review migration diff, run lint/build and relevant E2E tests, verify seed idempotency.
- Check secrets, environment target, persistent upload storage, health and integration credentials.
- Update docs and record release/rollback details.

### Regular operations (cadence to be approved)

- Review backup success and perform restore exercises.
- Review Node/npm dependencies and known security advisories; upgrade in a tested branch.
- Review admin and Field Docs accounts, deactivate leavers, rotate credentials and audit privileged actions.
- Check database capacity, slow queries, error logs, disk/upload growth and provider quotas.
- Verify email, WAHA and SMS provider connectivity and alert recipients.
- Confirm TLS/DNS renewals, domain links and notification URL configuration.

## 8. Troubleshooting Runbook

- **Database connection or migration failure:** verify `DATABASE_URL`, PostgreSQL availability, allow-listed network access and `DB_SSL`; inspect the first migration error before retrying.
- **Admin login loops/fails:** verify `JWT_SECRET` is present and consistent across replicas, cookie HTTPS settings, account status/password and system time.
- **Field Docs login fails:** verify the separate user table/account, `FIELD_DOCS_SESSION_SECRET`, HTTPS cookie setting and schema initialization. Admin credentials do not authenticate Field Docs.
- **Port 3000 occupied:** inspect the existing process and Next startup output. Use the port printed by Next, or stop the prior dev instance intentionally; do not start concurrent Next dev servers in the same project.
- **LAN access:** use the actual startup LAN URL and run `Test-NetConnection <server-ip> -Port <port>` from the client that fails. A self-test from the server is not a client-network test. Check router/VLAN/firewall rules and guest/client isolation.
- **Missing uploads after release:** inspect whether the deployment copied or retained `public/uploads/`; define persistent object storage if the host replaces local files on deploy.
- **Email/WhatsApp/SMS failure:** check provider credentials, sender/session state, connectivity and rate limits. Avoid repeated real-customer sends while diagnosing.

## 9. Handover Acceptance

The receiving team should obtain access to source control, hosting, DNS/TLS, PostgreSQL, secret manager, logs/monitoring, SMTP and messaging providers, and upload storage through approved access transfer. Confirm no secrets are sent in this document. Handover is complete when owners, backup/restore, deployment/rollback, account recovery and support escalation are tested and signed off.
