import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await prisma.topic_interviews.findUnique({
      where: {
        id: params.id,
      },
      include: {
        passages: {
          include: {
            questions: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

