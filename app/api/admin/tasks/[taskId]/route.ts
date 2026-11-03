/**
 * Task detail endpoints
 * GET    /api/admin/tasks/[taskId]      — Get task
 * PUT    /api/admin/tasks/[taskId]      — Update task
 * DELETE /api/admin/tasks/[taskId]      — Delete task
 */

import { NextResponse } from "next/server";
import { requireSession, unauthorized, audit } from "@/lib/adminApi";
import { getTask, updateTask, deleteTask } from "@/lib/taskOperations";

export async function GET(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const { taskId } = await params;
    const task = await getTask(taskId);
    return NextResponse.json(task.toJSON());
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const { taskId } = await params;
    const body = await req.json().catch(() => ({}));

    const task = await updateTask(taskId, body);

    // Audit
    const action = body.status === "DONE" ? "completed" : "updated";
    await audit(session, action, "task", taskId, `${action} task: ${task.title}`);

    return NextResponse.json(task.toJSON());
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ taskId: string }> }) {
  const session = await requireSession();
  if (!session) return unauthorized();

  try {
    const { taskId } = await params;
    const task = await getTask(taskId);

    await deleteTask(taskId);

    // Audit
    await audit(session, "delete", "task", taskId, `Deleted task: ${task.title}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = (err as Error).message;
    if (message.includes("not found")) {
      return NextResponse.json({ error: message }, { status: 404 });
    }
    console.error(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
