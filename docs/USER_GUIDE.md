# User Guide

This guide describes the main workflows visible in the current application. Exact controls may differ by role and deployment configuration. Contact the system administrator if a menu item is unavailable or a record appears outside your team.

## 1. Public Website

Visitors can browse the company site, services/products, case studies and blog. Use the contact or service-inquiry form to send a request. The site may acknowledge the request while notifications depend on configured email services. Do not submit passwords, payment-card information or other secrets through public forms.

## 2. Nanosoft Admin

Open `/admin/login`, enter the admin username and password, and select **Sign in**. On a shared computer, log out using the navigation footer when finished. Admin is separate from Field Docs sign-in.

### Navigation areas

- **Dashboard:** operational overview and recent activity.
- **CRM:** companies and contacts.
- **Sales:** opportunities and sales pipeline.
- **Service Management:** client devices, incidents, service requests, technicians and suppliers.
- **Catalog & Inventory:** service categories and products/services.
- **CMS:** site content, blog posts, pages, media, tags and comments.
- **Brand & Company:** team, testimonials, case studies, milestones and navigation menu.
- **Engagement:** incoming messages, comments and newsletter subscribers.
- **Administration:** analytics, integrations, audit log and settings.
- **Field Operations:** link to Field Docs; it opens the separate application and login state.

### Common record workflow

1. Open a section from the sidebar.
2. Use search, column sorting or the available stage/status filter to find records.
3. Choose the add action to create a record, or select an existing row/item to edit it.
4. Complete required fields and save. For deletion, review the confirmation prompt; deletion may be irreversible.
5. Refresh the list or dashboard if it does not update immediately.

Search and filtering are generally limited to the currently loaded list; do not assume they search all historical database records unless the screen says so.

### CRM and opportunities

- Create companies before linking contacts or opportunities when the relationship is known.
- Keep contact details current and avoid creating duplicate contacts for the same person.
- Create an opportunity with a title and contact; add company, value/currency, stage, expected close date, owner and notes as needed.
- Update the stage as the sales conversation advances. Use the dashboard/analytics as visibility aids, not as audited financial statements.
- Activities and tasks are available in the admin system. Use them to record follow-up where the relevant page offers the action.

### Website content

- **Site Content:** edit home-page/company content and SEO fields, then select **Save all**. Review the public site after saving.
- **Products, categories, team, testimonials, events and menu:** maintain entries in their relevant sections. Some ordered lists support reordering.
- **Posts and pages:** create or edit content and verify its publication state before sharing its public URL.
- **Media Library:** upload and select media. Confirm that important images still display after a production deployment.
- **Comments and subscribers:** review and moderate inbound engagement according to company policy.

### Service management

Use devices to track installed client equipment and maintenance history. Use incidents for service-impacting problems and service requests for requested work/provisioning. Assign technicians and update statuses/stages so the next owner and outstanding action remain clear. Use suppliers to keep supplier contact information available to coordinators.

### WhatsApp and integrations

WhatsApp contact links open an external WhatsApp chat with the selected number. The application does not send WhatsApp messages or provide a WhatsApp inbox. Email, SMS and other integrations require credentials and provider connectivity.

## 3. Field Docs

Open `/field-docs` and sign in with the Field Docs email/password. These credentials are not the same as `/admin` credentials. The app can be installed as a progressive web app where the browser supports it; keep the browser updated and follow company device policy.

### Roles and navigation

- **Technician (`tech`):** sees assigned/team work and can update eligible tasks, provide evidence and complete field work. Client, schedule and settings areas are restricted.
- **Supervisor:** coordinates assigned work and can manage eligible task assignment, review work and handle approvals.
- **Admin:** manages users, clients, templates, schedules and settings in addition to operational workflows.

The current menu includes work orders, documents, assets, reports and escalations. Schedules and clients are shown to non-technician users; settings are admin-only. Account, email-alert preference and logout are available from the menu.

### Create a work order

1. Open **Work orders** and choose **New work order**.
2. Select one or more service types. The selected templates generate a task plan and evidence requirements.
3. Select an existing client or add a new client, then save the client.
4. Add site/contact/requirement, priority, requested date and optional external reference.
5. Review the generated plan, then create the work order.
6. Open the work order and review the **Tasks**, **Clocks & timeline**, **Documents & assets** and **Activity** tabs.

### Work task lifecycle

The exact actions depend on role and current status. Typical progression is:

`Ready -> Assigned -> Accepted -> In progress -> Done`

A task can also be blocked by dependencies, waiting on a client/supplier/other party, sent for approval, skipped when optional, or returned for correction. Record why a task is waiting, revise deadlines with a reason, and attach required evidence. Supervisors/admins can assign tasks and add or manage tasks where available.

A work order can be completed and later closed by a supervisor/admin. Cancellation stops its tasks and is documented as irreversible in the UI; confirm the reason and record before cancelling.

### Documents, approvals and assets

- Start required field documents from their related task so they retain the work-order context.
- Add asset name/serial/model to the work order when equipment is installed or serviced.
- Add notes, findings and attachments in the activity area. Avoid uploading unrelated personal data.
- For a client approval request, verify the recipient and documents before sending by email/WhatsApp or sharing a copied link. Treat approval URLs as private credentials; send them only to the intended client.

### Schedules, users and reports

- Admin/supervisor users can create recurring schedules from a service template, client, location, frequency and next-run date. Review the next-run date and generated work order before leaving the schedule enabled.
- Admin users can maintain Field Docs users, assign role/team, reset passwords or deactivate access. Do not share reset passwords; issue them securely through the approved channel.
- Reports/export can contain customer and operational data. Store and distribute exports only according to company policy.

## 4. Troubleshooting and Support

- **Cannot sign in:** confirm which app you are using; Admin and Field Docs have different accounts. Ask an administrator to verify the account is active/reset its password.
- **A page redirects to login:** the session may have expired; sign in again.
- **Save or upload fails:** check required fields, file size/type, connection and whether the session is still valid. Preserve the error text for support.
- **Work is missing:** check work-order status, task assignment/team and your role; ask a supervisor to verify access.
- **Site not reachable on the LAN:** use the server's actual LAN URL and port printed at startup. Run network tests from the device that cannot connect, not from the server itself.
- **Report a defect:** provide the URL, time, role, record identifier (not a password/token), steps to reproduce and exact error. Do not include customer secrets or approval-link tokens in a public ticket.
