// lib/init-reminders.ts
import { prisma } from '@/lib/prisma';
import { scheduleReminder, clearAllTimers } from '@/lib/timer-reminders';

export async function initPendingReminders() {
  clearAllTimers();

  const now = new Date();
  const pendingTasks = await prisma.task.findMany({
    where: {
      reminder: {
        gt: now,
      },
      reminderSent: false,
    },
  });

  console.log(`[Init] Восстановление ${pendingTasks.length} напоминаний...`);

  for (const task of pendingTasks) {
    // ✅ Явно проверяем, что reminder не null
    if (!task.reminder) {
      console.warn(`[Init] Пропуск задачи ${task.id} — reminder отсутствует`);
      continue;
    }

    scheduleReminder({
      id: task.id,
      title: task.title,
      deadline: task.deadline,
      duration: task.duration,
      subject: task.subject,
      description: task.description,
      reminder: task.reminder, 
    });
  }
}