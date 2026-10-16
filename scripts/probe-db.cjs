const { PrismaClient } = require("../lib/generated/prisma/client.js");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: "file:./prisma/dev.db" });
  const prisma = new PrismaClient({ adapter });
  const users = await prisma.user.count();
  const tables = await prisma.siteSetting.count();
  console.log("OK users:", users, "settings:", tables);
  await prisma["$disconnect"]();
}

main().catch((e) => {
  console.error("ERR", e);
  process.exit(1);
});
