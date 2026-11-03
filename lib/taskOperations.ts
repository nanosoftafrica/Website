/**
 * Task management operations
 * Handles CRUD for tasks linked to records
 */

import { Task } from "@/lib/serverModels";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function createTask(data: {
  title: string;
  description?: string;
  record_id?: string;
  record_object_id?: string;
  assigned_to_user_id?: number;
  due_date?: string;
  due_time?: string;
  created_by_user_id: number;
}): Promise<any> {
  if (!data.title || !data.title.trim()) {
    throw new Error("Task title is required");
  }

  const task = await Task.create({
    title: data.title.trim(),
    description: data.description,
    record_id: data.record_id,
    record_object_id: data.record_object_id,
    assigned_to_user_id: data.assigned_to_user_id,
    due_date: data.due_date,
    due_time: data.due_time,
    created_by_user_id: data.created_by_user_id,
    status: "TODO",
  });

  return task;
}

export async function getTask(taskId: string): Promise<any> {
  const task = await Task.findByPk(taskId);
  if (!task) {
    throw new Error("Task not found");
  }
  return task;
}

export async function updateTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    status?: string;
    assigned_to_user_id?: number;
    due_date?: string;
    due_time?: string;
  }
): Promise<any> {
  const task = await getTask(taskId);

  if (data.title !== undefined) task.title = data.title;
  if (data.description !== undefined) task.description = data.description;
  if (data.status !== undefined) {
    if (!["TODO", "DONE"].includes(data.status)) {
      throw new Error("Invalid status. Must be TODO or DONE");
    }
    task.status = data.status;
    if (data.status === "DONE") {
      task.completed_at = new Date();
    } else {
      task.completed_at = null;
    }
  }
  if (data.assigned_to_user_id !== undefined) task.assigned_to_user_id = data.assigned_to_user_id;
  if (data.due_date !== undefined) task.due_date = data.due_date;
  if (data.due_time !== undefined) task.due_time = data.due_time;

  await task.save();
  return task;
}

export async function deleteTask(taskId: string): Promise<void> {
  const task = await getTask(taskId);
  await task.destroy();
}

export async function getTasksForRecord(recordId: string): Promise<any[]> {
  const tasks = await Task.findAll({
    where: { record_id: recordId },
    order: [["due_date", "ASC"]],
  });
  return tasks;
}

export async function getTasksForUser(userId: number, statusFilter?: string): Promise<any[]> {
  const where: any = { assigned_to_user_id: userId };
  if (statusFilter) {
    where.status = statusFilter;
  }

  const tasks = await Task.findAll({
    where,
    order: [["due_date", "ASC"]],
  });

  return tasks;
}

export async function listAllTasks(options: {
  limit?: number;
  offset?: number;
  status?: string;
  assignedToUserId?: number;
  dueDateFrom?: string;
  dueDateTo?: string;
} = {}): Promise<{ rows: any[]; count: number }> {
  const limit = options.limit || 50;
  const offset = options.offset || 0;

  const where: any = {};
  if (options.status) where.status = options.status;
  if (options.assignedToUserId) where.assigned_to_user_id = options.assignedToUserId;
  if (options.dueDateFrom) where.due_date = { $gte: options.dueDateFrom };
  if (options.dueDateTo) {
    where.due_date = where.due_date || {};
    where.due_date.$lte = options.dueDateTo;
  }

  const { rows, count } = await Task.findAndCountAll({
    where,
    limit,
    offset,
    order: [["due_date", "ASC"]],
  });

  return { rows, count };
}

/**
 * Get tasks that are overdue (past due date, not marked DONE)
 */
export async function getOverdueTasks(): Promise<any[]> {
  const today = new Date().toISOString().split("T")[0];

  const tasks = await Task.findAll({
    where: {
      status: "TODO",
      due_date: {
        $lt: today,
      },
    },
    order: [["due_date", "ASC"]],
  });

  return tasks;
}

/* eslint-enable @typescript-eslint/no-explicit-any */
