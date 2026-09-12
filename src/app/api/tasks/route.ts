import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTaskSchema } from "@/schemas/task";

// GET /api/tasks — list tasks with optional filters
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
    const type = searchParams.get("type");
    const attributeName = searchParams.get("attributeName");
    const completed = searchParams.get("completed");

    const where: Record<string, unknown> = { userId: session.user.id };

    if (type && ["QUEST", "DAILY", "HABIT"].includes(type)) {
      where.type = type;
    }
    if (attributeName && ["WISDOM", "VITALITY", "CRAFT"].includes(attributeName)) {
      where.attributeName = attributeName;
    }
    if (completed === "true") {
      where.completedAt = { not: null };
    } else if (completed === "false") {
      where.completedAt = null;
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ completedAt: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to fetch quests" } },
      { status: 500 }
    );
  }
}

// POST /api/tasks — create a new task
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
    const parsed = createTaskSchema.safeParse(body);

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

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title: parsed.data.title,
        description: parsed.data.description || null,
        difficulty: parsed.data.difficulty,
        attributeName: parsed.data.attributeName,
        type: parsed.data.type,
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      },
    });

    return NextResponse.json({ success: true, data: task }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to create quest" } },
      { status: 500 }
    );
  }
}
