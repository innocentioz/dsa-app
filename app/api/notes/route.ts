import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const notes = await prisma.note.findMany()
    return NextResponse.json(notes, { status: 200 });
}