/**
 * Task CRUD endpoints
 * GET    /api/admin/tasks                 — List tasks (with filters)
 * POST   /api/admin/tasks                 — Create task
 * GET    /api/admin/tasks?recordId=...    — Get tasks for a specific record
 */

import { NextResponse } from "next/server";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { createTask, listAllTasks, getTasksForRecord } from "@/lib/taskOperations";

export async function GET(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const url = new URL(req.url);
    const recordId = url.searchParams.get("recordId");
    const status = url.searchParams.get("status");
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    if (recordId) {
      // Get tasks for a specific record
      const tasks = await getTasksForRecord(recordId);
      return NextResponse.json({
        tasks: tasks.map((t: any) => t.toJSON()),
        count: tasks.length,
      });
    }

    // List all tasks
    const { rows, count } = await listAllTasks({
      limit,
      offset,
      status: status || undefined,
      assignedToUserId: session.id,
    });

    return NextResponse.json({
      tasks: rows.map((t: any) => t.toJSON()),
      pagination: { limit, offset, total: count },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const body = await req.json().catch(() => ({}));

    if (!body.title) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const task = await createTask({
      ...body,
      created_by_user_id: session.id,
    });

    // Audit
    await audit(
      session,
      "create",
      "task",
      task.id,
      `Created task: ${task.title}` +
        (body.record_id ? ` (linked to record ${body.record_id})` : "")
    );

    return NextResponse.json(task.toJSON(), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
