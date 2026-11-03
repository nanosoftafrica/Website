const router = require('express').Router();
const Page   = require('../models/cms/Page');

/**
 * @openapi
 * /api/pages/{slug}:
 *   get:
 *     summary: Get a published page by slug, with its content blocks
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: The page }
 *       404: { description: Page not found }
 */
router.get('/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ where: { slug: req.params.slug, status: 'published' } });
    if (!page) return res.status(404).json({ error: 'Page not found' });
    res.json(page);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
