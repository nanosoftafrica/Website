# Nanosoft Website — Setup Guide

## Prerequisites
- Node.js 18+ (check: `node -v`)
- A MongoDB Atlas account (free): https://cloud.mongodb.com
- cPanel hosting with Node.js support (Phusion Passenger)

---

## Step 1 — MongoDB Atlas

1. Go to https://cloud.mongodb.com and create a free account
2. Create a new **Cluster** (free M0 tier)
3. Under **Database Access**, create a user with password
4. Under **Network Access**, add `0.0.0.0/0` (allow all) or your server's IP
5. Click **Connect → Drivers** and copy your connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/nanosoft?retryWrites=true&w=majority
   ```

---

## Step 2 — Environment Variables

Copy `.env.example` to `.env` and fill in:

```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb+srv://...   ← your Atlas connection string
JWT_SECRET=<long-random-string> ← generate: openssl rand -hex 32
ADMIN_USERNAME=admin
ADMIN_PASSWORD=YourSecurePassword123!
```

---

## Step 3 — Install & Seed

```bash
npm install
npm run seed
```

This creates:
- The admin user (from your `.env` credentials)
- All Nanosoft content in MongoDB

---

## Step 4 — Run Locally

```bash
npm run dev
```

Open http://localhost:3000 — public site
Open http://localhost:3000/admin — CMS admin panel

---

## Step 5 — Deploy to cPanel

### Check Node.js support
In cPanel → look for **"Setup Node.js App"**. If it's there, you're good.
If not, contact your host and ask if they support **Phusion Passenger for Node.js**.

### Upload files
Upload the entire project folder to your domain's root (usually `public_html`).
**Do NOT upload `node_modules/`** — install on the server instead.

### Install on server
Via cPanel → Terminal (or SSH):
```bash
cd ~/public_html
npm install --production
```

### Configure Phusion Passenger in cPanel
1. cPanel → Setup Node.js App → Create Application
2. Node.js version: 18+
3. Application root: `public_html` (or wherever you uploaded)
4. Application startup file: `passenger.js`
5. Environment: Production
6. Add environment variable: `MONGODB_URI` = your Atlas URI
7. Add: `JWT_SECRET` = your secret
8. Add: `ADMIN_USERNAME`, `ADMIN_PASSWORD`

### Update .htaccess
In `.htaccess`, replace `<your-cpanel-username>` with your actual cPanel username:
```
PassengerAppRoot /home/YOUR_USERNAME/public_html
```

---

## Admin Panel

URL: `https://ntlafrica.com/admin`

Login with the credentials you set in `.env`:
- Username: `admin` (or whatever you set)
- Password: your `ADMIN_PASSWORD`

### What you can edit:
| Section | What changes |
|---------|-------------|
| Hero | Badge, headline, subheading, CTA buttons, stats bar |
| Company | Name, tagline, about, mission, vision, values, contact details, social links |
| Services | Icons, titles, descriptions — add/remove services |
| Clients | The "Trusted by" logos bar |
| Process Steps | How It Works steps |
| Products | All 6 products — name, description, features, colours |
| Team | Team members — name, role, initials, avatar gradient |
| Messages | Read contact form submissions |
| SEO & Tags | Title tag, meta description, keywords, canonical URL, OG image |
| Password | Change your admin password |

---

## SEO Tagging — What's Included

Every page load includes:
- ✅ `<title>` tag — editable via CMS
- ✅ `<meta name="description">` — editable via CMS
- ✅ `<meta name="keywords">` — editable via CMS
- ✅ `<link rel="canonical">` — editable via CMS
- ✅ Open Graph tags (og:title, og:description, og:image, og:url, og:type, og:site_name, og:locale)
- ✅ Twitter Card tags (summary_large_image)
- ✅ Schema.org JSON-LD: `LocalBusiness + Organization + WebSite + WebPage`
- ✅ Geo meta tags (for local SEO in Nairobi)
- ✅ `robots.txt` — blocks /admin and /api from crawlers
- ✅ `sitemap.xml` — submit to Google Search Console

### Submit to Google Search Console
1. Go to https://search.google.com/search-console
2. Add property: `https://ntlafrica.com`
3. Verify ownership (HTML file or DNS record)
4. Submit sitemap: `https://ntlafrica.com/sitemap.xml`
