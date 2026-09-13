import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/schemas/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid email address",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Look up user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If user does not exist, return generic success message to prevent user enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        data: {
          message:
            "If an account with this email exists, instructions to reset your password have been sent.",
        },
      });
    }

    // Generate secure token (64 hex characters)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Save token in database, invalidating any previous tokens
    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });
    });

    const origin = request.headers.get("origin") || "http://localhost:3000";
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // Send real email notification via Nodemailer / SMTP
    const emailResult = await sendPasswordResetEmail({
      to: email,
      resetUrl,
    });

    console.log(`[AUTH] Password reset email dispatched to ${email}:`, {
      messageId: emailResult.messageId,
      previewUrl: emailResult.previewUrl,
    });

    return NextResponse.json({
      success: true,
      data: {
        message:
          "If an account with this email exists, instructions to reset your password have been dispatched to your inbox.",
        previewUrl: emailResult.previewUrl || resetUrl,
        token,
        emailDispatched: emailResult.success,
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: error instanceof Error ? error.message : "Failed to process password reset. Please try again later.",
        },
      },
      { status: 500 }
    );
  }
}
