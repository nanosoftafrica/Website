import { NextResponse } from "next/server";
import { getAdminSession, type AdminSession } from "./adminAuth";
import { AuditLog } from "./serverModels";

export async function requireSession(): Promise<AdminSession | null> {
  return getAdminSession();
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
}

export async function audit(
  session: AdminSession,
  action: string,
  entity: string,
  entityId: string | number,
  summary: string
): Promise<void> {
  try {
    await AuditLog.create({
      adminUsername: session.username,
      action,
      entity,
      entityId: String(entityId || ""),
      summary,
    });
  } catch {
    // audit log failures shouldn't block the mutation
  }
}

interface ReorderableModel {
  update: (values: { order: number }, options: { where: { id: number } }) => Promise<unknown>;
}

// Every reorderable list (Categories, Team, Events, Menu, Testimonials,
// Products) persists drag-reorder the same way: PUT { order: [{id, order}] }.
// One shared handler instead of six copy-pasted route files.
export function createReorderHandler(Model: ReorderableModel) {
  return async function PUT(req: Request) {
    const session = await requireSession();
    if (!session) return unauthorized();
    const body = await req.json().catch(() => ({}));
    if (!Array.isArray(body.order)) {
      return NextResponse.json({ error: "order must be an array" }, { status: 400 });
    }
    await Promise.all(
      body.order.map(({ id, order }: { id: number; order: number }) => Model.update({ order }, { where: { id } }))
    );
    return NextResponse.json({ ok: true });
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any -- these operate on
   whichever plain-object CRUD entity a given admin section manages */

interface SimpleCrudModel {
  create: (body: any) => Promise<any>;
  findByPk: (id: string) => Promise<any | null>;
}

export interface SimpleCrudConfig {
  /** Audit-log entity key, e.g. "company", "team_member". */
  entity: string;
  /** Lowercase human label used in generated audit summaries, e.g. "company". */
  label: string;
  /** Return an error message if the body is invalid, or null if it's fine. */
  validate: (body: any) => string | null;
  /** How to name the item in an audit summary, e.g. (c) => c.name. */
  displayName: (item: any) => string;
}

// The simplest admin sections (Companies, Suppliers, Technicians,
// Categories, Team, Events, Menu, Testimonials, Products) all follow the
// exact same create/update/delete shape — only the required fields, the
// audit entity key, and the display name differ. This factory is that
// shape once, parameterized, instead of 9 near-identical copies of it.
export function createCrudCreateHandler(Model: SimpleCrudModel, cfg: SimpleCrudConfig) {
  return async function POST(req: Request) {
    const session = await requireSession();
    if (!session) return unauthorized();
    const body = await req.json().catch(() => ({}));
    const validationError = cfg.validate(body);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    try {
      const item = await Model.create(body);
      await audit(session, "create", cfg.entity, item.id, `Created ${cfg.label}: ${cfg.displayName(item)}`);
      return NextResponse.json(item, { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
  };
}

export function createCrudItemHandlers(Model: SimpleCrudModel, cfg: SimpleCrudConfig) {
  async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireSession();
    if (!session) return unauthorized();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const validationError = cfg.validate(body);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const item = await Model.findByPk(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    try {
      await item.update(body);
      await audit(session, "update", cfg.entity, item.id, `Updated ${cfg.label}: ${cfg.displayName(item)}`);
      return NextResponse.json(item);
    } catch (err) {
      return NextResponse.json({ error: (err as Error).message }, { status: 400 });
    }
  }

  async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await requireSession();
    if (!session) return unauthorized();
    const { id } = await params;
    const item = await Model.findByPk(id);
    if (item) {
      await audit(session, "delete", cfg.entity, item.id, `Deleted ${cfg.label}: ${cfg.displayName(item)}`);
      await item.destroy();
    }
    return NextResponse.json({ ok: true });
  }

  return { PUT, DELETE };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
