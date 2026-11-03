// Read-only data for admin Server Components' initial render — direct DB
// reads via the shared Sequelize models, same pattern as lib/db.ts. The
// Route Handlers under app/api/admin/* do the actual mutations and are
// what Client Components call after the initial load.

import {
  Company,
  Supplier,
  Technician,
  Tag,
  Deal,
  ServiceRequest,
  Incident,
  Assignment,
  ClientDevice,
  MaintenanceLog,
  Contact,
  Product,
  ProductCategory,
  Team,
  Event,
  MenuItem,
  Testimonial,
  CaseStudy,
  Activity,
  Post,
  Page,
  Message,
  Comment,
  Subscriber,
  AuditLog,
  PageView,
  PostReaction,
  WhatsAppMessage,
  getTagsForPosts,
  getTagsForPost,
} from "./serverModels";
import { SERVICE_REQUEST_STAGES, INCIDENT_STATUSES } from "./ticketStages";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function listCompanies() {
  const rows = await Company.findAll({ order: [["name", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listSuppliers() {
  const rows = await Supplier.findAll({ order: [["name", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listTechnicians() {
  const rows = await Technician.findAll({ order: [["name", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listTags() {
  const rows = await Tag.findAll({ order: [["name", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listContactsLite() {
  const rows = await Contact.findAll({
    order: [["firstName", "ASC"]],
    attributes: ["id", "firstName", "lastName", "companyId", "phone"],
  });
  return rows.map((c: any) => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`.trim(),
    companyId: c.companyId,
    phone: c.phone || "",
  }));
}

const DEAL_STAGES = ["new", "contacted", "qualified", "won", "lost"];

export async function getDealsBoard() {
  const deals = await Deal.findAll({ order: [["order", "ASC"]] });
  const contactIds = [...new Set(deals.map((d: any) => d.contactId).filter(Boolean))];
  const companyIds = [...new Set(deals.map((d: any) => d.companyId).filter(Boolean))];
  const [contacts, companies] = await Promise.all([
    Contact.findAll({ where: { id: contactIds } }),
    Company.findAll({ where: { id: companyIds } }),
  ]);
  const contactById = Object.fromEntries(contacts.map((c: any) => [c.id, `${c.firstName} ${c.lastName}`.trim()]));
  const companyById = Object.fromEntries(companies.map((c: any) => [c.id, c.name]));
  const enriched = deals.map((d: any) => ({
    ...d.toJSON(),
    contactName: contactById[d.contactId] || "",
    companyName: (d.companyId && companyById[d.companyId]) || null,
  }));
  const board: Record<string, any[]> = {};
  DEAL_STAGES.forEach((s) => {
    board[s] = enriched.filter((d: any) => d.stage === s);
  });
  return board;
}

export async function getServiceRequestsBoard() {
  const orders = await ServiceRequest.findAll({ order: [["order", "ASC"]] });
  const contactIds = [...new Set(orders.map((o: any) => o.contactId).filter(Boolean))];
  const companyIds = [...new Set(orders.map((o: any) => o.companyId).filter(Boolean))];
  const [contacts, companies] = await Promise.all([
    Contact.findAll({ where: { id: contactIds } }),
    Company.findAll({ where: { id: companyIds } }),
  ]);
  const contactById = Object.fromEntries(contacts.map((c: any) => [c.id, `${c.firstName} ${c.lastName}`.trim()]));
  const companyById = Object.fromEntries(companies.map((c: any) => [c.id, c.name]));
  const enriched = orders.map((o: any) => ({
    ...o.toJSON(),
    contactName: contactById[o.contactId] || "",
    companyName: (o.companyId && companyById[o.companyId]) || null,
  }));
  const board: Record<string, any[]> = {};
  SERVICE_REQUEST_STAGES.forEach((s) => {
    board[s] = enriched.filter((o: any) => o.stage === s);
  });
  return board;
}

export async function getIncidentsBoard() {
  const incidents = await Incident.findAll({ order: [["order", "ASC"]] });
  const contactIds = [...new Set(incidents.map((i: any) => i.contactId).filter(Boolean))];
  const companyIds = [...new Set(incidents.map((i: any) => i.companyId).filter(Boolean))];
  const [contacts, companies] = await Promise.all([
    Contact.findAll({ where: { id: contactIds } }),
    Company.findAll({ where: { id: companyIds } }),
  ]);
  const contactById = Object.fromEntries(contacts.map((c: any) => [c.id, `${c.firstName} ${c.lastName}`.trim()]));
  const companyById = Object.fromEntries(companies.map((c: any) => [c.id, c.name]));
  const enriched = incidents.map((i: any) => ({
    ...i.toJSON(),
    contactName: contactById[i.contactId] || "",
    companyName: (i.companyId && companyById[i.companyId]) || null,
  }));
  const board: Record<string, any[]> = {};
  INCIDENT_STATUSES.forEach((s) => {
    board[s] = enriched.filter((i: any) => i.status === s);
  });
  return board;
}

export async function listAssignmentsForTicket(ticketType: "service_request" | "incident", ticketId: string | number) {
  const assignments = await Assignment.findAll({ where: { ticketType, ticketId }, order: [["assignedAt", "DESC"]] });
  const supplierIds = assignments.filter((a: any) => a.assigneeType === "supplier").map((a: any) => a.assigneeId);
  const technicianIds = assignments.filter((a: any) => a.assigneeType === "technician").map((a: any) => a.assigneeId);
  const [suppliers, technicians] = await Promise.all([
    Supplier.findAll({ where: { id: supplierIds } }),
    Technician.findAll({ where: { id: technicianIds } }),
  ]);
  const supplierById = Object.fromEntries(suppliers.map((s: any) => [s.id, s.name]));
  const technicianById = Object.fromEntries(technicians.map((t: any) => [t.id, t.name]));
  return assignments.map((a: any) => ({
    ...a.toJSON(),
    assigneeName: a.assigneeType === "supplier" ? supplierById[a.assigneeId] || "" : technicianById[a.assigneeId] || "",
  }));
}

export async function listAllProducts() {
  const rows = await Product.findAll({ order: [["order", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listAllCategories() {
  const rows = await ProductCategory.findAll({ order: [["order", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listAllTeam() {
  const rows = await Team.findAll({ order: [["order", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listAllEvents() {
  const rows = await Event.findAll({ order: [["order", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listAllMenu() {
  const rows = await MenuItem.findAll({ order: [["order", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listAllTestimonials() {
  const rows = await Testimonial.findAll({ order: [["order", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listAllCaseStudies() {
  const rows = await CaseStudy.findAll({ order: [["order", "ASC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function getContactDetail(id: string | number) {
  const contact = await Contact.findByPk(id);
  if (!contact) return null;
  const [company, deals, activities] = await Promise.all([
    contact.companyId ? Company.findByPk(contact.companyId) : null,
    Deal.findAll({ where: { contactId: contact.id }, order: [["createdAt", "DESC"]] }),
    Activity.findAll({ where: { contactId: contact.id }, order: [["createdAt", "DESC"]] }),
  ]);
  return {
    ...contact.toJSON(),
    company: company ? company.toJSON() : null,
    deals: deals.map((d: any) => d.toJSON()),
    activities: activities.map((a: any) => a.toJSON()),
  };
}

export async function listContactsFull() {
  const contacts = await Contact.findAll({ order: [["createdAt", "DESC"]] });
  const companyIds = [...new Set(contacts.map((c: any) => c.companyId).filter(Boolean))];
  const companies = await Company.findAll({ where: { id: companyIds } });
  const companyById = Object.fromEntries(companies.map((c: any) => [c.id, c.name]));
  return contacts.map((c: any) => ({ ...c.toJSON(), companyName: companyById[c.companyId] || null }));
}

export async function listAllPostsWithTags() {
  const posts = await Post.findAll({ order: [["createdAt", "DESC"]] });
  const tagsByPost = await getTagsForPosts(posts.map((p: any) => p.id));
  return posts.map((p: any) => ({ ...p.toJSON(), tags: tagsByPost[p.id] || [] }));
}

export async function getPostById(id: string | number) {
  const post = await Post.findByPk(id);
  if (!post) return null;
  return { ...post.toJSON(), tags: await getTagsForPost(post.id) };
}

export async function listAllPages() {
  const rows = await Page.findAll({ order: [["updatedAt", "DESC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function getPageById(id: string | number) {
  const page = await Page.findByPk(id);
  return page ? page.toJSON() : null;
}

export async function listMessages() {
  const rows = await Message.findAll({ order: [["createdAt", "DESC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listComments(status?: string) {
  const where = status ? { status } : {};
  const comments = await Comment.findAll({ where, order: [["createdAt", "DESC"]] });
  const postIds = [...new Set(comments.map((c: any) => c.postId))];
  const posts = await Post.findAll({ where: { id: postIds }, attributes: ["id", "title", "slug"] });
  const postById = Object.fromEntries(posts.map((p: any) => [p.id, { title: p.title, slug: p.slug }]));
  return comments.map((c: any) => ({ ...c.toJSON(), post: postById[c.postId] || null }));
}

export async function listSubscribers() {
  const rows = await Subscriber.findAll({ order: [["createdAt", "DESC"]] });
  return rows.map((r: any) => r.toJSON());
}

export async function listAuditLog() {
  const rows = await AuditLog.findAll({ order: [["createdAt", "DESC"]], limit: 200 });
  return rows.map((r: any) => r.toJSON());
}

export async function getAnalytics(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];
  const { Op } = await import("sequelize");
  const [pageViews, totalMessages, totalSubscribers, totalPosts, reactionRows] = await Promise.all([
    PageView.findAll({ where: { date: { [Op.gte]: sinceStr } }, order: [["date", "ASC"]] }),
    Message.count(),
    Subscriber.count({ where: { active: true } }),
    Post.count({ where: { status: "published" } }),
    PostReaction.findAll({ attributes: ["type"] }),
  ]);
  const reactionTotals: Record<string, number> = { like: 0, love: 0, insightful: 0, celebrate: 0 };
  reactionRows.forEach((r: any) => {
    reactionTotals[r.type] = (reactionTotals[r.type] || 0) + 1;
  });
  return {
    pageViews: pageViews.map((p: any) => p.toJSON()),
    totalMessages,
    totalSubscribers,
    totalPosts,
    reactionTotals,
  };
}

export async function listAdminUsers() {
  const { Admin } = await import("./serverModels");
  const rows = await Admin.findAll({ attributes: ["id", "username", "role", "createdAt"] });
  return rows.map((r: any) => r.toJSON());
}

export interface DashboardStats {
  companies: number;
  suppliers: number;
  technicians: number;
  deals: number;
  serviceRequests: number;
  incidents: number;
  openIncidents: number;
  openDealsValue: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [companies, suppliers, technicians, deals, serviceRequests, incidentStatuses] = await Promise.all([
    Company.count(),
    Supplier.count(),
    Technician.count(),
    Deal.findAll({ attributes: ["value", "stage"] }),
    ServiceRequest.count(),
    Incident.findAll({ attributes: ["status"] }),
  ]);
  const openDealsValue = (deals as any[])
    .filter((d) => d.stage !== "won" && d.stage !== "lost")
    .reduce((sum, d) => sum + Number(d.value || 0), 0);
  const openIncidents = (incidentStatuses as any[]).filter(
    (i) => i.status !== "resolved" && i.status !== "closed"
  ).length;
  return {
    companies,
    suppliers,
    technicians,
    deals: (deals as any[]).length,
    serviceRequests,
    incidents: (incidentStatuses as any[]).length,
    openIncidents,
    openDealsValue,
  };
}

export interface EnrichedDashboardData extends DashboardStats {
  contacts: number;
  wonDealsValue: number;
  dealStages: Record<string, number>;
  incidentPriorities: Record<string, number>;
  serviceRequestStages: Record<string, number>;
  topIncidents: any[];
  topDeals: any[];
  recentMessages: any[];
  recentAuditLogs: any[];
  recentWhatsAppMessages: any[];
}

export async function getEnrichedDashboardData(): Promise<EnrichedDashboardData> {
  const activeIncidentWhere = { status: ["new", "in_progress", "on_hold"] };
  const openDealWhere = { stage: ["new", "contacted", "qualified"] };
  const [
    companies,
    suppliers,
    technicians,
    contacts,
    dealGroups,
    incidentGroups,
    serviceRequestGroups,
    topIncidents,
    topDeals,
    recentMessages,
    recentAuditLogs,
    recentWhatsApp,
  ] = await Promise.all([
    Company.count(),
    Supplier.count(),
    Technician.count(),
    Contact.count(),
    Deal.findAll({
      attributes: [
        "stage",
        [Deal.sequelize.fn("COUNT", Deal.sequelize.col("id")), "count"],
        [Deal.sequelize.fn("SUM", Deal.sequelize.col("value")), "totalValue"],
      ],
      group: ["stage"],
      raw: true,
    }),
    Incident.findAll({
      attributes: [
        "status",
        "priority",
        [Incident.sequelize.fn("COUNT", Incident.sequelize.col("id")), "count"],
      ],
      group: ["status", "priority"],
      raw: true,
    }),
    ServiceRequest.findAll({
      attributes: [
        "stage",
        [ServiceRequest.sequelize.fn("COUNT", ServiceRequest.sequelize.literal("*")), "count"],
      ],
      group: ["stage"],
      raw: true,
    }),
    Incident.findAll({
      where: activeIncidentWhere,
      attributes: ["id", "title", "priority", "status", "severity"],
      order: [["createdAt", "DESC"]],
      limit: 4,
    }),
    Deal.findAll({
      where: openDealWhere,
      attributes: ["id", "title", "stage", "value"],
      order: [["value", "DESC"]],
      limit: 4,
    }),
    Message.findAll({ order: [["createdAt", "DESC"]], limit: 5 }),
    AuditLog.findAll({ order: [["createdAt", "DESC"]], limit: 6 }),
    WhatsAppMessage.findAll({ order: [["created_at", "DESC"]], limit: 5 }).catch(() => []),
  ]);

  const dealStages: Record<string, number> = { new: 0, contacted: 0, qualified: 0, won: 0, lost: 0 };
  let deals = 0;
  let openDealsValue = 0;
  let wonDealsValue = 0;
  (dealGroups as any[]).forEach((group) => {
    const count = Number(group.count || 0);
    const totalValue = Number(group.totalValue || 0);
    deals += count;
    dealStages[group.stage] = (dealStages[group.stage] || 0) + count;
    if (group.stage === "won") wonDealsValue += totalValue;
    else if (group.stage !== "lost") openDealsValue += totalValue;
  });

  const incidentPriorities: Record<string, number> = { p1: 0, p2: 0, p3: 0, p4: 0 };
  let incidents = 0;
  let openIncidents = 0;
  (incidentGroups as any[]).forEach((group) => {
    const count = Number(group.count || 0);
    incidents += count;
    if (group.status !== "resolved" && group.status !== "closed") {
      openIncidents += count;
      incidentPriorities[group.priority] = (incidentPriorities[group.priority] || 0) + count;
    }
  });

  const serviceRequestStages: Record<string, number> = {};
  let serviceRequests = 0;
  (serviceRequestGroups as any[]).forEach((group) => {
    const count = Number(group.count || 0);
    serviceRequests += count;
    serviceRequestStages[group.stage] = (serviceRequestStages[group.stage] || 0) + count;
  });

  return {
    companies,
    suppliers,
    technicians,
    contacts,
    deals,
    serviceRequests,
    incidents,
    openIncidents,
    openDealsValue,
    wonDealsValue,
    dealStages,
    incidentPriorities,
    serviceRequestStages,
    topIncidents: (topIncidents as any[]).map((i) => i.toJSON()),
    topDeals: (topDeals as any[]).map((d) => d.toJSON()),
    recentMessages: (recentMessages as any[]).map((m) => m.toJSON()),
    recentAuditLogs: (recentAuditLogs as any[]).map((a) => a.toJSON()),
    recentWhatsAppMessages: (recentWhatsApp as any[]).map((w) => w.toJSON()),
  };
}

export async function listClientDevices(filters?: { companyId?: number; status?: string }) {
  const where: Record<string, any> = {};
  if (filters?.companyId) where.companyId = filters.companyId;
  if (filters?.status) where.status = filters.status;

  const devices = await ClientDevice.findAll({
    where,
    order: [["createdAt", "DESC"]],
  });

  const companyIds = [...new Set(devices.map((d: any) => d.companyId).filter(Boolean))];
  const technicianIds = [...new Set(devices.map((d: any) => d.installedByTechnicianId).filter(Boolean))];
  const contactIds = [...new Set(devices.map((d: any) => d.contactId).filter(Boolean))];

  const [companies, technicians, contacts] = await Promise.all([
    companyIds.length ? Company.findAll({ where: { id: companyIds } }) : [],
    technicianIds.length ? Technician.findAll({ where: { id: technicianIds } }) : [],
    contactIds.length ? Contact.findAll({ where: { id: contactIds } }) : [],
  ]);

  const companyById = Object.fromEntries(companies.map((c: any) => [c.id, c.name]));
  const techById = Object.fromEntries(technicians.map((t: any) => [t.id, t.name]));
  const contactById = Object.fromEntries(contacts.map((c: any) => [c.id, `${c.firstName} ${c.lastName}`.trim()]));

  return devices.map((d: any) => {
    const raw = d.toJSON();
    return {
      ...raw,
      companyName: companyById[raw.companyId] || "Unknown Client",
      installedByTechnicianName: techById[raw.installedByTechnicianId] || null,
      contactName: contactById[raw.contactId] || null,
    };
  });
}

export async function getClientDeviceDetail(id: number | string) {
  const device = await ClientDevice.findByPk(id);
  if (!device) return null;
  const raw = device.toJSON();

  const [company, technician, contact, logs] = await Promise.all([
    raw.companyId ? Company.findByPk(raw.companyId) : null,
    raw.installedByTechnicianId ? Technician.findByPk(raw.installedByTechnicianId) : null,
    raw.contactId ? Contact.findByPk(raw.contactId) : null,
    MaintenanceLog.findAll({
      where: { deviceId: raw.id },
      order: [["performedAt", "DESC"], ["createdAt", "DESC"]],
    }),
  ]);

  const techIds = [...new Set(logs.map((l: any) => l.technicianId).filter(Boolean))];
  const technicians = techIds.length ? await Technician.findAll({ where: { id: techIds } }) : [];
  const techById = Object.fromEntries(technicians.map((t: any) => [t.id, t.name]));

  const enrichedLogs = logs.map((l: any) => {
    const logRaw = l.toJSON();
    return {
      ...logRaw,
      technicianName: techById[logRaw.technicianId] || "Unassigned",
    };
  });

  return {
    ...raw,
    company: company ? company.toJSON() : null,
    companyName: company ? company.name : "Unknown Client",
    installedByTechnicianName: technician ? technician.name : null,
    contactName: contact ? `${contact.firstName} ${contact.lastName}`.trim() : null,
    maintenanceLogs: enrichedLogs,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
