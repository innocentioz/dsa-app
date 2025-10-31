import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { title, content } = await req.json();
  const id = Number(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  try {
    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content },
    });

    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json(
      { error: 'Failed to update note' },
      { status: 500 }
    );
  }
}