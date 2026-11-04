# Project Brief

**Project:** Nanosoft Website and Operations Suite\
**Document status:** Handover baseline reconstructed from the current repository\
**Last reviewed:** 2026-11-03\
**Audience:** Business owner, product owner, delivery lead, support lead, incoming developers

## Executive Summary

This repository contains a server-rendered web application for Nanosoft Technology. It combines a public marketing and lead-generation website, an authenticated administration workspace for content, CRM and service-management work, and Field Docs for field-service work orders and documents.

The apparent business problem is fragmented digital operations: public product information, enquiries, customer records, sales opportunities, service requests and field work need to be maintained and followed through. The application brings these workflows into one web deployment and PostgreSQL database while giving Field Docs its own schema and sign-in boundary. This problem statement is inferred from the implemented features; validate it with the business owner and actual users.

## Problem and Intended Outcomes

| Problem indicated by the implementation | Intended outcome |
| --- | --- |
| Website copy and product information need to be edited without a code release. | Admin-managed site content, products, pages, posts and media. |
| Enquiries and customer information need to be captured and followed. | Contact/message capture, contacts, companies, opportunities and activities in the admin workspace. |
| Service issues, devices, requests and supplier/technician coordination need operational tracking. | Service-management sections for devices, incidents, service requests, technicians and suppliers. |
| Field work needs assignment, progress visibility, evidence and customer sign-off. | Field Docs work orders with generated task plans, schedules, attachments, documents, approvals and timeline reporting. |
| Management needs a view of activity and operational status. | Admin dashboard, analytics and Field Docs reports. |

No approved baseline metrics, service targets or measured business outcomes were found in the repository. Suggested measures for stakeholder approval are enquiry-to-opportunity conversion, time to first response, opportunity stage age, service-request age, work-order cycle time, overdue work, completion/evidence rate and user adoption.

## Users and Stakeholders

- **Public visitor or prospective customer:** browses services/products and sends an enquiry.
- **Website/content editor or administrator:** maintains site content, products, posts, pages, media, testimonials and other published information.
- **Sales/CRM user:** maintains companies and contacts, opportunities, and related activities.
- **Service coordinator:** triages service requests/incidents, devices, suppliers and technicians.
- **Field Docs administrator:** manages users, teams, clients, templates, settings and schedules.
- **Field supervisor:** coordinates and reviews work-order tasks and approvals.
- **Technician:** works on assigned tasks, records status, evidence, notes and field documents.
- **Customer approver:** receives a public tokenized link to review/approve a requested item.

The role names above reflect labels and code behavior. The business must confirm which job titles map to each account and who owns access approval.

## Scope

### Present in the repository

- Public company website, product catalog, blog and case studies.
- `/admin` content-management, engagement, CRM, sales, service-management and administration areas.
- `/field-docs` work-order, task, document, asset, schedule, client, report and user workflows.
- PostgreSQL persistence, migrations, bootstrap content seed and Playwright end-to-end tests.
- Optional SMTP, Africa's Talking SMS, analytics and push-notification integrations; WhatsApp is available through external contact links only.

### Not confirmed or not complete end to end

- A complete custom-object/custom-field product workflow: database tables, Sequelize models, helper functions and a dynamic form component exist, but no current admin route/API workflow was found that lets users manage custom objects and records end to end.
- MySQL/MariaDB support. The migration runner and Field Docs implementation use PostgreSQL-specific SQL.
- External identity provider, transactional-email platform, notification platform, or CRM grid replacement. These are not established by the current package configuration.
- Production hosting account, DNS, CI/CD, backup policy, monitoring, support rota, RTO/RPO, privacy classification and named system owners. These were not found in repository evidence.

## How the Current Solution Was Reached

This is a repository-evidence reconstruction, not a complete project-history narrative.

- Git currently contains only an initial Create Next App commit. The application files and the planning documents are uncommitted/untracked in the inspected worktree, so the commit history does not preserve their authorship, review, rollout or change rationale.
- The current implementation is Next.js 16 App Router with React/TypeScript, PostgreSQL and shared Sequelize models. The `server/` directory contains models, migrations, seed and data helpers; it is not the old Express web server.
- `server/migrations/` contains dated schema changes for custom-field metadata, case studies, service incidents/requests, product benefits, devices/maintenance, integrations, WhatsApp and service-request stages. Filenames are evidence of repository artifacts, not proof of their production rollout dates.
- `PHASE1_SCHEMA_DESIGN.md` and the `20260803_phase1_custom_fields.sql` migration describe a flexible metadata-driven object model. The database/model/helper foundation is present; end-user management routes and screens were not found in the current route tree.
- `TWENTY_CRM_PARITY_ANALYSIS.md` is an August 2026 gap-analysis snapshot. Its feature-status statements and estimates are not authoritative current status: several items it calls missing have since appeared in the code, while other proposals remain unwired.
- Field Docs is integrated into the same Next deployment and PostgreSQL database, but uses the separate `field_docs` schema and separate credentials/session cookie.
- The previous Express project has been retired. This project’s startup path is the root Next.js `package.json` scripts.

Before representing design choices as formally approved, collect the original user research, requirements, architecture decisions, release notes and stakeholder sign-offs. Add dated Architecture Decision Records for future material choices.

## Constraints and Risks

- PostgreSQL is the only end-to-end supported dialect.
- Development and production `dev`, `build` and `start` scripts run migrations and seed before serving; all require database access.
- Field Docs has development fallback credentials and a fallback session-signing secret in code. Production is blocked until unique credentials/secrets are set and any accounts created using defaults are rotated.
- Production admin auth needs a strong `JWT_SECRET`. The seed only uses `ADMIN_PASSWORD` when initially creating an admin; changing the environment variable does not rotate an existing account.
- No automated backup/restore procedure, operational monitoring or named incident owner was verified in this repository.
- Client-visible approval links and uploaded files may contain customer or service information; retention and access policy need owner approval.
- A local LAN development server is not a public production deployment.

## Decisions Needed from the Business

1. Confirm the three application audiences and the exact boundary between admin service requests and Field Docs work orders.
2. Name the product owner, database owner, deployment owner and first-line support contact.
3. Approve which CRM enhancements are necessary; do not adopt the historical Twenty parity plan wholesale without user validation.
4. Approve data retention, customer approval-link expiry, backups, RTO/RPO and production access policy.
5. Set measurable launch/support objectives and identify who signs off user acceptance.

## Related Documents

- [Architecture](ARCHITECTURE.md)
- [User Guide](USER_GUIDE.md)
- [Developer and Operations Handover](DEVELOPER_OPERATIONS_HANDOVER.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
