const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { protect } = require("../middleware/auth");

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const { email, items, shippingAddress, total } = req.body;
    const orderItems = items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0],
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));
    const order = await Order.create({
      user: req.user?._id,
      email,
      items: orderItems,
      shippingAddress,
      total,
    });
    res.status(201).json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my-orders (auth required)
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
