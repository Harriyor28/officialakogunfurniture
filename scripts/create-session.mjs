// Dev utility: create a valid session token for a user so portal/admin pages
// can be smoke-tested with curl. Usage: node scripts/create-session.mjs <email>
import { readFileSync, existsSync } from "node:fs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma/client.js";

if (!process.env.DATABASE_URL && existsSync(".env")) {
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match) process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

function secret() {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 16 && !value.includes("change-me")) return value;
  return "development-only-insecure-session-secret";
}

function sign(payload) {
  return createHash("sha256").update(`${payload}.${secret()}`).digest("hex").slice(0, 32);
}

async function main() {
  const email = (process.argv[2] || "").toLowerCase();
  if (!email) {
    console.error("Usage: node scripts/create-session.mjs <email>");
    process.exit(1);
  }
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
  const prisma = new PrismaClient({ adapter });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("No user with that email");
    process.exit(1);
  }
  const payload = `${randomUUID()}.${Date.now()}.${randomBytes(16).toString("hex")}`;
  const token = `${payload}.${sign(payload)}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({
    data: {
      tokenHash: createHash("sha256").update(token).digest("hex"),
      userId: user.id,
      expiresAt,
      userAgent: "dev-session-script",
    },
  });
  console.log(token);
  await prisma["$disc" + "onnect"]();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
