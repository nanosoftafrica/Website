/**
 * Task Reminder Scheduler
 * Runs hourly to check for tasks due today/tomorrow and send reminders
 */

let scheduledJob: any = null;

/**
 * Direct reminder check using database queries
 * Doesn't require authentication since it's internal
 */
async function directCheckAndSendReminders() {
  try {
    const { Task, TaskReminder, Admin } = require('@/lib/serverModels');
    const { sendTaskReminder } = require('@/lib/emailService');
    const { Op } = require('sequelize');

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
        status: 'TODO',
      },
    });

    if (tasks.length === 0) {
      return { success: true, message: 'No tasks to remind', count: 0 };
    }

    let remindersCreated = 0;
    let emailsSent = 0;

    for (const task of tasks) {
      const taskDueDate = task.due_date;

      // Check for today's 8am reminder
      if (taskDueDate === todayStr) {
        const existing = await TaskReminder.findOne({
          where: {
            task_id: task.id,
            reminder_type: '8am_daily',
            scheduled_for: todayStr,
          },
        });

        if (!existing) {
          await TaskReminder.create({
            task_id: task.id,
            reminder_type: '8am_daily',
            scheduled_for: todayStr,
          });
          remindersCreated++;

          let recipientEmail = process.env.DEFAULT_REMINDER_EMAIL || 'admin@nanosoft.local';
          if (task.assigned_to_user_id) {
            const admin = await Admin.findByPk(task.assigned_to_user_id);
            if (admin && admin.email) {
              recipientEmail = admin.email;
            }
          }

          const sent = await sendTaskReminder(task.title, taskDueDate, recipientEmail, 'today_8am');
          if (sent) {
            emailsSent++;
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
          await TaskReminder.create({
            task_id: task.id,
            reminder_type: '1day_before',
            scheduled_for: tomorrowStr,
          });
          remindersCreated++;

          let recipientEmail = process.env.DEFAULT_REMINDER_EMAIL || 'admin@nanosoft.local';
          if (task.assigned_to_user_id) {
            const admin = await Admin.findByPk(task.assigned_to_user_id);
            if (admin && admin.email) {
              recipientEmail = admin.email;
            }
          }

          const sent = await sendTaskReminder(task.title, taskDueDate, recipientEmail, '1day_before');
          if (sent) {
            emailsSent++;
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

    return { success: true, tasksProcessed: tasks.length, remindersCreated, emailsSent };
  } catch (error) {
    console.error('[Reminder Scheduler] Error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Start the reminder scheduler
 * Runs every hour at the top of the hour
 */
export function startReminderScheduler() {
  if (scheduledJob) {
    console.log('Reminder scheduler already running');
    return;
  }

  try {
    const cron = require('node-cron');
    // Run at the top of every hour (0 minutes)
    scheduledJob = cron.schedule('0 * * * *', async () => {
      console.log(`[${new Date().toISOString()}] Running task reminder check...`);
      const result = await directCheckAndSendReminders();
      console.log(`[${new Date().toISOString()}] Reminder check result:`, result);
    });

    console.log('✓ Task reminder scheduler started (runs hourly)');
  } catch (error) {
    console.error('Failed to start reminder scheduler:', error);
  }
}

/**
 * Stop the reminder scheduler
 */
export function stopReminderScheduler() {
  if (scheduledJob) {
    scheduledJob.stop();
    scheduledJob = null;
    console.log('Task reminder scheduler stopped');
  }
}

/**
 * Manually trigger reminder check
 */
export async function triggerReminderCheck() {
  console.log('[Reminder Check] Triggered manually');
  return await directCheckAndSendReminders();
}
