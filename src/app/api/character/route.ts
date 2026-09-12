import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { xpForLevel } from "@/lib/progression";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const character = await prisma.character.findUnique({
      where: { userId: session.user.id },
    });

    if (!character) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Character not found" } },
        { status: 404 }
      );
    }

    const xpToNextLevel = xpForLevel(character.level);
    const xpProgress = xpToNextLevel > 0 ? character.xp / xpToNextLevel : 0;

    return NextResponse.json({
      success: true,
      data: {
        ...character,
        xpToNextLevel,
        xpProgress,
      },
    });
  } catch (error) {
    console.error("GET /api/character error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch character" } },
      { status: 500 }
    );
  }
}
