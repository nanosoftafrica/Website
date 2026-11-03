# Twenty CRM Parity Analysis

**Objective:** Identify gaps between current Nanosoft CRM and Twenty CRM to reach "Twenty CRM Level"

**Document Date:** August 3, 2026  
**Target Feature Level:** Twenty CRM (Open Source Standard)

---

## Executive Summary

Your current implementation has the foundation (list views, basic CRUD, modal forms) but is missing ~70% of Twenty CRM's production-grade features. The largest gaps are in customization (custom objects/fields), activity tracking (emails/tasks/notes), automation (workflows), AI integration, and analytics (dashboards).

---

## Current Implementation Status

### ✅ Implemented
- Basic entities: Companies, Contacts, Opportunities (Deals), Projects (Work Orders)
- List-based views with search, sort, filter
- Modal-based create/edit/delete
- Multi-select bulk operations UI
- Sidebar navigation with collapsible sections
- Basic role-based access (Admin)
- Status badges with color coding
- Contact/Company name enrichment

### ❌ Not Implemented
- Everything else below

---

## Feature Gap Analysis

### 1. Data Model & Customization (Critical)

**Status:** ❌ Not Started

Two-tier gap: hard limits on what you can track.

#### A. Custom Objects
- **Twenty:** Create unlimited custom objects (no-code UI or SDK)
  - Example: `Rocket`, `Launch`, `Payload`, `LaunchSite` with auto-relations
  - Each object gets full CRUD, list views, dashboards
- **Nanosoft:** Hard-coded entities only (Companies, Contacts, Deals, Orders)
- **Impact:** Cannot model client-specific workflows (e.g., service contracts, invoices, tickets)
- **Build Effort:** High (database migrations, schema generation, list/detail UI scaffolding)

#### B. Custom Fields
- **Twenty:** Add any field type to any object via UI (no migration)
  - Text, Long text, Email, Phone, Number, Currency, Boolean, Date, DateTime, Select, Multi-select, Relation (1:1, 1:N, N:N)
- **Nanosoft:** Field structure is hard-coded in database and React forms
- **Impact:** Hard to add client-requested fields; every new field = code change
- **Build Effort:** Very High (need field type system, dynamic form rendering, database schema flexibility)

#### C. Object Relations
- **Twenty:** Any-to-any relations with cardinality (one-to-many, many-to-one, many-to-many)
- **Nanosoft:** Only foreign keys (contactId, companyId); no UI for managing relations
- **Build Effort:** High (relation UI, cascading deletes, relation tables)

**Roadmap Priority:** P0 — Block until this exists (everything builds on it)

---

### 2. Record Details & Activity Timeline (High Priority)

**Status:** ❌ Not Started

Currently you have list view only; no detail view or rich record context.

#### A. Record Detail Pages
- **Twenty:** Each record has a full detail view with:
  - All fields (read/write)
  - Unified activity timeline (see below)
  - Related records (companies linked to contact, opportunities linked to company)
  - Custom tabs/sections for layout
- **Nanosoft:** Modal form only (small, modal dialogs)
- **Build Effort:** Medium (new route `/admin/[entity]/[id]`, layout system, related records sidebar)

#### B. Unified Activity Timeline
Records show all interactions in one chronological feed:
- **Tasks** (To-Do items with assignee, due date, status)
- **Notes** (Rich text, timestamped, author)
- **Emails** (Synced from Gmail/Outlook if connected)
- **Calendar Events** (Meeting invitations, attendees)
- **Files** (Attachments uploaded to record)
- **System Activity** (Record created, updated, field changes)

**Nanosoft:** None of this exists

**Build Effort:** Very High
- Email/calendar sync (requires OAuth + background jobs)
- Note/task CRUD with real-time UI
- File upload storage (S3 or local)
- Activity log with proper filtering

**Roadmap Priority:** P1 — Major UX gap

---

### 3. Task & Activity Management (High Priority)

**Status:** ❌ Not Started

#### A. Tasks (To-Do Items)
- **Twenty:** Create tasks linked to any record, assign to team members, set due dates, status (TODO/DONE)
- **Nanosoft:** No task system
- **Build Effort:** Medium (new Task entity, task list view, linked task list on detail page)

#### B. Notes
- **Twenty:** Rich text notes (timestamps, author) attached to records
- **Nanosoft:** Only a text field in Work Orders (not a real note system)
- **Build Effort:** Medium (new Note entity, rich text editor, timeline display)

#### C. Files/Attachments
- **Twenty:** Upload multi-file to record, preview in-app (if enabled), download, rename, delete
- **Nanosoft:** No file attachment system
- **Build Effort:** Medium (file storage + S3/CDN integration, file type filtering, preview logic)

#### D. Email Integration
- **Twenty:** Connect Gmail/Microsoft Outlook, auto-sync emails tied to contacts/companies, full thread history on record
- **Nanosoft:** No email integration
- **Build Effort:** Very High (OAuth setup, email API polling, email parsing, thread grouping, background job scheduling)

#### E. Calendar Integration
- **Twenty:** Sync calendar events from Google Calendar/Outlook, show meetings on records
- **Nanosoft:** No calendar integration
- **Build Effort:** Very High (calendar OAuth, event sync, meeting attendee matching)

**Roadmap Priority:** P1 — Core sales productivity feature

---

### 4. Workflow Automation & AI (High Priority)

**Status:** ❌ Not Started

#### A. Workflow Engine
- **Twenty:** UI-based workflow builder:
  - Triggers: Record created, record updated, webhook received, scheduled time
  - Conditions: Filter records by field values
  - Actions: Create record, update record, send email, call webhook, run AI agent
  - Example: "When Opportunity created → Assign to owner → Send welcome email"
- **Nanosoft:** No automation engine
- **Build Effort:** Very High (workflow builder UI, trigger/action executor, job queue, error handling)

#### B. AI Integration
- **Twenty:** Claude MCP server (Model Context Protocol) — Claude/ChatGPT/Cursor can read/write CRM data
  - Examples: "Build a dashboard of pipeline by stage", "Draft workflow for email sequence"
  - Agents can create deals, update pipelines, run workflows
- **Nanosoft:** No AI integration
- **Build Effort:** Medium (implement Twenty SDK MCP pattern, expose API read/write, test with Claude)

#### C. Webhooks
- **Twenty:** Send webhooks on record events (created, updated, deleted)
  - Integrate with n8n, Zapier, custom services
- **Nanosoft:** No webhook system
- **Build Effort:** Medium (webhook table, event broadcaster, retry logic)

**Roadmap Priority:** P2 — Acceleration feature, high ROI

---

### 5. Dashboards & Reporting (Medium Priority)

**Status:** ❌ Not Started

#### A. Custom Dashboards
- **Twenty:** Build dashboards from live CRM data
  - Widgets: Aggregate (sum/count), Bar, Line, Pie charts
  - Filtered metrics from any object
  - Real-time updates
  - Example: "Revenue by stage", "Win rate by owner", "Pipeline coverage"
- **Nanosoft:** No dashboard system
- **Build Effort:** Very High (dashboard builder UI, metric calculator, chart library integration, live updates)

#### B. CSV Import/Export
- **Twenty:** Import CSV with column-to-field mapping (including relations), export any view to CSV
- **Nanosoft:** No import/export
- **Build Effort:** Medium (CSV parser, column mapper UI, bulk insert)

#### C. Views/Saved Filters
- **Twenty:** Save filter combinations, switch between views quickly
- **Nanosoft:** Filter is ephemeral (lost on page reload); no saved views
- **Build Effort:** Low (View entity, persist to DB, UI to manage)

**Roadmap Priority:** P3 — Business intelligence, improves team visibility

---

### 6. Search & Navigation (Medium Priority)

**Status:** ❌ Partially Implemented

#### A. Global Search (⌘K Command Palette)
- **Twenty:** Open with ⌘K, fuzzy search across all records (Companies, Contacts, Opportunities, etc.), quick nav
- **Nanosoft:** No global search
- **Build Effort:** Medium (search index, command palette UI)

#### B. Record Links
- **Twenty:** Click a company name → navigate to detail page; click contact → detail page
- **Nanosoft:** Inline clickable names but no detail page (modal form only)
- **Build Effort:** Low (add detail route, link navigation)

**Roadmap Priority:** P3 — Usability improvement

---

### 7. Permissions & Multi-Tenancy (Medium Priority)

**Status:** ⚠️ Basic Only

#### Current State
- Admin role exists in database
- No RBAC (Role-Based Access Control) UI
- No field-level or row-level permissions
- Single user system (no team collaboration)

#### Twenty's Approach
- Team-based workspaces (multi-tenant)
- Role assignment (Admin, Member, Custom roles)
- Row-level permissions (see only your records, or all, etc.)
- Field-level visibility (Pro/Org plans)
- Audit logs (Org plan)

#### Nanosoft Needs
- RBAC UI to define roles with granular permissions
- Row-level access control (show only records user owns)
- Activity audit log (who changed what, when)
- Multi-team support (future)

**Build Effort:** High (permission system, audit logging, UI)

**Roadmap Priority:** P2 — Required for multi-user production use

---

### 8. Contact & Company Management (Low Priority)

**Status:** ⚠️ Partial

#### Current Gap
- **Twenty:** Rich contact/company fields (Address, Industry, ARR, LinkedIn URL, Employee count, ICP flag, etc.)
- **Nanosoft:** Minimal fields (name, email basic contact info)

#### Build Effort:** Low (add custom fields when field type system exists)

**Roadmap Priority:** P3 — Low-hanging fruit once custom fields work

---

### 9. UI/UX Polish (Low Priority)

**Status:** ⚠️ Partial

#### Current Strengths
- List view with sort/filter
- Modal forms
- Status badges

#### Twenty's Advantages
- Drag-and-drop pipeline (Kanban view as option, not default)
- Inline editing on table
- Rich text for notes/descriptions
- Quick actions (⌘K)
- Side panel for settings/AI chat (doesn't interrupt workflow)
- Real-time collaboration

#### Nanosoft Needs (Medium Priority)
- Inline editing (edit cell value without modal)
- Kanban option for pipeline (alternative to list)
- Detail panels slide from right (not modal)
- Live refresh when data updates

**Build Effort:** Medium (incremental UI improvements)

---

## Build Priority Roadmap

### Phase 1: Foundation (Months 1-3)
**Goal:** Enable custom data modeling

- [ ] **Custom Fields System**
  - Data type definitions (Text, Number, Select, Date, etc.)
  - Dynamic form rendering
  - Schema migration strategy
  - Estimated: 6 weeks

- [ ] **Custom Objects**
  - Object CRUD endpoints
  - List view scaffolding
  - Auto-relation handling
  - Estimated: 4 weeks

- [ ] **Record Detail Pages**
  - Replace modal forms with `/admin/[entity]/[id]` routes
  - Sidebar with related records
  - Full field editing
  - Estimated: 3 weeks

**Checkpoint:** Can users create custom objects and fields without code? ✓

---

### Phase 2: Activity & Collaboration (Months 4-6)
**Goal:** Rich record context and team features

- [ ] **Notes & Tasks**
  - Note entity + CRUD
  - Task entity + assignment + due dates
  - Rich text editor
  - Timeline display on record
  - Estimated: 4 weeks

- [ ] **Files/Attachments**
  - File upload to record
  - S3 integration (or local storage)
  - File preview
  - Estimated: 2 weeks

- [ ] **Basic RBAC**
  - Role definitions (Admin, Sales, Viewer)
  - Row-level access (own records vs. all)
  - Audit log
  - Estimated: 3 weeks

- [ ] **Basic Email Sync** (or defer to Phase 3)
  - Gmail OAuth integration
  - Email-to-record linking
  - Thread grouping
  - Estimated: 4 weeks (separate from initial Phase 2)

**Checkpoint:** Reps can track calls, tasks, notes on a record? ✓

---

### Phase 3: Automation & Intelligence (Months 7-9)
**Goal:** Workflow automation and AI-driven workflows

- [ ] **Workflow Engine**
  - Trigger + condition + action builder
  - Job queue for execution
  - Basic triggers (created, updated, webhook)
  - Estimated: 6 weeks

- [ ] **Email & Calendar Integration**
  - Gmail/Outlook OAuth flow
  - Calendar sync
  - Meeting-to-opportunity matching
  - Estimated: 5 weeks

- [ ] **AI Integration (Claude MCP)**
  - Expose CRM API as MCP server
  - Test with Claude, Cursor
  - Estimated: 2 weeks

**Checkpoint:** Can users automate repetitive workflows? ✓

---

### Phase 4: Dashboards & Reporting (Months 10-12)
**Goal:** Business intelligence and executive visibility

- [ ] **Dashboard Builder**
  - Metric aggregation (sum, count, avg)
  - Chart widgets (bar, line, pie)
  - Filtered metrics
  - Real-time updates
  - Estimated: 6 weeks

- [ ] **Saved Views**
  - Persist filter combinations
  - UI to manage views
  - Estimated: 1 week

- [ ] **CSV Import/Export**
  - Column mapping UI
  - Bulk insert with relations
  - Export from any view
  - Estimated: 2 weeks

- [ ] **Global Search (⌘K)**
  - Fuzzy search index
  - Command palette UI
  - Estimated: 2 weeks

**Checkpoint:** Can execs run reports without SQL? ✓

---

## Migration Strategy

### Data Model Migration
1. **Current:** Hard-coded PostgreSQL schema (companies, contacts, deals, work_orders, etc.)
2. **Target:** Flexible object/field system similar to Twenty's `object_metadata` + `field_metadata` tables
3. **Path:**
   - Create new schema tables for custom objects/fields (non-breaking)
   - Add a `metadata_object_type` column to entities (standard objects map to 'company', 'contact', etc.)
   - Build compatibility layer to read old schema and new schema
   - Gradually migrate data over time
   - Estimated: 2 weeks planning + 2 weeks implementation

### API Evolution
- Current: RESTful endpoints per entity (`/api/admin/deals`, `/api/admin/work-orders`)
- Target: Generic CRUD endpoint (`/api/admin/objects/[objectId]/records`) + legacy routes for compatibility
- Parallel support both for 2-3 sprints, then deprecate legacy

### Form System Overhaul
- **Current:** Hard-coded React form per entity (DealsBoardClient form, WorkOrdersForm, etc.)
- **Target:** Generic `<DynamicForm>` component that reads field metadata and renders appropriate inputs
- **Path:** Implement dynamic form in parallel, migrate entities one-by-one

---

## Estimated Build Effort Summary

| Phase | Features | Weeks | Headcount |
|-------|----------|-------|-----------|
| 1     | Custom Fields + Objects + Detail Pages | 13    | 1-2 engineers |
| 2     | Notes, Tasks, Files, RBAC | 12    | 2 engineers |
| 3     | Workflows, Email/Calendar, AI MCP | 13    | 2 engineers |
| 4     | Dashboards, Saved Views, Search, Export | 11    | 1-2 engineers |
| **Total** | | **49 weeks** | **~1.5 FTE avg** |

**Timeline:** ~12 months for full parity (if no context switching)

---

## Quick Wins (Do First)

These require < 1 week and unlock better UX:

1. **Saved Views** (1 day)
   - Add `View` table with name, filters, sort
   - Add dropdown to load saved filters
   - Very high ROI for power users

2. **Global Search ⌘K** (3 days)
   - Fuzzy search across all entities
   - Quick nav to records
   - Reduces friction

3. **Inline Editing** (2 days)
   - Make table cells editable on double-click
   - Update via API in place
   - Faster workflow

4. **Record Detail Page** (3 days)
   - Replace modal with `/admin/[entity]/[id]` route
   - Use same form component
   - Better for rich records later

5. **CSV Export** (2 days)
   - Export current view to CSV
   - Column selection UI
   - Common request

**Effort:** 1 week, **Impact:** 4/5 stars

---

## Open Questions for Scope

1. **Email/Calendar Priority?**
   - Defer to Phase 3 or move earlier?
   - Gmail-only or also Outlook?

2. **Multi-User from Day 1?**
   - RBAC in Phase 2, or wait until Phase 3?
   - Affects data isolation, audit logs

3. **Kanban Option?**
   - Twenty supports both list + kanban for pipeline
   - Add kanban view alongside list?
   - Estimated: 1 week (once custom objects exist)

4. **Dashboard Complexity?**
   - Simple widgets only (metric, bar, pie)?
   - Or advanced (filters, drill-down, scheduled export)?
   - Basic is sufficient for MVP.

5. **Third-Party Integrations?**
   - n8n, Zapier webhooks?
   - Slack notifications?
   - Scope these after workflow engine.

---

## Summary

You have a solid foundation (list views, basic CRUD). To reach Twenty CRM level:

**Must Have (P0):**
- Custom Objects & Fields
- Record Detail Pages
- Activity Timeline (Notes, Tasks)

**Should Have (P1):**
- Email/Calendar Sync
- Workflows & Automation
- Basic RBAC

**Nice to Have (P2):**
- Dashboards
- Global Search
- AI Integration

**Estimated Effort:** 12 months at 1.5 FTE  
**Recommended Start:** Week 1 — Custom Fields + Objects (foundational)
