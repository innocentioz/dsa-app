import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
    const { id, ...data } = await req.json();

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        reminder: data.reminder ? new Date(data.reminder) : undefined,
      },
    });

    return NextResponse.json(task);
}