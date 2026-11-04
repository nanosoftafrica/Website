# Implementation Plan

**Status:** Proposed sequence for stakeholder approval, not a committed schedule.\
**Basis:** Repository inspection on 2026-11-03 and existing design notes.\
**Estimates/owners:** Not assigned; confirm scope, staffing and acceptance authority first.

## Guiding Approach

Stabilize and secure the implemented workflows before adding CRM-parity features. Base scope on interviews and measured operational pain, not solely on the August 2026 Twenty CRM comparison. Keep the existing fixed relational models as the operational source of truth until a reviewed migration plan says otherwise.

## Phase 0: Ownership and Baseline

**Purpose:** Make the project supportable and establish a verified deployment baseline.

- Name business/product owner, technical owner, database/deployment owner and first-line support contact.
- Identify production/staging/local environments, hostnames, database owner, data classification and external providers.
- Replace development/default admin passwords and Field Docs session secret; verify the admin JWT secret and HTTPS cookie settings.
- Define backup frequency, retention, recovery point/time objectives and test-restore owner.
- Capture current feature inventory and validate the problem statement with sales, content, service and field users.

**Acceptance gate:** No default credentials/secrets in a shared environment; successful documented backup and isolated restore test; named owners and approved release checklist.

## Phase 1: Stabilize Current Workflows

**Purpose:** Make the current public, CRM/service and field workflows reliable before extending them.

- Build a regression matrix for public inquiry, contact/company/opportunity, service request/incident, work-order creation, task state transitions, documents, customer approvals and schedules.
- Add or repair automated tests around critical write paths, role boundaries and seed/migration behavior.
- Review authorization for every API route and validate editor/admin/supervisor/technician permissions.
- Test email, SMS, upload persistence and notification failure paths when enabled; verify manual WhatsApp contact links.
- Establish logging, uptime checks and operational alert ownership.

**Acceptance gate:** Critical end-to-end scenarios pass against a clean test database; permission tests cover allow and deny cases; operations can diagnose database, email, integration and upload failures.

## Phase 2: User Acceptance and Release Handover

**Purpose:** Confirm that the delivered workflows solve the real user problem and can be operated.

- Run role-based UAT with representative content editors, sales/service coordinators, supervisors and technicians.
- Record test cases, defects, data migration needs and sign-off; do not treat successful compilation as business acceptance.
- Train support staff and users using the [User Guide](USER_GUIDE.md), then collect usability gaps.
- Set release/rollback procedure, production monitoring, support hours and escalation contacts.

**Acceptance gate:** Named business owner approves UAT; release and rollback are rehearsed; user/support handover is acknowledged.

## Phase 3: Decide CRM Extensibility Scope

**Purpose:** Resolve whether metadata-driven custom records are a real customer requirement.

Existing object/field metadata tables, Sequelize models, generic CRUD helpers and a dynamic form component are present. A user-accessible end-to-end custom-object workflow was not found. Before expanding it:

- Interview users and collect concrete custom-field/object requests, volumes, permissions and reporting needs.
- Decide whether to finish the metadata-driven product, extend fixed models, or use an external CRM. Compare migration, validation, audit, access-control and reporting costs.
- Define compatibility and migration rules for Companies, Contacts, Deals and work orders; preserve existing API behavior until clients are migrated.
- Build object/field administration, validated API routes, list/detail views, relationship handling, access control, audit and import/export only if approved.

**Acceptance gate:** Approved product requirements, data model decision, migration/rollback plan and security review. Do not expose the partial generic CRUD helpers without authorization and validation review.

## Phase 4: Approved Integrations and Reporting

**Purpose:** Invest in integrations/analytics based on measurable demand.

- Prioritize only the specific email, calendar, workflow, messaging, dashboard, saved-view or AI use cases the owner approves.
- Specify provider, data consent, credential ownership, rate limits, retries, audit, support and failure recovery before implementation.
- Define analytics metrics against source-of-truth data and document metric definitions.

**Acceptance gate:** Each integration has an owner, test environment, failure/retry behavior, data policy and support runbook; reports have business-approved definitions.

## Release Gates for Every Phase

- Database migration reviewed, backed up and tested on a disposable/staging database.
- `npm run lint`, production build and relevant Playwright scenarios pass.
- Secrets are supplied through the host's secret manager/environment, not committed or client-exposed.
- User-facing changes have updated documentation and role-based acceptance evidence.
- Rollback, monitoring and support ownership are recorded before production release.

## Historical Plans and Provenance

`PHASE1_SCHEMA_DESIGN.md` and `TWENTY_CRM_PARITY_ANALYSIS.md` are planning artifacts dated August 2026. They contain useful design ideas, but their estimates, target features and feature-gap claims are not approved scope or verified current status. The repository currently has only one initial Git commit, so original decision discussions and implementation ownership cannot be reconstructed from Git. Record future architectural decisions in dated ADRs and maintain reviewed release notes.
# Implementation Plan

**Status:** Proposed sequence for stakeholder approval, not a committed schedule.\
**Basis:** Repository inspection on 2026-11-03 and existing design notes.\
**Estimates/owners:** Not assigned; confirm scope, staffing and acceptance authority first.

## Guiding Approach

Stabilize and secure the implemented workflows before adding CRM-parity features. Base scope on interviews and measured operational pain, not solely on the August 2026 Twenty CRM comparison. Keep the existing fixed relational models as the operational source of truth until a reviewed migration plan says otherwise.

## Phase 0: Ownership and Baseline

**Purpose:** Make the project supportable and establish a verified deployment baseline.

- Name business/product owner, technical owner, database/deployment owner and first-line support contact.
- Identify production/staging/local environments, hostnames, database owner, data classification and external providers.
- Replace development/default admin passwords and Field Docs session secret; verify the admin JWT secret and HTTPS cookie settings.
- Define backup frequency, retention, recovery point/time objectives and test-restore owner.
- Capture current feature inventory and validate the problem statement with sales, content, service and field users.

**Acceptance gate:** No default credentials/secrets in a shared environment; successful documented backup and isolated restore test; named owners and approved release checklist.

## Phase 1: Stabilize Current Workflows

**Purpose:** Make the current public, CRM/service and field workflows reliable before extending them.

- Build a regression matrix for public inquiry, contact/company/opportunity, service request/incident, work-order creation, task state transitions, documents, customer approvals and schedules.
- Add or repair automated tests around critical write paths, role boundaries and seed/migration behavior.
- Review authorization for every API route and validate editor/admin/supervisor/technician permissions.
- Test email, WhatsApp, SMS, upload persistence and notification failure paths when enabled.
- Establish logging, uptime checks and operational alert ownership.

**Acceptance gate:** Critical end-to-end scenarios pass against a clean test database; permission tests cover allow and deny cases; operations can diagnose database, email, integration and upload failures.

## Phase 2: User Acceptance and Release Handover

**Purpose:** Confirm that the delivered workflows solve the real user problem and can be operated.

- Run role-based UAT with representative content editors, sales/service coordinators, supervisors and technicians.
- Record test cases, defects, data migration needs and sign-off; do not treat successful compilation as business acceptance.
- Train support staff and users using the [User Guide](USER_GUIDE.md), then collect usability gaps.
- Set release/rollback procedure, production monitoring, support hours and escalation contacts.

**Acceptance gate:** Named business owner approves UAT; release and rollback are rehearsed; user/support handover is acknowledged.

## Phase 3: Decide CRM Extensibility Scope

**Purpose:** Resolve whether metadata-driven custom records are a real customer requirement.

Existing object/field metadata tables, Sequelize models, generic CRUD helpers and a dynamic form component are present. A user-accessible end-to-end custom-object workflow was not found. Before expanding it:

- Interview users and collect concrete custom-field/object requests, volumes, permissions and reporting needs.
- Decide whether to finish the metadata-driven product, extend fixed models, or use an external CRM. Compare migration, validation, audit, access-control and reporting costs.
- Define compatibility and migration rules for Companies, Contacts, Deals and work orders; preserve existing API behavior until clients are migrated.
- Build object/field administration, validated API routes, list/detail views, relationship handling, access control, audit and import/export only if approved.

**Acceptance gate:** Approved product requirements, data model decision, migration/rollback plan and security review. Do not expose the partial generic CRUD helpers without authorization and validation review.

## Phase 4: Approved Integrations and Reporting

**Purpose:** Invest in integrations/analytics based on measurable demand.

- Prioritize only the specific email, calendar, workflow, messaging, dashboard, saved-view or AI use cases the owner approves.
- Specify provider, data consent, credential ownership, rate limits, retries, audit, support and failure recovery before implementation.
- Define analytics metrics against source-of-truth data and document metric definitions.

**Acceptance gate:** Each integration has an owner, test environment, failure/retry behavior, data policy and support runbook; reports have business-approved definitions.

## Release Gates for Every Phase

- Database migration reviewed, backed up and tested on a disposable/staging database.
- `npm run lint`, production build and relevant Playwright scenarios pass.
- Secrets are supplied through the host's secret manager/environment, not committed or client-exposed.
- User-facing changes have updated documentation and role-based acceptance evidence.
- Rollback, monitoring and support ownership are recorded before production release.

## Historical Plans and Provenance

`PHASE1_SCHEMA_DESIGN.md` and `TWENTY_CRM_PARITY_ANALYSIS.md` are planning artifacts dated August 2026. They contain useful design ideas, but their estimates, target features and feature-gap claims are not approved scope or verified current status. The repository currently has only one initial Git commit, so original decision discussions and implementation ownership cannot be reconstructed from Git. Record future architectural decisions in dated ADRs and maintain reviewed release notes.
