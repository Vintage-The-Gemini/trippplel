const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const VALID_PERMISSIONS = ["dashboard", "products", "orders", "finances"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    // "user" = customer, "staff" = has specific permissions, "super_admin" = full access
    role: {
      type: String,
      enum: ["user", "staff", "super_admin"],
      default: "user",
    },
    permissions: {
      type: [{ type: String, enum: VALID_PERMISSIONS }],
      default: [],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
