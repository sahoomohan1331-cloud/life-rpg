import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const envSummary = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasDirectUrl: Boolean(process.env.DIRECT_URL),
    hasStorageUrl: Boolean(process.env.STORAGE_URL),
    hasStoragePrismaUrl: Boolean(process.env.STORAGE_PRISMA_URL),
    hasPostgresUrl: Boolean(process.env.POSTGRES_URL),
    hasPostgresPrismaUrl: Boolean(process.env.POSTGRES_PRISMA_URL),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
  };

  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount,
      env: envSummary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        env: envSummary,
      },
      { status: 500 }
    );
  }
}
