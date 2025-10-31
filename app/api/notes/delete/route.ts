import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();

    const note = await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json(note);
}