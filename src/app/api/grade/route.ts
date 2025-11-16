import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transcript, passageContent, questions } = body;

    if (!transcript || !passageContent) {
      return NextResponse.json(
        { error: "Transcript and passage content are required" },
        { status: 400 }
      );
    }

    const gradingPrompt = `You are an expert English language evaluator. Evaluate the following conversation transcript where a student discussed a reading passage.

PASSAGE:
${passageContent}

QUESTIONS ASKED:
${
  questions
    ? questions.map((q: any) => `- ${q.questionText}`).join("\n")
    : "No specific questions"
}

CONVERSATION TRANSCRIPT:
${transcript}

Evaluate the student's performance on the following criteria (score each from 0-100):

1. COMPREHENSION: How well did the student understand the passage content?
2. FLUENCY: How smoothly and naturally did the student speak?
3. LEXICAL RESOURCE: Vocabulary range and appropriate word choice
4. GRAMMATICAL ACCURACY: Correct use of grammar structures
5. PRONUNCIATION: Clarity and correctness of pronunciation (infer from transcript quality)
6. RESPONSIVENESS: How well did the student answer questions and stay on topic?

Provide your response in the following JSON format:
{
  "comprehensionScore": <0-100>,
  "fluencyScore": <0-100>,
  "lexicalScore": <0-100>,
  "grammaticalScore": <0-100>,
  "pronunciationScore": <0-100>,
  "responsivenessScore": <0-100>,
  "overallScore": <0-100>,
  "comprehensionFeedback": "<specific feedback>",
  "fluencyFeedback": "<specific feedback>",
  "lexicalFeedback": "<specific feedback>",
  "grammaticalFeedback": "<specific feedback>",
  "pronunciationFeedback": "<specific feedback>",
  "responsivenessFeedback": "<specific feedback>",
  "overallFeedback": "<general summary>"
}

Be specific and constructive in your feedback. Focus on what the student did well and areas for improvement.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert English language evaluator. Provide detailed, constructive feedback in valid JSON format only.",
        },
        {
          role: "user",
          content: gradingPrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({
      success: true,
      evaluation: result,
    });
  } catch (error) {
    console.error("Error grading transcript:", error);
    return NextResponse.json(
      {
        error: "Failed to grade transcript",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
