import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
    const notes = await prisma.note.create({
        data: {
            title: "Ваша заметка",
            content: "Содержание заметки",
        },
    });
    return NextResponse.json(notes, { status: 200 });
}