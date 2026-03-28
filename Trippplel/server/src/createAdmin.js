require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");

async function createAdmin() {
  await connectDB();

  const email = "trippadmin";
  const password = "trippadmin123"; // plain — model's pre-save hook will hash it
  const name = "Tripp Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    // Reset password (pre-save hook will hash it correctly)
    existing.role = "admin";
    existing.password = password;
    await existing.save();
    console.log("✓ Admin password reset and role confirmed");
  } else {
    await User.create({ name, email, password, role: "admin" });
    console.log("✓ Admin created");
  }

  console.log("  Username:", email);
  console.log("  Password:", password);
  console.log("\nDelete this file after running.");
  process.exit(0);
}

createAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
