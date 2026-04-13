const prisma = require("../lib/prisma");

const connectDB = async () => {
  const url = process.env.DATABASE_URL || "";
  console.log("DATABASE_URL prefix:", url.substring(0, 30));
  console.log("DATABASE_URL length:", url.length);
  try {
    await prisma.$connect();
    console.log("Supabase (PostgreSQL) connected");
  } catch (error) {
    console.error("Database connection error:", error.message);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
