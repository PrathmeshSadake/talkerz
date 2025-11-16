import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const passages = await prisma.passages.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            topic_interviews: true,
          },
        },
      },
    });

    return NextResponse.json({ passages });
  } catch (error) {
    console.error("Error fetching passages:", error);
    return NextResponse.json(
      { error: "Failed to fetch passages" },
      { status: 500 }
    );
  }
}
