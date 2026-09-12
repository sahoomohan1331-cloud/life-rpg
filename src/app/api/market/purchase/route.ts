import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { purchaseSchema } from "@/schemas/market";

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
    const parsed = purchaseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { itemId } = parsed.data;
    const userId = session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch item
      const item = await tx.item.findUnique({ where: { id: itemId } });
      if (!item) {
        throw new Error("NOT_FOUND");
      }

      // 2. Check if already owned (for non-consumables)
      if (item.category !== "CONSUMABLE") {
        const existing = await tx.inventoryItem.findUnique({
          where: { userId_itemId: { userId, itemId } },
        });
        if (existing) {
          throw new Error("ALREADY_OWNED");
        }
      }

      // 3. Check gold balance
      const character = await tx.character.findUnique({ where: { userId } });
      if (!character || character.gold < item.price) {
        throw new Error("INSUFFICIENT_GOLD");
      }

      // 4. Deduct gold
      await tx.character.update({
        where: { userId },
        data: { gold: character.gold - item.price },
      });

      // 5. Add to inventory
      const inventoryItem = await tx.inventoryItem.create({
        data: { userId, itemId },
      });

      // 6. Record transaction
      await tx.transaction.create({
        data: { userId, itemId, price: item.price },
      });

      return {
        inventoryItem,
        newGoldBalance: character.gold - item.price,
        item,
      };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Item not found" } },
        { status: 404 }
      );
    }
    if (message === "ALREADY_OWNED") {
      return NextResponse.json(
        { success: false, error: { code: "CONFLICT", message: "You already own this item" } },
        { status: 409 }
      );
    }
    if (message === "INSUFFICIENT_GOLD") {
      return NextResponse.json(
        { success: false, error: { code: "INSUFFICIENT_GOLD", message: "Not enough gold" } },
        { status: 402 }
      );
    }

    console.error("POST /api/market/purchase error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to purchase item" } },
      { status: 500 }
    );
  }
}
