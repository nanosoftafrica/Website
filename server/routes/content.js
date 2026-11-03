const router          = require('express').Router();
const Content         = require('../models/cms/Content');
const Product         = require('../models/catalog/Product');
const ProductCategory = require('../models/catalog/ProductCategory');
const Team            = require('../models/cms/Team');
const Event           = require('../models/cms/Event');
const Testimonial     = require('../models/cms/Testimonial');
const Post            = require('../models/cms/Post');
const MenuItem        = require('../models/cms/MenuItem');

// GET /api/content  — full public data bundle
router.get('/', async (req, res) => {
  try {
    const [content, categories, products, team, events, testimonials, featuredPosts, menu] = await Promise.all([
      Content.getSingleton(),
      ProductCategory.findAll({ where: { active: true }, order: [['order', 'ASC']] }),
      Product.findAll({
        where: { active: true, lifecycleStatus: ['active', 'pipeline'] },
        order: [['order', 'ASC']],
      }),
      Team.findAll({ where: { active: true }, order: [['order', 'ASC']] }),
      Event.findAll({ where: { active: true }, order: [['order', 'ASC']] }),
      Testimonial.findAll({ where: { active: true }, order: [['order', 'ASC']] }),
      Post.findAll({
        where: { status: 'published' },
        order: [['publishedAt', 'DESC']],
        limit: 3,
        attributes: ['id', 'title', 'slug', 'excerpt', 'coverImage', 'author', 'publishedAt'],
      }),
      MenuItem.findAll({ where: { active: true }, order: [['order', 'ASC']] }),
    ]);

    // Attach products to their category for frontend convenience
    const categoriesWithProducts = categories.map(cat => ({
      ...cat.toJSON(),
      products: products.filter(p => p.categoryId === cat.id || p.category === cat.name),
    }));

    res.json({
      hero:                content.hero,
      company:             content.company,
      services:            content.services,
      clients:             content.clients,
      processSteps:        content.processSteps,
      seo:                 content.seo,
      categories:          categoriesWithProducts,
      products,            // flat list (backward compat)
      team,
      events,
      testimonials,
      featuredPosts,
      menu,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load content' });
  }
});

// GET /api/content/categories  — standalone
router.get('/categories', async (req, res) => {
  try {
    const cats = await ProductCategory.findAll({ where: { active: true }, order: [['order', 'ASC']] });
    res.json(cats);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
