/**
 * Task Reminders API
 * POST /api/admin/tasks/send-reminders
 * Checks for tasks due today and tomorrow, sends reminder emails
 */

import { NextResponse } from 'next/server';
import { requireSession, audit } from '@/lib/adminApi';
import { Task, TaskReminder, Admin } from '@/lib/serverModels';
import { sendTaskReminder } from '@/lib/emailService';
import { Op } from 'sequelize';

export async function POST(req: Request) {
  try {
    // Optional: require admin session for manual trigger
    const session = await requireSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today and tomorrow dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Find tasks with due dates today or tomorrow
    const tasks = await Task.findAll({
      where: {
        due_date: {
          [Op.in]: [todayStr, tomorrowStr],
        },
        status: 'TODO', // Only active tasks
      },
    });

    if (tasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tasks due today or tomorrow',
        count: 0,
      });
    }

    let remindersCreated = 0;
    let emailsSent = 0;

    for (const task of tasks) {
      const taskDueDate = task.due_date;

      // Check for today's 8am reminder
      if (taskDueDate === todayStr) {
        // Check if reminder already exists
        const existing = await TaskReminder.findOne({
          where: {
            task_id: task.id,
            reminder_type: '8am_daily',
            scheduled_for: todayStr,
          },
        });

        if (!existing) {
          // Create reminder record
          await TaskReminder.create({
            task_id: task.id,
            reminder_type: '8am_daily',
            scheduled_for: todayStr,
          });
          remindersCreated++;

          // Get admin/assigned user email
          let recipientEmail = process.env.DEFAULT_REMINDER_EMAIL || 'admin@nanosoft.local';

          if (task.assigned_to_user_id) {
            const admin = await Admin.findByPk(task.assigned_to_user_id);
            if (admin && admin.email) {
              recipientEmail = admin.email;
            }
          }

          // Send email
          const sent = await sendTaskReminder(
            task.title,
            taskDueDate,
            recipientEmail,
            'today_8am'
          );

          if (sent) {
            emailsSent++;
            // Update reminder record with sent_at
            await TaskReminder.update(
              { sent_at: new Date() },
              {
                where: {
                  task_id: task.id,
                  reminder_type: '8am_daily',
                  scheduled_for: todayStr,
                },
              }
            );
          }
        }
      }

      // Check for 1-day-before reminder
      if (taskDueDate === tomorrowStr) {
        const existing = await TaskReminder.findOne({
          where: {
            task_id: task.id,
            reminder_type: '1day_before',
            scheduled_for: tomorrowStr,
          },
        });

        if (!existing) {
          // Create reminder record
          await TaskReminder.create({
            task_id: task.id,
            reminder_type: '1day_before',
            scheduled_for: tomorrowStr,
          });
          remindersCreated++;

          // Get admin/assigned user email
          let recipientEmail = process.env.DEFAULT_REMINDER_EMAIL || 'admin@nanosoft.local';

          if (task.assigned_to_user_id) {
            const admin = await Admin.findByPk(task.assigned_to_user_id);
            if (admin && admin.email) {
              recipientEmail = admin.email;
            }
          }

          // Send email
          const sent = await sendTaskReminder(
            task.title,
            taskDueDate,
            recipientEmail,
            '1day_before'
          );

          if (sent) {
            emailsSent++;
            // Update reminder record with sent_at
            await TaskReminder.update(
              { sent_at: new Date() },
              {
                where: {
                  task_id: task.id,
                  reminder_type: '1day_before',
                  scheduled_for: tomorrowStr,
                },
              }
            );
          }
        }
      }
    }

    // Audit log
    await audit(
      session,
      'send_reminders',
      'task_reminders',
      'batch',
      `Processed ${tasks.length} tasks, created ${remindersCreated} reminders, sent ${emailsSent} emails`
    );

    return NextResponse.json({
      success: true,
      message: 'Reminders processed',
      tasksProcessed: tasks.length,
      remindersCreated,
      emailsSent,
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/tasks/send-reminders
 * Check health/status of reminder system
 */
export async function GET(req: Request) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    // Count pending reminders
    const pendingReminders = await TaskReminder.count({
      where: {
        sent_at: null,
        scheduled_for: {
          [Op.lte]: todayStr,
        },
      },
    });

    // Count today's reminders
    const todaysReminders = await TaskReminder.count({
      where: {
        scheduled_for: todayStr,
      },
    });

    return NextResponse.json({
      status: 'ok',
      pendingReminders,
      todaysReminders,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check reminder status', details: String(error) },
      { status: 500 }
    );
  }
}
