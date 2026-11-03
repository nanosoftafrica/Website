// Reuses the EXISTING Sequelize models from the Express app (server/) —
// same pattern as lib/db.ts — for the admin panel's data + auth layer.

/* eslint-disable @typescript-eslint/no-var-requires */
export const Admin = require('../server/models/platform/Admin');
export const AuditLog = require('../server/models/platform/AuditLog');
export const Company = require('../server/models/crm/Company');
export const Contact = require('../server/models/crm/Contact');
export const Deal = require('../server/models/crm/Deal');
export const Activity = require('../server/models/crm/Activity');
export const Supplier = require('../server/models/fulfillment/Supplier');
export const Technician = require('../server/models/fulfillment/Technician');
export const ServiceRequest = require('../server/models/fulfillment/ServiceRequest');
export const Incident = require('../server/models/fulfillment/Incident');
export const Assignment = require('../server/models/fulfillment/Assignment');
export const ClientDevice = require('../server/models/fulfillment/ClientDevice');
export const MaintenanceLog = require('../server/models/fulfillment/MaintenanceLog');
export const Tag = require('../server/models/cms/Tag');
export const PostTag = require('../server/models/cms/PostTag');
export const Product = require('../server/models/catalog/Product');
export const ProductCategory = require('../server/models/catalog/ProductCategory');
export const Team = require('../server/models/cms/Team');
export const Event = require('../server/models/cms/Event');
export const MenuItem = require('../server/models/cms/MenuItem');
export const Testimonial = require('../server/models/cms/Testimonial');
export const CaseStudy = require('../server/models/cms/CaseStudy');
export const Content = require('../server/models/cms/Content');
export const Page = require('../server/models/cms/Page');
export const Post = require('../server/models/cms/Post');
export const Message = require('../server/models/crm/Message');
export const Comment = require('../server/models/cms/Comment');
export const Subscriber = require('../server/models/cms/Subscriber');
export const PageView = require('../server/models/cms/PageView');
export const PostReaction = require('../server/models/cms/PostReaction');
export const ObjectMetadata = require('../server/models/platform/ObjectMetadata');
export const FieldMetadata = require('../server/models/platform/FieldMetadata');
export const Record = require('../server/models/platform/Record');
export const Task = require('../server/models/platform/Task');
export const Note = require('../server/models/platform/Note');
export const TaskReminder = require('../server/models/platform/TaskReminder');
export const WhatsAppMessage = require('../server/models/crm/WhatsAppMessage');
export const SystemIntegration = require('../server/models/platform/SystemIntegration');
export const { resolveTagNames, setPostTags, getTagsForPosts, getTagsForPost, slugify } = require('../server/tagHelpers');
/* eslint-enable @typescript-eslint/no-var-requires */
