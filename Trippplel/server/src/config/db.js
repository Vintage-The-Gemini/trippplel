const prisma = require("../lib/prisma");

const connectDB = async () => {
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
