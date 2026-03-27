const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

// Products CRUD
router.get("/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ products });
});

router.post("/products", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put("/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Orders
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

// Dashboard stats
router.get("/stats", async (req, res) => {
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
});

module.exports = router;
