require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");

async function createAdmin() {
  await connectDB();

  const email = "trippadmin";
  const password = "trippadmin123";
  const name = "Tripp Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "super_admin";
    existing.password = password;
    await existing.save();
    console.log("✓ User upgraded to super_admin, password reset");
  } else {
    await User.create({ name, email, password, role: "super_admin" });
    console.log("✓ Super admin created");
  }

  console.log("  Username:", email);
  console.log("  Password:", password);
  console.log("  Role: super_admin");
  console.log("\nDelete this file after running.");
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
