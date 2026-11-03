"use client";

import { useState, useEffect } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "DONE";
  due_date?: string;
  assigned_to_user_id?: number;
  created_by_user_id: number;
}

interface TaskPanelProps {
  recordId: string;
  recordObjectId: string;
  onTaskCreated?: () => void;
}

export default function TaskPanel({
  recordId,
  recordObjectId,
  onTaskCreated,
}: TaskPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [error, setError] = useState("");
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [recordId]);

  async function loadTasks() {
    try {
      setError("");
      const res = await fetch(`/api/admin/tasks?recordId=${recordId}`);
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) {
      setError("Task title is required");
      return;
    }

    setAddingTask(true);
    setError("");

    try {
      const res = await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          due_date: newTaskDueDate || null,
          record_id: recordId,
          record_object_id: recordObjectId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create task");
      }

      const newTask = await res.json();
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      setNewTaskDueDate("");
      onTaskCreated?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAddingTask(false);
    }
  }

  async function handleToggleTask(taskId: string, currentStatus: string) {
    setSavingTaskId(taskId);
    setError("");

    try {
      const newStatus = currentStatus === "TODO" ? "DONE" : "TODO";
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update task");

      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingTaskId(null);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm("Delete this task?")) return;

    setSavingTaskId(taskId);
    setError("");

    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete task");

      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingTaskId(null);
    }
  }

  if (loading) {
    return <div className="task-panel-loading">Loading tasks...</div>;
  }

  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  const isOverdue = (dueDate: string | undefined): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const isToday = (dueDate: string | undefined): boolean => {
    if (!dueDate) return false;
    const today = new Date().toISOString().split("T")[0];
    return dueDate === today;
  };

  return (
    <div className="task-panel">
      <div className="task-panel-header">
        <h4>📋 Tasks ({todoTasks.length} todo, {doneTasks.length} done)</h4>
      </div>

      {error && <div className="task-panel-error">{error}</div>}

      {/* Add task form */}
      <form onSubmit={handleAddTask} className="task-add-form">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          disabled={addingTask}
          className="task-input"
        />
        <input
          type="date"
          value={newTaskDueDate}
          onChange={(e) => setNewTaskDueDate(e.target.value)}
          disabled={addingTask}
          className="task-date-input"
        />
        <button
          type="submit"
          disabled={addingTask || !newTaskTitle.trim()}
          className="task-btn task-btn-add"
        >
          {addingTask ? "Adding..." : "+"}
        </button>
      </form>

      {/* Tasks list */}
      <div className="task-list">
        {todoTasks.length === 0 && doneTasks.length === 0 ? (
          <p className="task-empty">No tasks yet. Create one to stay on track!</p>
        ) : (
          <>
            {/* TODO tasks */}
            {todoTasks.length > 0 && (
              <div className="task-section">
                {todoTasks.map((task) => (
                  <div key={task.id} className="task-item task-item-todo">
                    <div className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={false}
                        onChange={() => handleToggleTask(task.id, task.status)}
                        disabled={savingTaskId === task.id}
                      />
                    </div>
                    <div className="task-content">
                      <div className="task-title">{task.title}</div>
                      {task.due_date && (
                        <div
                          className={`task-due-date ${
                            isOverdue(task.due_date)
                              ? "task-overdue"
                              : isToday(task.due_date)
                                ? "task-today"
                                : ""
                          }`}
                        >
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                      {task.description && (
                        <div className="task-description">{task.description}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={savingTaskId === task.id}
                      className="task-btn task-btn-delete"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Done tasks */}
            {doneTasks.length > 0 && (
              <div className="task-section task-section-done">
                <div className="task-section-label">✓ Done ({doneTasks.length})</div>
                {doneTasks.map((task) => (
                  <div key={task.id} className="task-item task-item-done">
                    <div className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => handleToggleTask(task.id, task.status)}
                        disabled={savingTaskId === task.id}
                      />
                    </div>
                    <div className="task-content">
                      <div className="task-title task-title-done">{task.title}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={savingTaskId === task.id}
                      className="task-btn task-btn-delete"
                      title="Delete"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .task-panel {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 16px;
          background: #fff;
          margin-top: 16px;
        }

        .task-panel-header {
          margin-bottom: 12px;
        }

        .task-panel-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .task-panel-loading {
          padding: 20px;
          text-align: center;
          color: #999;
          font-size: 13px;
        }

        .task-panel-error {
          background-color: rgba(239, 68, 68, 0.1);
          border: 1px solid #ef4444;
          border-radius: 6px;
          padding: 10px;
          font-size: 13px;
          color: #991b1b;
          margin-bottom: 12px;
        }

        .task-add-form {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .task-input {
          flex: 1;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          font-family: inherit;
        }

        .task-input:focus {
          outline: none;
          border-color: #0096d6;
          box-shadow: 0 0 0 3px rgba(0, 150, 214, 0.1);
        }

        .task-date-input {
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 13px;
          width: 120px;
        }

        .task-date-input:focus {
          outline: none;
          border-color: #0096d6;
        }

        .task-btn {
          background: none;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 6px 12px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          transition: all 0.15s ease;
        }

        .task-btn:hover {
          border-color: #0096d6;
          background: #f0f8ff;
        }

        .task-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .task-btn-add {
          min-width: 40px;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-empty {
          padding: 12px;
          text-align: center;
          color: #999;
          font-size: 13px;
          margin: 0;
        }

        .task-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .task-section-done {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e0e0e0;
          opacity: 0.6;
        }

        .task-section-label {
          font-size: 12px;
          font-weight: 600;
          color: #999;
          margin-bottom: 4px;
        }

        .task-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: #fafafa;
        }

        .task-item-todo {
          background: #fff;
        }

        .task-item-done {
          background: #f8f8f8;
        }

        .task-checkbox {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .task-checkbox input {
          cursor: pointer;
          width: 18px;
          height: 18px;
        }

        .task-content {
          flex: 1;
          min-width: 0;
        }

        .task-title {
          font-size: 13px;
          font-weight: 500;
          color: #333;
          margin: 0;
          word-break: break-word;
        }

        .task-title-done {
          text-decoration: line-through;
          color: #999;
        }

        .task-due-date {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .task-due-date.task-overdue {
          color: #ef4444;
          font-weight: 600;
        }

        .task-due-date.task-today {
          color: #f59e0b;
          font-weight: 600;
        }

        .task-description {
          font-size: 12px;
          color: #999;
          margin-top: 4px;
          font-style: italic;
        }

        .task-btn-delete {
          flex-shrink: 0;
          background: none;
          border: none;
          padding: 4px 6px;
          cursor: pointer;
          font-size: 14px;
          opacity: 0.6;
          transition: opacity 0.15s ease;
        }

        .task-btn-delete:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
