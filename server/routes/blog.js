const router       = require('express').Router();
const rateLimit    = require('express-rate-limit');
const Post         = require('../models/cms/Post');
const Tag          = require('../models/cms/Tag');
const PostTag      = require('../models/cms/PostTag');
const Comment      = require('../models/cms/Comment');
const PostReaction = require('../models/cms/PostReaction');
const { Op }       = require('sequelize');
const { getTagsForPosts, getTagsForPost } = require('../tagHelpers');
const { validate, commentSchema } = require('../validation');

const REACTION_TYPES = ['like', 'love', 'insightful', 'celebrate'];

const commentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many comments submitted. Please try again later.' },
});

const reactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reactions. Please try again later.' },
});

/**
 * @openapi
 * /api/blog:
 *   get:
 *     summary: List published blog posts, newest first
 *     parameters:
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *         description: Filter to posts with this tag slug
 *     responses:
 *       200: { description: Array of posts }
 */
router.get('/', async (req, res) => {
  try {
    const where = { status: 'published' };
    if (req.query.tag) {
      const tag = await Tag.findOne({ where: { slug: req.query.tag } });
      if (!tag) return res.json([]);
      const links = await PostTag.findAll({ where: { tagId: tag.id } });
      const ids = links.map(l => l.postId);
      if (!ids.length) return res.json([]);
      where.id = ids;
    }
    const posts = await Post.findAll({
      where,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      attributes: ['id','title','slug','excerpt','coverImage','author','publishedAt','createdAt'],
    });
    const tagsByPost = await getTagsForPosts(posts.map(p => p.id));
    res.json(posts.map(p => ({ ...p.toJSON(), tags: tagsByPost[p.id] || [] })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/blog/:slug
router.get('/:slug', async (req, res) => {
  try {
    const post = await Post.findOne({ where: { slug: req.params.slug, status: 'published' } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ ...post.toJSON(), tags: await getTagsForPost(post.id) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Comments ──────────────────────────────────────────────────

/**
 * @openapi
 * /api/blog/{slug}/comments:
 *   get:
 *     summary: List approved comments for a post
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Array of approved comments }
 *   post:
 *     summary: Submit a comment (goes to pending, awaiting admin approval)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:  { type: string }
 *               email: { type: string }
 *               body:  { type: string }
 *               website: { type: string, description: "Honeypot — must be left empty" }
 *             required: [name, email, body]
 *     responses:
 *       201: { description: Comment submitted, pending approval }
 *       400: { description: Validation failed }
 *       404: { description: Post not found }
 */
router.get('/:slug/comments', async (req, res) => {
  try {
    const post = await Post.findOne({ where: { slug: req.params.slug, status: 'published' } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comments = await Comment.findAll({
      where: { postId: post.id, status: 'approved' },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'name', 'body', 'createdAt'],
    });
    res.json(comments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:slug/comments', commentLimiter, validate(commentSchema), async (req, res) => {
  try {
    const post = await Post.findOne({ where: { slug: req.params.slug, status: 'published' } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const comment = await Comment.create({
      postId: post.id,
      name:   req.body.name,
      email:  req.body.email,
      body:   req.body.body,
      status: 'pending',
    });
    res.status(201).json({ ok: true, id: comment.id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Reactions ─────────────────────────────────────────────────

async function reactionSummary(postId, clientId) {
  const rows = await PostReaction.findAll({ where: { postId } });
  const counts = Object.fromEntries(REACTION_TYPES.map(t => [t, 0]));
  const mine = [];
  for (const r of rows) {
    counts[r.type] = (counts[r.type] || 0) + 1;
    if (clientId && r.clientId === clientId) mine.push(r.type);
  }
  return { counts, mine };
}

/**
 * @openapi
 * /api/blog/{slug}/reactions:
 *   get:
 *     summary: Get reaction counts for a post
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: clientId
 *         schema: { type: string }
 *         description: Anonymous client id (from localStorage) to report which reactions this visitor already made
 *     responses:
 *       200: { description: "{ counts: {like,love,insightful,celebrate}, mine: [] }" }
 *   post:
 *     summary: Toggle a reaction (adds it if new, removes it if already reacted)
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId: { type: string }
 *               type: { type: string, enum: [like, love, insightful, celebrate] }
 *             required: [clientId, type]
 *     responses:
 *       200: { description: Updated counts + mine }
 */
router.get('/:slug/reactions', async (req, res) => {
  try {
    const post = await Post.findOne({ where: { slug: req.params.slug, status: 'published' } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(await reactionSummary(post.id, req.query.clientId));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:slug/reactions', reactionLimiter, async (req, res) => {
  try {
    const { clientId, type } = req.body || {};
    if (!clientId || !REACTION_TYPES.includes(type)) {
      return res.status(400).json({ error: 'clientId and a valid type are required' });
    }
    const post = await Post.findOne({ where: { slug: req.params.slug, status: 'published' } });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const existing = await PostReaction.findOne({ where: { postId: post.id, clientId, type } });
    if (existing) await existing.destroy();
    else await PostReaction.create({ postId: post.id, clientId, type });
    res.json(await reactionSummary(post.id, clientId));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
