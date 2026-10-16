import { readFileSync, existsSync } from "node:fs";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer auto-loads .env for the CLI config file.
function loadDotEnv(): void {
  if (process.env.DATABASE_URL) return;
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }
}

loadDotEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
  },
  migrations: {
    seed: "node prisma/seed.mjs",
  },
});
