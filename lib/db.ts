// Reuses the EXISTING Sequelize models/connection from the Express app
// (server/) rather than redefining them — same Postgres database, same
// schema, no migration. See squishy-riding-sprout.md plan for why.

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Post = require('../server/models/cms/Post');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Tag = require('../server/models/cms/Tag');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PostTag = require('../server/models/cms/PostTag');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getTagsForPosts, getTagsForPost } = require('../server/tagHelpers');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Product = require('../server/models/catalog/Product');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ProductCategory = require('../server/models/catalog/ProductCategory');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Content = require('../server/models/cms/Content');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Event = require('../server/models/cms/Event');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Testimonial = require('../server/models/cms/Testimonial');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MenuItem = require('../server/models/cms/MenuItem');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CaseStudy = require('../server/models/cms/CaseStudy');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Team = require('../server/models/cms/Team');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Page = require('../server/models/cms/Page');

export interface PostTagRef {
  id: number;
  name: string;
  slug: string;
}

export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string | null;
  author: string;
  publishedAt: string | null;
  createdAt: string;
  tags: PostTagRef[];
}

export interface PostDetail extends PostSummary {
  body: string;
}

export async function listPublishedPosts(tagSlug?: string): Promise<PostSummary[]> {
  const where: Record<string, unknown> = { status: 'published' };
  if (tagSlug) {
    const tag = await Tag.findOne({ where: { slug: tagSlug } });
    if (!tag) return [];
    const links = await PostTag.findAll({ where: { tagId: tag.id } });
    const ids = links.map((l: { postId: number }) => l.postId);
    if (!ids.length) return [];
    where.id = ids;
  }
  const posts = await Post.findAll({
    where,
    order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
    attributes: ['id', 'title', 'slug', 'excerpt', 'coverImage', 'author', 'publishedAt', 'createdAt'],
  });
  const tagsByPost = await getTagsForPosts(posts.map((p: { id: number }) => p.id));
  return posts.map((p: { id: number; toJSON: () => object }) => ({
    ...(p.toJSON() as object),
    tags: tagsByPost[p.id] || [],
  })) as PostSummary[];
}

// Admin preview of a blog post whatever its status, with draft edits laid over it.
export async function getPostForPreview(slug: string): Promise<(PostDetail & { status: string; hasDraft: boolean }) | null> {
  const post = await Post.findOne({ where: { slug } });
  if (!post) return null;
  const p = post.toJSON() as PostDetail & { status: string; draftData?: Record<string, unknown> | null };
  const draft = p.draftData && typeof p.draftData === 'object' ? p.draftData : null;
  const merged = { ...p, ...(draft || {}) } as PostDetail & { status: string };
  return { ...merged, id: p.id, status: p.status, hasDraft: !!draft, tags: await getTagsForPost(post.id) } as PostDetail & { status: string; hasDraft: boolean };
}

export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
  const post = await Post.findOne({ where: { slug, status: 'published' } });
  if (!post) return null;
  return { ...(post.toJSON() as object), tags: await getTagsForPost(post.id) } as PostDetail;
}

// ── Products ──────────────────────────────────────────────────────

export interface ProductBenefit {
  icon: string;
  title: string;
  description: string;
}

export interface ProductSummary {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  category: string;
  categoryId: number | null;
  lifecycleStatus: string;
  slaLevel: string;
  targetAudience: string;
  features: string[];
  benefits: ProductBenefit[];
  color: string;
  bgColor: string;
  image: string | null;
  brochureUrl: string | null;
  clientCount: number;
  order: number;
}

export interface CategoryWithProducts {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  serviceType: 'business' | 'technical' | 'supporting';
  serviceTypeLabel: string;
  color: string;
  order: number;
  products: ProductSummary[];
}

export async function listActiveCategoriesWithProducts(): Promise<CategoryWithProducts[]> {
  const [categories, productRows] = await Promise.all([
    ProductCategory.findAll({ where: { active: true }, order: [['order', 'ASC']] }),
    Product.findAll({
      where: { active: true, lifecycleStatus: ['active', 'pipeline'] },
      order: [['order', 'ASC']],
    }),
  ]);
  // .toJSON() every row — these get passed into Client Components
  // (ProductsTabs) as props, which only accept plain serializable objects,
  // not raw Sequelize model instances.
  const products = productRows.map((p: { toJSON: () => object }) => p.toJSON()) as ProductSummary[];
  return categories.map((cat: { id: number; name: string; toJSON: () => object }) => ({
    ...(cat.toJSON() as object),
    products: products.filter((p: ProductSummary) => p.categoryId === cat.id || p.category === cat.name),
  })) as CategoryWithProducts[];
}

export async function getActiveProductBySlug(slug: string): Promise<ProductSummary | null> {
  const product = await Product.findOne({ where: { slug, active: true } });
  if (!product) return null;
  return product.toJSON() as ProductSummary;
}

// ── Case studies ─────────────────────────────────────────────────

export interface CaseStudySummary {
  id: number;
  title: string;
  slug: string;
  client: string;
  industry: string;
  location: string;
  summary: string;
  heroImage: string | null;
  color: string;
  bgColor: string;
  order: number;
}

export interface CaseStudyDetail extends CaseStudySummary {
  challenge: string;
  solution: string;
  outcome: string;
  servicesUsed: string[];
}

export async function listActiveCaseStudies(): Promise<CaseStudySummary[]> {
  const rows = await CaseStudy.findAll({ where: { active: true }, order: [['order', 'ASC']] });
  return rows.map((r: { toJSON: () => object }) => r.toJSON()) as CaseStudySummary[];
}

export async function getActiveCaseStudyBySlug(slug: string): Promise<CaseStudyDetail | null> {
  const caseStudy = await CaseStudy.findOne({ where: { slug, active: true } });
  if (!caseStudy) return null;
  return caseStudy.toJSON() as CaseStudyDetail;
}

// ── Site content (Content singleton, Events, Testimonials, Menu) ───

export interface Company {
  logo: string;
  name: string;
  tagline: string;
  about: string;
  aboutImage: string | null;
  mission: string;
  vision: string;
  values: string[];
  foundedYear: number | null;
  businessesServed: string;
  teamSize: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  facebook: string;
  linkedin: string;
  instagram: string;
}

export interface Service {
  icon: string;
  title: string;
  description: string;
  solve: string;
  image?: string | null;
  order: number;
}

export interface Client {
  name: string;
  logo: string;
  info: string;
  order: number;
}

export interface ProcessStep {
  number: string;
  icon: string;
  title: string;
  description: string;
  image?: string | null;
  order: number;
}

export interface Seo {
  title: string;
  description: string;
  canonical: string;
  keywords: string;
  ogImage: string;
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
}

export interface HeroContent {
  bannerImage?: string;
  eyebrow?: string;
  headlineMain?: string;
  headlineEmphasis?: string;
  subhead?: string;
  ctaPrimaryLabel?: string;
  ctaSecondaryLabel?: string;
}

// Every homepage section follows the same eyebrow/heading/subhead shape so
// the admin editor and components can treat them uniformly instead of each
// section inventing its own field names.
export interface SectionHeader {
  label?: string;
  heading?: string;
  subhead?: string;
}

export interface DemoSection extends SectionHeader {
  checklist?: string[];
  formHeading?: string;
  submitLabel?: string;
  successMessage?: string;
  errorMessage?: string;
}

export interface FooterSection {
  tagline?: string;
  productsHeading?: string;
  companyHeading?: string;
}

export interface Sections {
  clients?: SectionHeader;
  testimonials?: SectionHeader;
  about?: SectionHeader;
  pain?: SectionHeader;
  products?: SectionHeader;
  how?: SectionHeader;
  insights?: SectionHeader;
  demo?: DemoSection;
  footer?: FooterSection;
}

export interface SiteContent {
  hero: HeroContent;
  company: Company;
  services: Service[];
  clients: Client[];
  processSteps: ProcessStep[];
  seo: Seo;
  sections: Sections;
}

export async function getSiteContent(): Promise<SiteContent> {
  const doc = await Content.getSingleton();
  return {
    hero: doc.hero || {},
    company: doc.company || {},
    services: doc.services || [],
    clients: doc.clients || [],
    processSteps: doc.processSteps || [],
    seo: doc.seo || {},
    sections: doc.sections || {},
  };
}

export interface RoadmapEvent {
  id: number;
  title: string;
  subtitle: string;
  date: string;
  description: string;
  image: string | null;
  type: string;
  order: number;
}

export async function listActiveEvents(): Promise<RoadmapEvent[]> {
  const events = await Event.findAll({ where: { active: true }, order: [['order', 'ASC']] });
  return events.map((e: { toJSON: () => object }) => e.toJSON()) as RoadmapEvent[];
}

export interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
  photo: string | null;
  order: number;
}

export async function listActiveTestimonials(): Promise<TestimonialItem[]> {
  const rows = await Testimonial.findAll({ where: { active: true }, order: [['order', 'ASC']] });
  return rows.map((t: { toJSON: () => object }) => t.toJSON()) as TestimonialItem[];
}

export interface MenuLink {
  id: number;
  label: string;
  href: string;
  order: number;
  newTab: boolean;
}

export async function listActiveMenu(): Promise<MenuLink[]> {
  const rows = await MenuItem.findAll({ where: { active: true }, order: [['order', 'ASC']] });
  return rows.map((m: { toJSON: () => object }) => m.toJSON()) as MenuLink[];
}


// ── Team and custom pages (edited in admin under Website) ───────────

export interface TeamMember {
  id: number;
  name: string;
  role: string | null;
  initials: string | null;
  gradient: string | null;
  bio: string;
  photo: string | null;
  order: number;
}

export async function listActiveTeam(): Promise<TeamMember[]> {
  const rows = await Team.findAll({ where: { active: true }, order: [['order', 'ASC'], ['id', 'ASC']] });
  return rows.map((r: { toJSON: () => object }) => r.toJSON()) as TeamMember[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PageBlock {
  type: string;
  [key: string]: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface PageDetail {
  id: number;
  title: string;
  slug: string;
  blocks: PageBlock[];
  seoTitle: string;
  seoDescription: string;
  ogImage: string | null;
}

// Admin preview: the page at this address whatever its status, with any
// unpublished draft edits laid over it. Only called for a signed-in admin.
export async function getPageForPreview(slug: string): Promise<(PageDetail & { status: string; hasDraft: boolean }) | null> {
  const row = await Page.findOne({ where: { slug } });
  if (!row) return null;
  const p = row.toJSON() as PageDetail & { status: string; draftData?: Record<string, unknown> | null };
  const draft = p.draftData && typeof p.draftData === 'object' ? p.draftData : null;
  const merged = { ...p, ...(draft || {}) } as PageDetail & { status: string };
  return { ...merged, id: p.id, status: p.status, hasDraft: !!draft, blocks: Array.isArray(merged.blocks) ? merged.blocks : [] };
}

export async function getPublishedPageBySlug(slug: string): Promise<PageDetail | null> {
  const row = await Page.findOne({ where: { slug, status: 'published' } });
  if (!row) return null;
  const p = row.toJSON() as PageDetail;
  return { ...p, blocks: Array.isArray(p.blocks) ? p.blocks : [] };
}
