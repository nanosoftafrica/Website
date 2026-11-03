const { z } = require('zod');

// ── Middleware ──────────────────────────────────────────────────
// Validates req.body against a Zod schema; on success replaces req.body
// with the parsed (defaulted/coerced) data, on failure returns a 400.
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const message = result.error.issues
        .map(i => (i.path.length ? i.path.join('.') + ': ' : '') + i.message)
        .join('; ');
      return res.status(400).json({ error: message });
    }
    req.body = result.data;
    next();
  };
}

// ── Tags ────────────────────────────────────────────────────────
const tagSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
});

// ── Comments ────────────────────────────────────────────────────
const commentSchema = z.object({
  name:     z.string().trim().min(1, 'Name is required').max(100),
  email:    z.string().trim().email('Valid email is required').max(200),
  body:     z.string().trim().min(1, 'Comment cannot be empty').max(3000),
  website:  z.string().max(0, 'Spam detected').optional().default(''), // honeypot — must stay empty
});

// ── Menu items ──────────────────────────────────────────────────
const menuItemSchema = z.object({
  label:  z.string().trim().min(1, 'Label is required').max(60),
  href:   z.string().trim().min(1, 'Link is required').max(300),
  order:  z.number().int().optional().default(0),
  newTab: z.boolean().optional().default(false),
  active: z.boolean().optional().default(true),
});

// ── Pages / blocks ──────────────────────────────────────────────
const heroBlockSchema = z.object({
  type:       z.literal('hero'),
  heading:    z.string().trim().min(1, 'Heading is required').max(200),
  subheading: z.string().trim().max(400).optional().default(''),
  ctaText:    z.string().trim().max(60).optional().default(''),
  ctaHref:    z.string().trim().max(300).optional().default(''),
  image:      z.string().trim().max(500).nullable().optional().default(null),
});

const richtextBlockSchema = z.object({
  type: z.literal('richtext'),
  html: z.string().max(50000).optional().default(''),
});

const imageBlockSchema = z.object({
  type:    z.literal('image'),
  url:     z.string().trim().min(1, 'Image URL is required').max(500),
  caption: z.string().trim().max(300).optional().default(''),
  alt:     z.string().trim().max(200).optional().default(''),
});

const ctaBlockSchema = z.object({
  type:        z.literal('cta'),
  heading:     z.string().trim().min(1, 'Heading is required').max(200),
  text:        z.string().trim().max(400).optional().default(''),
  buttonText:  z.string().trim().max(60).optional().default(''),
  buttonHref:  z.string().trim().max(300).optional().default(''),
});

const pageBlockSchema = z.discriminatedUnion('type', [
  heroBlockSchema, richtextBlockSchema, imageBlockSchema, ctaBlockSchema,
]);

const pageSchema = z.object({
  title:          z.string().trim().min(1, 'Title is required').max(200),
  slug:           z.string().trim().max(200).optional(),
  status:         z.enum(['draft', 'published']).optional().default('draft'),
  seoTitle:       z.string().trim().max(200).optional().default(''),
  seoDescription: z.string().trim().max(300).optional().default(''),
  ogImage:        z.string().trim().max(500).nullable().optional().default(null),
  blocks:         z.array(pageBlockSchema).optional().default([]),
});

// ── CRM: Companies ────────────────────────────────────────────
const companySchema = z.object({
  name:     z.string().trim().min(1, 'Company name is required').max(200),
  domain:   z.string().trim().max(200).optional().default(''),
  industry: z.string().trim().max(100).optional().default(''),
  size:     z.string().trim().max(50).optional().default(''),
  phone:    z.string().trim().max(50).optional().default(''),
  address:  z.string().trim().max(300).optional().default(''),
  website:  z.string().trim().max(300).optional().default(''),
  notes:    z.string().trim().max(5000).optional().default(''),
});

// ── CRM: Contacts ─────────────────────────────────────────────
const contactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName:  z.string().trim().max(100).optional().default(''),
  email:     z.string().trim().email('Valid email is required').max(200),
  phone:     z.string().trim().max(50).optional().default(''),
  jobTitle:  z.string().trim().max(150).optional().default(''),
  companyId: z.number().int().nullable().optional().default(null),
  source:    z.enum(['website_form', 'manual', 'referral', 'import']).optional().default('manual'),
  notes:     z.string().trim().max(5000).optional().default(''),
});

// ── CRM: Deals ────────────────────────────────────────────────
const dealSchema = z.object({
  title:             z.string().trim().min(1, 'Deal title is required').max(200),
  value:             z.number().nonnegative().optional().default(0),
  currency:          z.string().trim().max(10).optional().default('KES'),
  stage:             z.enum(['new', 'contacted', 'qualified', 'won', 'lost']).optional().default('new'),
  contactId:         z.number().int(),
  companyId:         z.number().int().nullable().optional().default(null),
  expectedCloseDate: z.string().trim().max(20).nullable().optional().default(null),
  ownerUsername:     z.string().trim().max(100).optional().default(''),
  order:             z.number().int().optional().default(0),
  notes:             z.string().trim().max(5000).optional().default(''),
});

const dealStageSchema = z.object({
  stage: z.enum(['new', 'contacted', 'qualified', 'won', 'lost']),
  order: z.number().int().optional().default(0),
});

// ── CRM: Activities ───────────────────────────────────────────
const activitySchema = z.object({
  type:      z.enum(['note', 'call', 'email', 'meeting', 'task']),
  subject:   z.string().trim().max(200).optional().default(''),
  body:      z.string().trim().max(5000).optional().default(''),
  contactId: z.number().int().nullable().optional().default(null),
  dealId:    z.number().int().nullable().optional().default(null),
  companyId: z.number().int().nullable().optional().default(null),
  dueDate:   z.string().trim().max(20).nullable().optional().default(null),
  completed: z.boolean().optional().default(false),
});

// ── Fulfillment: Suppliers ──────────────────────────────────────
const supplierSchema = z.object({
  name:        z.string().trim().min(1, 'Supplier name is required').max(200),
  contactName: z.string().trim().max(150).optional().default(''),
  email:       z.string().trim().max(200).optional().default(''),
  phone:       z.string().trim().max(50).optional().default(''),
  specialty:   z.string().trim().max(200).optional().default(''),
  address:     z.string().trim().max(300).optional().default(''),
  notes:       z.string().trim().max(5000).optional().default(''),
  active:      z.boolean().optional().default(true),
});

// ── Fulfillment: Technicians ─────────────────────────────────────
const technicianSchema = z.object({
  name:      z.string().trim().min(1, 'Technician name is required').max(200),
  email:     z.string().trim().max(200).optional().default(''),
  phone:     z.string().trim().max(50).optional().default(''),
  specialty: z.string().trim().max(200).optional().default(''),
  notes:     z.string().trim().max(5000).optional().default(''),
  active:    z.boolean().optional().default(true),
});

// ── Fulfillment: Work Orders ──────────────────────────────────────
const WORK_ORDER_STAGES = ['new', 'sourcing', 'supplier_ordered', 'delivered', 'installation', 'done', 'cancelled'];

const workOrderSchema = z.object({
  title:         z.string().trim().min(1, 'Work order title is required').max(200),
  description:   z.string().trim().max(5000).optional().default(''),
  contactId:     z.number().int(),
  companyId:     z.number().int().nullable().optional().default(null),
  dealId:        z.number().int().nullable().optional().default(null),
  stage:         z.enum(WORK_ORDER_STAGES).optional().default('new'),
  value:         z.number().nonnegative().optional().default(0),
  expectedDate:  z.string().trim().max(20).nullable().optional().default(null),
  ownerUsername: z.string().trim().max(100).optional().default(''),
  order:         z.number().int().optional().default(0),
  notes:         z.string().trim().max(5000).optional().default(''),
});

const workOrderStageSchema = z.object({
  stage: z.enum(WORK_ORDER_STAGES),
  order: z.number().int().optional().default(0),
});

// ── Fulfillment: Assignments ──────────────────────────────────────
const assignmentSchema = z.object({
  workOrderId:  z.number().int(),
  assigneeType: z.enum(['supplier', 'technician']),
  assigneeId:   z.number().int(),
  notes:        z.string().trim().max(2000).optional().default(''),
});

const assignmentStatusSchema = z.object({
  status: z.enum(['assigned', 'acknowledged', 'declined', 'completed']),
});

module.exports = {
  validate,
  tagSchema,
  commentSchema,
  menuItemSchema,
  pageSchema,
  pageBlockSchema,
  companySchema,
  contactSchema,
  dealSchema,
  dealStageSchema,
  activitySchema,
  supplierSchema,
  technicianSchema,
  workOrderSchema,
  workOrderStageSchema,
  assignmentSchema,
  assignmentStatusSchema,
};
