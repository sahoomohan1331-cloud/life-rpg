const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '';

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('[prepare-db] Detected PostgreSQL environment.');
  const postgresSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.postgresql.prisma');
  const targetSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

  if (fs.existsSync(postgresSchemaPath)) {
    fs.copyFileSync(postgresSchemaPath, targetSchemaPath);
    console.log('[prepare-db] Copied schema.postgresql.prisma to schema.prisma');
  }

  if (!process.env.DATABASE_URL && (process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL)) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL;
  }

  try {
    console.log('[prepare-db] Synchronizing database tables with PostgreSQL...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });
    console.log('[prepare-db] Database push successful.');
  } catch (err) {
    console.error('[prepare-db] Note: db push failed:', err.message);
  }

  try {
    console.log('[prepare-db] Generating Prisma client for PostgreSQL...');
    execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
    console.log('[prepare-db] Prisma client generated.');
  } catch (err) {
    console.error('[prepare-db] Note: prisma generate failed:', err.message);
  }
} else {
  console.log('[prepare-db] SQLite environment detected.');
}
