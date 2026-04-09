const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const { protect } = require("../middleware/auth");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendToken = (user, res) => {
  const token = signToken(user.id);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    },
    token,
  });
};

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already in use" });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });
    sendToken(user, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    sendToken(user, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
