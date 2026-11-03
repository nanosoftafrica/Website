require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const fs           = require('fs');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const sequelize    = require('./db');

// ── Security middleware ───────────────────────────────────────
// helmet() sets secure HTTP headers; CSP is relaxed for fonts/CDN
const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:      ["'self'"],
      scriptSrc:       ["'self'", "'unsafe-inline'", "'unsafe-eval'",
                        "https://fonts.googleapis.com",
                        "https://cdn.quilljs.com",
                        "https://cdn.jsdelivr.net",
                        "https://embed.tawk.to"],
      scriptSrcAttr:   ["'unsafe-inline'"],   // allow onclick= handlers in admin
      styleSrc:        ["'self'", "'unsafe-inline'",
                        "https://fonts.googleapis.com",
                        "https://cdn.quilljs.com",
                        "https://cdn.jsdelivr.net"],
      fontSrc:         ["'self'", "https://fonts.gstatic.com", "https://cdn.quilljs.com"],
      imgSrc:          ["'self'", "data:", "https:", "blob:"],
      connectSrc:      ["'self'",
                        "https://cdn.quilljs.com",
                        "https://cdn.jsdelivr.net",
                        "https://va.tawk.to",
                        "wss://ws.tawk.to"],
      frameSrc:        ["'self'", "https://tawk.to"],
      workerSrc:       ["'self'", "blob:"],
      upgradeInsecureRequests: null,   // disabled — server runs HTTP locally
    },
  },
  crossOriginOpenerPolicy: false,
  originAgentCluster:      false,
  hsts:                    false,   // Traefik handles HTTPS, not Node
}));

// ── Global rate limiter (generous, stops abuse) ───────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// ── API rate limiter (tighter) ────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests.' },
});
app.use('/api', apiLimiter);

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Ensure uploads directory ──────────────────────────────────
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ── Register models ───────────────────────────────────────────
require('./models/platform/Admin');
const Content     = require('./models/cms/Content');
const Product     = require('./models/catalog/Product');
require('./models/cms/Team');
require('./models/crm/Message');
require('./models/cms/Event');
const Post        = require('./models/cms/Post');
require('./models/cms/Testimonial');
require('./models/platform/AuditLog');
require('./models/cms/Subscriber');
require('./models/cms/Tag');
require('./models/cms/PostTag');
require('./models/cms/Comment');
require('./models/cms/PostReaction');
require('./models/cms/MenuItem');
const Page        = require('./models/cms/Page');
require('./models/crm/Company');
require('./models/crm/Contact');
require('./models/crm/Deal');
require('./models/crm/Activity');
require('./models/fulfillment/Supplier');
require('./models/fulfillment/Technician');
require('./models/fulfillment/WorkOrder');
require('./models/fulfillment/Assignment');
const PageView    = require('./models/cms/PageView');

// ── Dynamic sitemap ───────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const [content, products, posts, pages] = await Promise.all([
      Content.getSingleton(),
      Product.findAll({ where: { active: true } }),
      Post.findAll({ where: { status: 'published' }, attributes: ['slug'] }),
      Page.findAll({ where: { status: 'published' }, attributes: ['slug'] }),
    ]);
    const base = (content.seo && content.seo.canonical || process.env.SITE_URL || 'https://ntlafrica.com').replace(/\/$/, '');
    const now  = new Date().toISOString().split('T')[0];
    const urls = [
      { loc: base,                 priority: '1.0', freq: 'weekly'  },
      { loc: base + '/#how',       priority: '0.7', freq: 'monthly' },
      { loc: base + '/#products',  priority: '0.8', freq: 'monthly' },
      { loc: base + '/#about',     priority: '0.7', freq: 'monthly' },
      { loc: base + '/#testimonials', priority: '0.6', freq: 'monthly' },
      { loc: base + '/#demo',      priority: '0.7', freq: 'monthly' },
      { loc: base + '/blog.html',  priority: '0.7', freq: 'weekly'  },
      ...products.map(p => ({ loc: base + '/product.html?slug=' + p.slug,   priority: '0.6', freq: 'monthly' })),
      ...posts.map(p    => ({ loc: base + '/blog-post.html?slug=' + p.slug, priority: '0.5', freq: 'monthly' })),
      ...pages.map(p     => ({ loc: base + '/page.html?slug=' + p.slug,     priority: '0.5', freq: 'monthly' })),
    ];
    const urlsXml = urls.map(u =>
      '  <url>\n' +
      '    <loc>' + u.loc + '</loc>\n' +
      '    <lastmod>' + now + '</lastmod>\n' +
      '    <changefreq>' + u.freq + '</changefreq>\n' +
      '    <priority>' + u.priority + '</priority>\n' +
      '  </url>'
    ).join('\n');
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urlsXml + '\n</urlset>';
    res.set('Content-Type', 'application/xml').send(xml);
  } catch (e) { res.status(500).send('<!-- sitemap error -->'); }
});

// ── Maintenance mode ──────────────────────────────────────────
app.use(async (req, res, next) => {
  const skip = req.path.startsWith('/admin') ||
               req.path.startsWith('/api')   ||
               /\.\w+$/.test(req.path);
  if (skip) return next();
  try {
    const content = await Content.getSingleton();
    if (content.company && content.company.maintenanceMode) {
      return res.status(503).send(
        '<!DOCTYPE html><html><head><title>Maintenance</title>' +
        '<style>body{background:#0b1120;color:#f1f5f9;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}</style>' +
        '</head><body><div><h1>We\'ll be right back</h1><p>Nanosoft Technologies is undergoing scheduled maintenance.</p></div></body></html>'
      );
    }
  } catch (_) {}
  next();
});

// ── Analytics page-view tracker ───────────────────────────────
app.post('/api/track', async (req, res) => {
  try {
    const p    = (req.body.path || '/').slice(0, 200);
    const date = new Date().toISOString().split('T')[0];
    const [row] = await PageView.findOrCreate({
      where: { path: p, date },
      defaults: { count: 0 },
    });
    await row.increment('count', { by: 1 });
    res.json({ ok: true });
  } catch (_) { res.json({ ok: true }); }
});

// ── Newsletter subscribe ──────────────────────────────────────
app.post('/api/subscribe', rateLimit({ windowMs: 60*60*1000, max: 5, message: { error: 'Too many subscribe attempts' } }), async (req, res) => {
  try {
    const Subscriber = require('./models/cms/Subscriber');
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const [sub, created] = await Subscriber.findOrCreate({
      where: { email: email.toLowerCase().trim() },
      defaults: { name: name || '', active: true },
    });
    if (!created && !sub.active) { await sub.update({ active: true }); }
    res.json({ ok: true, message: created ? 'Subscribed!' : 'Already subscribed.' });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') return res.status(400).json({ error: 'Invalid email address' });
    res.status(500).json({ error: 'Subscribe failed' });
  }
});

// ── Homepage — SEO tags server-rendered from the CMS ────────────
// index.html is otherwise a static file; this swaps just the <head>
// tags the "SEO & Tags" admin panel controls, falling back to the
// file's own hardcoded values when a field hasn't been set.
function escAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const indexHtmlPath = path.join(__dirname, '../public/index.html');
app.get('/', async (req, res) => {
  try {
    const content = await Content.getSingleton();
    const seo = content.seo || {};
    let html = fs.readFileSync(indexHtmlPath, 'utf8');

    if (seo.title) {
      html = html.replace(/<title>[^<]*<\/title>/, '<title>' + escAttr(seo.title) + '</title>');
      html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + escAttr(seo.title) + '$2');
    }
    if (seo.description) {
      html = html.replace(/(<meta name="description" content=")[^"]*(")/, '$1' + escAttr(seo.description) + '$2');
      html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + escAttr(seo.description) + '$2');
    }
    if (seo.canonical) {
      html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, '$1' + escAttr(seo.canonical) + '$2');
    }
    if (seo.keywords) {
      html = /<meta name="keywords"/.test(html)
        ? html.replace(/(<meta name="keywords" content=")[^"]*(")/, '$1' + escAttr(seo.keywords) + '$2')
        : html.replace('<meta property="og:type"', '<meta name="keywords" content="' + escAttr(seo.keywords) + '" />\n  <meta property="og:type"');
    }
    if (seo.ogImage) {
      html = /<meta property="og:image"/.test(html)
        ? html.replace(/(<meta property="og:image" content=")[^"]*(")/, '$1' + escAttr(seo.ogImage) + '$2')
        : html.replace('<meta property="og:type"', '<meta property="og:image" content="' + escAttr(seo.ogImage) + '" />\n  <meta property="og:type"');
    }

    res.set('Content-Type', 'text/html').send(html);
  } catch (e) {
    res.sendFile(indexHtmlPath);
  }
});

// ── Static files ──────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── API routes ────────────────────────────────────────────────
// The old /api/admin Express backend + public/admin/index.html panel were
// removed once the Next.js admin (web-next/app/admin) covered every
// section — see admin_nextjs_migration_phase1 memory.
app.use('/api/content', require('./routes/content'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/blog',    require('./routes/blog'));
app.use('/api/pages',   require('./routes/pages'));

// ── API docs (Swagger UI, generated from route JSDoc) ───────────
const swaggerUi = require('swagger-ui-express');
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(require('./swagger')));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── SPA fallback ──────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Start ─────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
sequelize
  .sync({ alter: true })
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('Nanosoft server running on port ' + PORT);
    });
  })
  .catch(err => {
    console.error('Database sync failed:', err.message);
    process.exit(1);
  });
