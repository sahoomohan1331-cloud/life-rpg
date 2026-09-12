import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Record<string, unknown> = {};
    if (category && ["THEME", "BADGE", "DECOR", "CONSUMABLE"].includes(category)) {
      where.category = category;
    }

    const items = await prisma.item.findMany({
      where,
      orderBy: { price: "asc" },
    });

    // Check which items the user already owns
    const ownedItems = await prisma.inventoryItem.findMany({
      where: { userId: session.user.id },
      select: { itemId: true, equipped: true },
    });

    const ownedMap = new Map(ownedItems.map((i) => [i.itemId, i.equipped]));

    const itemsWithOwnership = items.map((item) => ({
      ...item,
      effectJson:
        typeof item.effectJson === "string"
          ? JSON.parse(item.effectJson)
          : item.effectJson,
      owned: ownedMap.has(item.id),
      equipped: ownedMap.get(item.id) || false,
    }));

    return NextResponse.json({ success: true, data: itemsWithOwnership });
  } catch (error) {
    console.error("GET /api/market/items error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch items" } },
      { status: 500 }
    );
  }
}
