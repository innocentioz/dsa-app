import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const tasks = await prisma.task.findMany({
        where: { completed: false },
        orderBy: { deadline: 'asc' },
    })
    return NextResponse.json(tasks, { status: 200 });
}