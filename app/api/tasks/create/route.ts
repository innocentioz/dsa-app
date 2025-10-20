import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scheduleReminder } from '@/lib/timer-reminders';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const {
        title,
        description,
        subject,
        type,
        priority,
        status,
        deadline,
        reminder,
        duration,
        isRecurring,
    } = body;

    const deadlineDate = deadline ? new Date(deadline) : null;
    const reminderDate = reminder ? new Date(reminder) : null;

    const task = await prisma.task.create({
        data: {
            title: title.trim(),
            description: description || undefined,
            subject: subject || undefined,
            type: type || undefined,    
            priority: priority || 'MEDIUM',
            status: status || 'ACTIVE',
            deadline: deadlineDate,
            reminder: reminderDate,
            duration: duration || null,
            isRecurring: !!isRecurring,
            completed: false,
            reminderSent: false,
        }
    })

    if (reminderDate) {
        scheduleReminder({
            id: task.id,
            title: task.title,
            deadline: task.deadline,
            duration: task.duration,
            subject: task.subject,
            description: task.description,
            reminder: reminderDate,
        });
    }
    
    return NextResponse.json(task, { status: 201 });
}