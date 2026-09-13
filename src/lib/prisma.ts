import { PrismaClient } from "@prisma/client";

// Normalize environment variables in serverless runtime
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    process.env.STORAGE_PRISMA_URL ||
    process.env.STORAGE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;
}

if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL =
    process.env.STORAGE_URL_NON_POOLING ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const datasourceUrl =
  process.env.DATABASE_URL ||
  process.env.STORAGE_PRISMA_URL ||
  process.env.STORAGE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasourceUrl } : {}),
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
