import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      passageId, 
      fullTranscript, 
      duration,
      comprehensionScore,
      fluencyScore,
      lexicalScore,
      grammaticalScore,
      pronunciationScore,
      responsivenessScore,
      overallScore,
      comprehensionFeedback,
      fluencyFeedback,
      lexicalFeedback,
      grammaticalFeedback,
      pronunciationFeedback,
      responsivenessFeedback,
      questionsAsked,
      userAnswers,
      recommendedAnswers
    } = body;

    if (!userId || !passageId || !fullTranscript) {
      return NextResponse.json(
        { error: 'User ID, passage ID, and transcript are required' },
        { status: 400 }
      );
    }

    const session = await prisma.topic_interviews.create({
      data: {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        passageId,
        fullTranscript,
        duration: duration || 0,
        comprehensionScore,
        fluencyScore,
        lexicalScore,
        grammaticalScore,
        pronunciationScore,
        responsivenessScore,
        overallScore,
        comprehensionFeedback,
        fluencyFeedback,
        lexicalFeedback,
        grammaticalFeedback,
        pronunciationFeedback,
        responsivenessFeedback,
        questionsAsked: questionsAsked || '',
        userAnswers: userAnswers || '',
        recommendedAnswers: recommendedAnswers || '',
        updatedAt: new Date(),
      },
      include: {
        passages: true,
      },
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

