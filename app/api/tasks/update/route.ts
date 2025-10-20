// app/api/tasks/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scheduleReminder, cancelReminder } from '@/lib/timer-reminders';

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { id, ...updateData } = body;

  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: updateData,
  });

  cancelReminder(id);

  if (updatedTask.reminder) {
    scheduleReminder({
      id: updatedTask.id,
      title: updatedTask.title,
      deadline: updatedTask.deadline,
      duration: updatedTask.duration,
      subject: updatedTask.subject,
      description: updatedTask.description,
      reminder: updatedTask.reminder,
    });
  }

  return NextResponse.json(updatedTask);
}