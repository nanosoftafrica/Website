# Build Prompt: Marketing Website with Built-In CMS + CRM

Copy the block below into Claude (or Claude Code) to kick off the build.

---

## PROMPT

Build a comprehensive marketing website with a built-in CMS and CRM. The end users are non-technical marketing staff, so every day-to-day task must be doable through a simple visual dashboard — no code, no config files, no developer needed after launch.

**Core requirements:**

1. **Website**
   - Modern, responsive, fast-loading public site (homepage, landing pages, blog, product/service pages, forms, contact page).
   - SEO basics built in: editable meta titles/descriptions, clean URLs, sitemap, alt text fields.
   - Marketers can create/edit pages and blog posts via a drag-and-drop or block-based editor (like Wix/Webflow/WordPress Gutenberg) — no HTML knowledge required.

2. **CMS (Content Management System)**
   - Non-technical staff can add, edit, schedule, and publish pages, posts, and media without help.
   - Media library for images/video with simple upload and organization.
   - Reusable templates/blocks marketers can drop into pages.
   - Draft/preview/approval workflow before anything goes live.
   - Role-based permissions (e.g., editor vs. admin).

3. **CRM (Customer Relationship Management)**
   - Capture leads automatically from every website form.
   - Contact records with activity history (site visits, form fills, email opens/clicks).
   - Simple pipeline/stages view (New → Contacted → Qualified → Won/Lost) marketers can drag between.
   - Tagging/segmentation and basic email follow-up or handoff to an email tool.
   - Should feel like one connected system, not the CMS and CRM bolted together — same login, same dashboard, shared contact/lead data.

4. **Social media integration**
   - Connect and post to major platforms (Facebook, Instagram, LinkedIn, X/Twitter, TikTok, YouTube) from one place.
   - Ability to schedule posts and see a content calendar.
   - Pull basic engagement stats (likes, shares, comments, reach) back into the dashboard.

5. **Analytics integration**
   - Connect Google Analytics (GA4) and Meta (Facebook/Instagram) Ads/Insights.
   - Show traffic, conversions, campaign performance, and lead source in one simple, readable dashboard — charts and plain-language summaries, not raw data dumps.
   - Marketers should be able to see "what's working" without exporting spreadsheets or reading API docs.

6. **Ease of use above all**
   - Every feature above must be operable by a marketing person with no technical background: guided setup wizards for connecting social/analytics accounts (OAuth login flows, not API keys typed in manually), tooltips/help text, undo options, and sensible defaults.
   - Provide a single unified dashboard as the home base: site content, leads/CRM, social calendar, and analytics all reachable from one nav.

**Your task:**

- Recommend a concrete technical approach and stack (e.g., an all-in-one platform vs. headless CMS + CRM + integration layer vs. custom build) with tradeoffs on cost, setup time, and long-term flexibility.
- If custom-built, propose the architecture (frontend, CMS backend, CRM data model, integration/auth layer for OAuth with social + analytics APIs, hosting).
- If leveraging existing tools (e.g., WordPress + HubSpot/CRM plugin + Zapier/Make, or Webflow + a CRM, or a unified platform like HubSpot CMS), lay out how they connect and where the "single dashboard" experience comes from.
- Build in phases: (1) website + CMS core, (2) CRM + lead capture, (3) social scheduling, (4) analytics dashboard, (5) polish/permissions/onboarding.
- Flag any accounts, API access, or approvals the marketing team will need to grant (Google Analytics, Meta Business, social platform app permissions) and explain these in plain terms.
- Deliver setup instructions written for a non-technical marketer, not a developer.

---

Want me to tailor this before you use it — e.g., pick a specific stack recommendation, add your company name/branding details, or turn it into a phased project brief with timelines?
