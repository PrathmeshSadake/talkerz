import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const passage = await prisma.passages.findUnique({
      where: {
        id,
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        topic_interviews: {
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        },
      },
    });

    if (!passage) {
      return NextResponse.json({ error: "Passage not found" }, { status: 404 });
    }

    return NextResponse.json({ passage });
  } catch (error) {
    console.error("Error fetching passage:", error);
    return NextResponse.json(
      { error: "Failed to fetch passage" },
      { status: 500 }
    );
  }
}
