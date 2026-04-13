const { PrismaClient } = require("@prisma/client");

// Allow DATABASE_URL to be built from individual parts
// This works around URL truncation issues in some hosting environments
if (process.env.DB_HOST) {
  const user = encodeURIComponent(process.env.DB_USER || "postgres");
  const pass = encodeURIComponent(process.env.DB_PASS || "");
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || "5432";
  const name = process.env.DB_NAME || "postgres";
  process.env.DATABASE_URL = `postgresql://${user}:${pass}@${host}:${port}/${name}?sslmode=require`;
}

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;

module.exports = prisma;
