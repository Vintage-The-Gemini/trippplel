const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const {
  protect,
  adminOnly,
  requirePermission,
  superAdminOnly,
} = require("../middleware/auth");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const VALID_PERMISSIONS = ["dashboard", "products", "orders", "finances"];

const fmtProduct = (p) => p ? { ...p, _id: p.id } : null;
const fmtOrder = (o) => o ? { ...o, _id: o.id } : null;
const fmtUser = (u) => {
  if (!u) return null;
  const { password, ...rest } = u;
  return { ...rest, _id: u.id };
};

router.use(protect, adminOnly);

// ── Image Upload ──────────────────────────────────────────────────────────────
router.post(
  "/upload",
  requirePermission("products"),
  upload.single("image"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file provided" });
    try {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "trippplel/products", transformation: [{ quality: "auto", fetch_format: "auto" }] },
        (error, result) => {
          if (error) return res.status(500).json({ message: error.message });
          res.json({ url: result.secure_url });
        }
      );
      Readable.from(req.file.buffer).pipe(stream);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ── Dashboard Stats ───────────────────────────────────────────────────────────
router.get("/stats", requirePermission("dashboard"), async (req, res) => {
  try {
    const [totalOrders, totalProducts, recentOrders, revenueAgg] = await Promise.all([
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "cancelled" } } }),
    ]);
    res.json({
      totalOrders,
      totalProducts,
      revenue: revenueAgg._sum.total || 0,
      recentOrders: recentOrders.map(fmtOrder),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Finances ──────────────────────────────────────────────────────────────────
router.get("/finances", requirePermission("finances"), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const notCancelled = { status: { not: "cancelled" } };

    const [totalRev, monthRev, weekRev, byStatus, monthly] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: notCancelled }),
      prisma.order.aggregate({ _sum: { total: true }, where: { ...notCancelled, createdAt: { gte: startOfMonth } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { ...notCancelled, createdAt: { gte: startOfWeek } } }),
      prisma.order.groupBy({ by: ["status"], _count: { id: true } }),
      prisma.order.findMany({ where: { ...notCancelled, createdAt: { gte: sixMonthsAgo } }, select: { total: true, createdAt: true } }),
    ]);

    const monthlyMap = {};
    monthly.forEach((o) => {
      const key = `${o.createdAt.getFullYear()}-${o.createdAt.getMonth() + 1}`;
      if (!monthlyMap[key]) monthlyMap[key] = { revenue: 0, orders: 0, month: o.createdAt.getMonth() + 1, year: o.createdAt.getFullYear() };
      monthlyMap[key].revenue += o.total;
      monthlyMap[key].orders += 1;
    });

    res.json({
      totalRevenue: totalRev._sum.total || 0,
      monthRevenue: monthRev._sum.total || 0,
      weekRevenue: weekRev._sum.total || 0,
      ordersByStatus: byStatus.reduce((acc, s) => { acc[s.status] = s._count.id; return acc; }, {}),
      monthlyBreakdown: Object.values(monthlyMap).sort((a, b) => a.year - b.year || a.month - b.month),
      categoryRevenue: [],
      topProducts: [],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Products CRUD ─────────────────────────────────────────────────────────────
router.get("/products", requirePermission("products"), async (req, res) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ products: products.map(fmtProduct) });
});

router.get("/products/:id", requirePermission("products"), async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product: fmtProduct(product) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/products", requirePermission("products"), async (req, res) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ product: fmtProduct(product) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/products/:id", requirePermission("products"), async (req, res) => {
  try {
    const product = await prisma.product.update({ where: { id: req.params.id }, data: req.body });
    res.json({ product: fmtProduct(product) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/products/:id", requirePermission("products"), async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders", requirePermission("orders"), async (req, res) => {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  res.json({ orders: orders.map(fmtOrder) });
});

router.put("/orders/:id/status", requirePermission("orders"), async (req, res) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
    });
    res.json({ order: fmtOrder(order) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── User Management (super_admin only) ───────────────────────────────────────
router.get("/users", superAdminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ["staff", "super_admin"] } },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users: users.map(fmtUser) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/users", superAdminOnly, async (req, res) => {
  try {
    const { name, username, password, permissions } = req.body;
    const filtered = (permissions || []).filter((p) => VALID_PERMISSIONS.includes(p));
    const existing = await prisma.user.findUnique({ where: { email: username } });
    if (existing) return res.status(400).json({ message: "Username already taken" });
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email: username, password: hashed, role: "staff", permissions: filtered },
    });
    res.status(201).json({ user: fmtUser(user) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/users/:id/permissions", superAdminOnly, async (req, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "super_admin") return res.status(403).json({ message: "Cannot modify super admin" });
    const filtered = (req.body.permissions || []).filter((p) => VALID_PERMISSIONS.includes(p));
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { permissions: filtered } });
    res.json({ user: fmtUser(user) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/users/:id", superAdminOnly, async (req, res) => {
  try {
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "super_admin") return res.status(403).json({ message: "Cannot delete super admin" });
    await prisma.user.update({ where: { id: req.params.id }, data: { role: "user", permissions: [] } });
    res.json({ message: "Access revoked" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
