const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, adminOnly } = require("../middleware/auth");
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

router.use(protect, adminOnly);

// Image upload to Cloudinary
router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file provided" });
  try {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "trippplel/products",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
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

// Products CRUD
router.get("/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json({ products });
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
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
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
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
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate("user", "name email");
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
