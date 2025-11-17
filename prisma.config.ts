import "dotenv/config";
import { defineConfig } from "prisma/config";

// Extract direct database URL from Prisma Accelerate URL if needed
function getDirectDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL || "";
  
  // If DATABASE_URL is already a direct PostgreSQL URL, use it
  if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
    return dbUrl;
  }
  
  // If it's a Prisma Accelerate URL pointing to localhost, skip it for migrations
  // Migrations should use direct database URLs, not Prisma Accelerate
  if (dbUrl.startsWith("prisma+postgres://")) {
    // For migrations, we need a direct connection, not Prisma Accelerate
    // Return empty string to force error if no direct URL is available
    console.warn("Prisma Accelerate URLs are not supported for migrations. Please use a direct PostgreSQL connection string.");
    return "";
  }
  
  // Fallback - return empty to force explicit DATABASE_URL
  return dbUrl || "";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: getDirectDatabaseUrl(),
  },
});
