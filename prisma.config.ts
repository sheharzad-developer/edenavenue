import "dotenv/config";
import { defineConfig } from "prisma/config";

// Extract direct database URL from Prisma Accelerate URL if needed
function getDirectDatabaseUrl(): string {
  const dbUrl = process.env.DATABASE_URL || "";
  
  // If DATABASE_URL is already a direct PostgreSQL URL, use it
  if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
    return dbUrl;
  }
  
  // If it's a Prisma Accelerate URL, extract the direct URL
  if (dbUrl.startsWith("prisma+postgres://")) {
    try {
      const apiKey = dbUrl.split("api_key=")[1];
      if (apiKey) {
        const decoded = Buffer.from(apiKey, "base64").toString("utf-8");
        const data = JSON.parse(decoded);
        const directUrl = data.databaseUrl || data.shadowDatabaseUrl;
        // Only use extracted URL if it's not localhost (for production)
        if (directUrl && !directUrl.includes("localhost")) {
          return directUrl;
        }
        // For localhost, return the original Prisma Accelerate URL
        return dbUrl;
      }
    } catch (error) {
      // If parsing fails, return original URL
      console.warn("Failed to parse Prisma Accelerate URL, using as-is");
    }
  }
  
  // Fallback for development
  return dbUrl || "postgresql://dummy:dummy@localhost:5432/dummy";
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
