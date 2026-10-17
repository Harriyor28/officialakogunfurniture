import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  if (url.startsWith("file:")) {
    const adapter = new PrismaBetterSqlite3({ url });
    return new PrismaClient({ adapter });
  }
  // PostgreSQL (and other server databases) require the matching driver
  // adapter, e.g. @prisma/adapter-pg — see README → Deployment.
  const scheme = url.includes("://") ? url.split("://")[0] : "unknown";
  throw new Error(
    `Unsupported DATABASE_URL (scheme "${scheme}"). This build uses the SQLite driver: ` +
      'set DATABASE_URL to a "file:" path. To use PostgreSQL, change the Prisma provider, ' +
      "regenerate the client and add the matching adapter — see README.md → Deployment.",
  );
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

// The client is created lazily so importing this module never throws. The
// configuration error therefore surfaces on the first query (runtime) instead
// of during the build's page-data collection, where no database is needed.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client as object, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
