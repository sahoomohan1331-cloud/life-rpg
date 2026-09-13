import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStreakMultiplier } from "@/lib/progression";
import { sendStreakWarningEmail } from "@/lib/mailer";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    // Fetch user's current streak
    const streak = await prisma.streak.findFirst({
      where: { userId: session.user.id, taskId: null },
    });

    const currentStreak = streak?.current || 0;
    const multiplier = getStreakMultiplier(currentStreak);

    // Send real notification email
    const emailResult = await sendStreakWarningEmail({
      to: session.user.email,
      currentStreak,
      multiplier,
    });

    return NextResponse.json({
      success: true,
      data: {
        message: `Streak reminder dispatched to ${session.user.email}!`,
        previewUrl: emailResult.previewUrl || null,
        messageId: emailResult.messageId,
      },
    });
  } catch (error) {
    console.error("Streak warning notification error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to send notification" } },
      { status: 500 }
    );
  }
}
