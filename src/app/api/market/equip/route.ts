import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Item ID required" } },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Check ownership
    const inventoryItem = await prisma.inventoryItem.findUnique({
      where: { userId_itemId: { userId, itemId } },
      include: { item: true },
    });

    if (!inventoryItem) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "You don't own this item" } },
        { status: 404 }
      );
    }

    // For themes, unequip other themes first
    if (inventoryItem.item.category === "THEME") {
      await prisma.inventoryItem.updateMany({
        where: {
          userId,
          item: { category: "THEME" },
          equipped: true,
        },
        data: { equipped: false },
      });
    }

    // Toggle equip state
    const updated = await prisma.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { equipped: !inventoryItem.equipped },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("POST /api/market/equip error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to equip item" } },
      { status: 500 }
    );
  }
}
