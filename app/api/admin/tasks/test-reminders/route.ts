/**
 * Test Task Reminder System
 * POST /api/admin/tasks/test-reminders
 * Creates test tasks and triggers reminder checks
 */

import { NextResponse } from 'next/server';
import { requireSession, audit } from '@/lib/adminApi';
import { Task, TaskReminder, Admin } from '@/lib/serverModels';
import { testEmailConnection } from '@/lib/emailService';
import { triggerReminderCheck } from '@/lib/reminderScheduler';

export async function POST(req: Request) {
  try {
    // Require admin session
    const session = await requireSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'create-test-tasks') {
      return await createTestTasks(session);
    } else if (action === 'check-reminders') {
      return await checkReminders(session);
    } else if (action === 'test-email') {
      return await testEmail();
    } else if (action === 'view-reminders') {
      return await viewReminders();
    } else {
      return NextResponse.json(
        { error: 'Unknown action', availableActions: ['create-test-tasks', 'check-reminders', 'test-email', 'view-reminders'] },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Test failed', details: String(error) },
      { status: 500 }
    );
  }
}

async function createTestTasks(session: any) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Create a test task due today
    const testTask1 = await Task.create({
      title: '[TEST] Task due today',
      description: 'This is a test task that should trigger 8am reminder',
      due_date: todayStr,
      status: 'TODO',
      assigned_to_user_id: session.id,
    });

    // Create a test task due tomorrow
    const testTask2 = await Task.create({
      title: '[TEST] Task due tomorrow',
      description: 'This is a test task that should trigger 1-day-before reminder',
      due_date: tomorrowStr,
      status: 'TODO',
      assigned_to_user_id: session.id,
    });

    await audit(session, 'create_test_tasks', 'task', 'batch', `Created test tasks ${testTask1.id}, ${testTask2.id}`);

    return NextResponse.json({
      success: true,
      message: 'Test tasks created',
      tasks: [
        { id: testTask1.id, title: testTask1.title, dueDate: todayStr },
        { id: testTask2.id, title: testTask2.title, dueDate: tomorrowStr },
      ],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create test tasks', details: String(error) },
      { status: 500 }
    );
  }
}

async function checkReminders(session: any) {
  try {
    console.log('Triggering reminder check...');
    const result = await triggerReminderCheck();

    await audit(session, 'test_reminder_check', 'task_reminder', 'batch', JSON.stringify(result));

    return NextResponse.json({
      success: true,
      message: 'Reminder check completed',
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check reminders', details: String(error) },
      { status: 500 }
    );
  }
}

async function testEmail() {
  try {
    const connected = await testEmailConnection();

    if (connected) {
      return NextResponse.json({
        success: true,
        message: 'Email connection test passed',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Email connection test failed',
        note: 'Check environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD',
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Email test failed', details: String(error) },
      { status: 500 }
    );
  }
}

async function viewReminders() {
  try {
    const reminders = await TaskReminder.findAll({
      order: [['created_at', 'DESC']],
      limit: 50,
    });

    // Get task titles for display
    const taskIds = reminders.map((r: any) => r.task_id);
    const tasks = await Task.findAll({
      where: { id: taskIds },
      attributes: ['id', 'title'],
    });

    const taskMap = tasks.reduce((acc: any, t: any) => {
      acc[t.id] = t.title;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      count: reminders.length,
      reminders: reminders.map((r: any) => ({
        id: r.id,
        taskId: r.task_id,
        taskTitle: taskMap[r.task_id] || 'Unknown',
        reminderType: r.reminder_type,
        scheduledFor: r.scheduled_for,
        sentAt: r.sent_at,
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to view reminders', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return NextResponse.json({
    message: 'Task reminder test endpoint',
    usage: 'POST with action: create-test-tasks, check-reminders, test-email, or view-reminders',
  });
}
