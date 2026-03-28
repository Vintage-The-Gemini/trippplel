require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");

async function createAdmin() {
  await connectDB();

  const email = "trippadmin";
  const password = "trippadmin123";
  const name = "Tripp Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    await existing.save();
    console.log("✓ Existing user promoted to admin:", email);
  } else {
    const hashed = await bcrypt.hash(password, 12);
    await User.create({ name, email, password: hashed, role: "admin" });
    console.log("✓ Admin created");
    console.log("  Username:", email);
    console.log("  Password:", password);
  }

  console.log("\nDelete this file after running — never commit credentials.");
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
