import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/schemas/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);

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

    const { email, password } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "An account with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with character and attributes in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
        },
      });

      // Create character
      await tx.character.create({
        data: {
          userId: newUser.id,
          level: 1,
          xp: 0,
          totalXp: 0,
          gold: 0,
          title: "Novice Adventurer",
        },
      });

      // Create three attributes
      await tx.attribute.createMany({
        data: [
          { userId: newUser.id, name: "WISDOM", level: 1, xp: 0 },
          { userId: newUser.id, name: "VITALITY", level: 1, xp: 0 },
          { userId: newUser.id, name: "CRAFT", level: 1, xp: 0 },
        ],
      });

      // Create global streak
      await tx.streak.create({
        data: {
          userId: newUser.id,
          taskId: null,
          current: 0,
          longest: 0,
        },
      });

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        data: { id: user.id, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Something went wrong. Please try again.",
        },
      },
      { status: 500 }
    );
  }
}
