const Tag     = require('./models/cms/Tag');
const PostTag = require('./models/cms/PostTag');

function slugify(name) {
  return String(name || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Resolves an array of tag name strings to Tag rows, creating any that
// don't exist yet. Returns the array of Tag ids.
async function resolveTagNames(names) {
  const clean = [...new Set((names || []).map(n => String(n || '').trim()).filter(Boolean))];
  const ids = [];
  for (const name of clean) {
    const slug = slugify(name);
    if (!slug) continue;
    const [tag] = await Tag.findOrCreate({ where: { slug }, defaults: { name, slug } });
    ids.push(tag.id);
  }
  return ids;
}

// Replaces a post's tag associations with the given tag ids.
async function setPostTags(postId, tagIds) {
  await PostTag.destroy({ where: { postId } });
  if (tagIds.length) {
    await PostTag.bulkCreate(tagIds.map(tagId => ({ postId, tagId })));
  }
}

// Returns { [postId]: [{id,name,slug}, ...] } for a list of post ids.
async function getTagsForPosts(postIds) {
  const map = {};
  if (!postIds.length) return map;
  const links = await PostTag.findAll({ where: { postId: postIds } });
  if (!links.length) return map;
  const tagIds = [...new Set(links.map(l => l.tagId))];
  const tags = await Tag.findAll({ where: { id: tagIds } });
  const tagById = Object.fromEntries(tags.map(t => [t.id, { id: t.id, name: t.name, slug: t.slug }]));
  for (const link of links) {
    if (!map[link.postId]) map[link.postId] = [];
    if (tagById[link.tagId]) map[link.postId].push(tagById[link.tagId]);
  }
  return map;
}

async function getTagsForPost(postId) {
  const map = await getTagsForPosts([postId]);
  return map[postId] || [];
}

module.exports = { slugify, resolveTagNames, setPostTags, getTagsForPosts, getTagsForPost };
