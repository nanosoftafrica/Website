/**
 * Email Service
 * Handles sending reminder emails for tasks
 */

import nodemailer from 'nodemailer';

// nodemailer 10 ships its own types without the old `Transporter` namespace.
type Transporter = ReturnType<typeof nodemailer.createTransport>;

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: Transporter | null = null;

async function getTransporter(): Promise<Transporter> {
  try {
    const { SystemIntegration } = require('./serverModels');
    const item = await SystemIntegration.findOne({ where: { key: 'smtp' } });
    if (item && item.isEnabled && item.config?.host) {
      const cfg = item.config;
      return nodemailer.createTransport({
        host: cfg.host,
        port: parseInt(cfg.port || '587'),
        secure: cfg.secure === true || cfg.secure === 'true',
        auth: cfg.user && cfg.password ? {
          user: cfg.user,
          pass: cfg.password,
        } : undefined,
      });
    }
  } catch {
    // Fall back to env
  }

  // Configure based on environment
  const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';

  if (emailProvider === 'smtp') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: process.env.SMTP_USER && process.env.SMTP_PASSWORD ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      } : undefined,
    });
  } else {
    // Development: use ethereal or console logging
    return nodemailer.createTransport({
      host: 'localhost',
      port: 1025, // MailHog default port
      secure: false,
    });
  }
}

export async function sendTaskReminder(
  taskTitle: string,
  dueDate: string,
  recipientEmail: string,
  reminderType: 'today_8am' | '1day_before'
): Promise<boolean> {
  try {
    const transporter = await getTransporter();

    const reminderMessage = reminderType === 'today_8am'
      ? `This task is due today: ${dueDate}`
      : `This task is due tomorrow: ${dueDate}`;

    const html = `
      <h2>${taskTitle}</h2>
      <p>${reminderMessage}</p>
      <p>Please review and complete this task.</p>
    `;

    const result = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@nanosoft.local',
      to: recipientEmail,
      subject: `Task Reminder: ${taskTitle}`,
      html,
    });

    console.log(`Email sent: ${result.messageId}`);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

export async function sendBulkTaskReminders(
  reminders: Array<{
    taskTitle: string;
    dueDate: string;
    recipientEmail: string;
    reminderType: 'today_8am' | '1day_before';
  }>
): Promise<number> {
  let successCount = 0;

  for (const reminder of reminders) {
    const sent = await sendTaskReminder(
      reminder.taskTitle,
      reminder.dueDate,
      reminder.recipientEmail,
      reminder.reminderType
    );

    if (sent) {
      successCount++;
    }
  }

  return successCount;
}

export async function testEmailConnection(): Promise<boolean> {
  try {
    const transporter = await getTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email connection test failed:', error);
    return false;
  }
}
