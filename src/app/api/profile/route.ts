import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  timezone: z.string().min(1).max(50).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const [user, character, attributes, totalCompletions, streak, inventory] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, timezone: true, createdAt: true },
        }),
        prisma.character.findUnique({
          where: { userId },
        }),
        prisma.attribute.findMany({
          where: { userId },
        }),
        prisma.completion.count({
          where: { userId },
        }),
        prisma.streak.findFirst({
          where: { userId, taskId: null },
        }),
        prisma.inventoryItem.findMany({
          where: { userId },
          include: { item: true },
          orderBy: { acquiredAt: "desc" },
        }),
      ]);

    if (!user || !character) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "User profile not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        character,
        attributes,
        stats: {
          totalCompletions,
          totalXp: character.totalXp,
          currentStreak: streak?.current ?? 0,
          longestStreak: streak?.longest ?? 0,
        },
        inventory: inventory.map((inv) => ({
          id: inv.id,
          itemId: inv.itemId,
          name: inv.item.name,
          category: inv.item.category,
          assetUrl: inv.item.assetUrl,
          equipped: inv.equipped,
          acquiredAt: inv.acquiredAt,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch profile" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid profile data",
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
      select: { id: true, email: true, timezone: true },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to update profile" } },
      { status: 500 }
    );
  }
}
