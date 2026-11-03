# Deploying Nanosoft on Coolify (WSL + PostgreSQL)

This guide is for running Coolify on WSL/Ubuntu on Windows, deploying Nanosoft
with a Coolify-managed PostgreSQL database.

---

## Overview

```
Your Windows machine (WSL Ubuntu)
├── Coolify  → manages Docker containers, SSL, domains
├── Nanosoft App  → Node.js container on port 3000
└── PostgreSQL  → Coolify-managed database
```

---

## Step 1 — Copy project files to WSL

Open Ubuntu (WSL) terminal:

```bash
sudo cp -r "/mnt/c/Users/user/Downloads/Nanosoft Website" /opt/nanosoft
```

---

## Step 2 — Fix the Dockerfile (already done — uses npm install)

Verify:
```bash
grep "npm" /opt/nanosoft/Dockerfile
# Should show: npm install --omit=dev --ignore-scripts
```

---

## Step 3 — Add PostgreSQL in Coolify

1. Open Coolify → `http://localhost:8000`
2. Go to **Projects** → **+ New Project** → name it `Nanosoft`
3. Click **+ New Resource** → **Database** → **PostgreSQL**
4. Set:
   - **Name**: `nanosoft-db`
   - **PostgreSQL version**: 16
   - **Database name**: `nanosoft`
   - **Username**: `nanosoft`
   - **Password**: choose a strong password
5. Click **Save** then **Start**
6. Once running, click the database → copy the **Internal Connection URL**
   It looks like:
   ```
   postgresql://nanosoft:YOUR_PASSWORD@nanosoft-db:5432/nanosoft
   ```

---

## Step 4 — Build the Docker image

In WSL terminal:

```bash
cd /opt/nanosoft
sudo docker build -t nanosoft-app:latest .
```

Takes 2–3 minutes. Watch for `✓ Image nanosoft-app Built` at the end.

---

## Step 5 — Add the app in Coolify

1. In your `Nanosoft` project → **+ New Resource** → **Docker Image**
2. Set:
   - **Image**: `nanosoft-app:latest`
   - **Port**: `3000`
3. Go to **Environment Variables** and add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | paste the Internal Connection URL from Step 3 |
| `DB_SSL` | `false` |
| `JWT_SECRET` | run `openssl rand -hex 32` in WSL and paste |
| `JWT_EXPIRES_IN` | `7d` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | your secure password (min 8 chars) |
| `SITE_URL` | `http://localhost:3000` (or your domain) |
| `NODE_ENV` | `production` |

4. Click **Deploy**

---

## Step 6 — Seed the database

Once the app shows as **Running** in Coolify:

In Coolify → your app → **Terminal** (or in WSL):

```bash
sudo docker exec nanosoft_app node server/seed.js
```

You should see:
```
✓ Admin created
✓ Content seeded
✓ Products seeded
✓ Team seeded
✅ Database seeded successfully!
```

---

## Step 7 — Verify

```bash
curl http://localhost:3000/api/health
# → {"status":"ok","ts":"..."}

curl http://localhost:3000/api/content
# → Full site content JSON
```

Open in browser:
- `http://localhost:3000` — public website
- `http://localhost:3000/admin` — CMS admin panel

---

## Updating the app after code changes

```bash
# In WSL:
sudo cp -r "/mnt/c/Users/user/Downloads/Nanosoft Website" /opt/nanosoft
cd /opt/nanosoft
sudo docker build -t nanosoft-app:latest .
```

Then in Coolify → your app → **Redeploy**.

---

## Updating content without redeploying

Log into `/admin` — all text, products, team, and SEO tags are editable live.
No rebuild needed for content changes.

---

## Adding a public domain (optional)

If your WSL machine is accessible from the internet (port forwarding set up):

1. Coolify → your app → **Domains**
2. Add your domain e.g. `ntlafrica.com`
3. Enable **Let's Encrypt SSL**
4. Click **Save**

Coolify's Traefik proxy handles HTTPS automatically.
