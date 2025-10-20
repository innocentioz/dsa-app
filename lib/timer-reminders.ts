// lib/timer-reminders.ts
import { prisma } from '@/lib/prisma';;
import fetch from 'node-fetch';


const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`; // ✅ без пробелов!

// Хранилище активных таймеров (чтобы можно было очистить при перезапуске)
const activeTimers = new Map<number, NodeJS.Timeout>();

export function scheduleReminder(task: {
  id: number;
  title: string;
  deadline: Date | null;
  duration: number | null;
  subject: string | null;
  description: string | null;
  reminder: Date;
}) {
  const now = new Date();
  const delay = task.reminder.getTime() - now.getTime();

  if (delay <= 0) {
    console.warn(`[Timer] Напоминание уже в прошлом для задачи ${task.id}`);
    return;
  }

  console.log(`[Timer] Запланировано напоминание для "${task.title}" через ${Math.round(delay / 1000)} секунд`);

const timerId = setTimeout(async () => {
  try {
    const message = `
🔔 *НАПОМИНАНИЕ*
📌 *${task.title}*
📅 Срок: ${task.deadline ? new Date(task.deadline).toLocaleString('ru-RU') : 'не указан'}
⏱ Длительность: ${task.duration ? `${task.duration} мин` : 'не указана'}
📚 Тема: ${task.subject || '—'}
📝 Описание: ${task.description || '—'}
    `.trim();

    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(`Telegram API: ${JSON.stringify(error)}`);
    }

    // ✅ ИСПРАВЛЕНО: добавлено ``
    await prisma.task.update({
      where: { id: task.id },
      data: { reminderSent: true },
    });

    console.log(`✅ [Timer] Отправлено напоминание для задачи: "${task.title}"`);

  } catch (error) {
    console.error(`❌ [Timer] Ошибка отправки для задачи ${task.id}:`, error);
  } finally {
    activeTimers.delete(task.id);
  }
}, delay);

  activeTimers.set(task.id, timerId);
}

// Опционально: функция для очистки всех таймеров (например, при перезапуске)
export function clearAllTimers() {
  for (const timer of activeTimers.values()) {
    clearTimeout(timer);
  }
  activeTimers.clear();
  console.log('[Timer] Все активные таймеры очищены');
}

export function cancelReminder(taskId: number) {
  const timer = activeTimers.get(taskId);
  if (timer) {
    clearTimeout(timer);
    activeTimers.delete(taskId);
    console.log(`[Timer] Таймер для задачи ${taskId} отменён`);
  }
}