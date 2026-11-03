/**
 * Initialize Task Reminder Scheduler
 * POST /api/admin/tasks/init-reminders
 * This endpoint starts the reminder scheduler on server startup
 */

import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/adminApi';

let schedulerInitialized = false;

export async function POST(req: Request) {
  try {
    // Optional: require admin session for manual trigger
    const session = await requireSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (schedulerInitialized) {
      return NextResponse.json({
        success: true,
        message: 'Scheduler already initialized',
      });
    }

    // Import and start the scheduler
    const { startReminderScheduler } = await import('@/lib/reminderScheduler');
    startReminderScheduler();
    schedulerInitialized = true;

    return NextResponse.json({
      success: true,
      message: 'Task reminder scheduler initialized',
    });
  } catch (error) {
    console.error('Error initializing scheduler:', error);
    return NextResponse.json(
      { error: 'Failed to initialize scheduler', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return NextResponse.json({
    schedulerInitialized,
    message: 'Call POST to initialize the reminder scheduler',
  });
}
