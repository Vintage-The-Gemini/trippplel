const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { protect, adminOnly, managerOnly, superAdminOnly } = require("../middleware/auth");
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

// All admin routes require authentication + any staff role
router.use(protect, adminOnly);

// ── Image Upload ─────────────────────────────────────────────────────────────
router.post("/upload", managerOnly, upload.single("image"), async (req, res) => {
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
});

// ── Dashboard Stats ───────────────────────────────────────────────────────────
router.get("/stats", async (req, res) => {
  try {
    const [totalOrders, totalProducts, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name"),
    ]);
    const revenue = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    res.json({
      totalOrders,
      totalProducts,
      revenue: revenue[0]?.total || 0,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Finances ──────────────────────────────────────────────────────────────────
router.get("/finances", managerOnly, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const [
      totalRevenue,
      monthRevenue,
      weekRevenue,
      ordersByStatus,
      categoryRevenue,
      topProducts,
      monthlyBreakdown,
    ] = await Promise.all([
      // All time revenue
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      // This month
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      // This week
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: startOfWeek } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      // Orders grouped by status
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      // Revenue by product category
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$productInfo.category",
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            units: { $sum: "$items.quantity" },
          },
        },
      ]),
      // Top 5 products by revenue
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            units: { $sum: "$items.quantity" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ]),
      // Monthly revenue last 6 months
      Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      monthRevenue: monthRevenue[0]?.total || 0,
      weekRevenue: weekRevenue[0]?.total || 0,
      ordersByStatus: ordersByStatus.reduce((acc, s) => {
        acc[s._id] = s.count;
        return acc;
      }, {}),
      categoryRevenue,
      topProducts,
      monthlyBreakdown,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Products CRUD (admin/super_admin only) ────────────────────────────────────
router.get("/products", managerOnly, async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ products });
});

router.get("/products/:id", managerOnly, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/products", managerOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/products/:id", managerOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/products/:id", managerOnly, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────
router.get("/orders", async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
  res.json({ orders });
});

router.put("/orders/:id/status", async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ order });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── User Management (super_admin only) ───────────────────────────────────────
router.get("/users", superAdminOnly, async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["viewer", "orders_manager", "admin", "super_admin"] },
    }).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/users", superAdminOnly, async (req, res) => {
  try {
    const { name, username, password, role } = req.body;
    const allowedRoles = ["viewer", "orders_manager", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const existing = await User.findOne({ email: username });
    if (existing) return res.status(400).json({ message: "Username already taken" });
    const user = await User.create({ name, email: username, password, role });
    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/users/:id/role", superAdminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["viewer", "orders_manager", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    // Cannot change super_admin role
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "super_admin") {
      return res.status(403).json({ message: "Cannot modify super admin" });
    }
    target.role = role;
    await target.save();
    res.json({ user: { _id: target._id, name: target.name, role: target.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/users/:id", superAdminOnly, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "super_admin") {
      return res.status(403).json({ message: "Cannot delete super admin" });
    }
    // Revoke staff access by setting role to user
    target.role = "user";
    await target.save();
    res.json({ message: "Access revoked" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
