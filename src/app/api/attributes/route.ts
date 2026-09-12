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

    const attributes = await prisma.attribute.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    });

    const withProgress = attributes.map((attr) => {
      const xpToNextLevel = xpForLevel(attr.level);
      return {
        ...attr,
        xpToNextLevel,
        xpProgress: xpToNextLevel > 0 ? attr.xp / xpToNextLevel : 0,
      };
    });

    return NextResponse.json({ success: true, data: withProgress });
  } catch (error) {
    console.error("GET /api/attributes error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch attributes" } },
      { status: 500 }
    );
  }
}
