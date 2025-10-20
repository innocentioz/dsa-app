import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    const task = await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json(task);
}