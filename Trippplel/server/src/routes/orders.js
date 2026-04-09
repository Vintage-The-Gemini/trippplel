const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");
const { protect } = require("../middleware/auth");

// Format order for frontend — maps id to _id and reconstructs items.product shape
const fmtOrder = (order) => {
  if (!order) return null;
  const items = (order.items || []).map((item) => ({
    product: {
      _id: item.productId,
      name: item.name,
      price: item.price,
      images: [item.image],
    },
    quantity: item.quantity,
    size: item.size,
    color: item.color,
  }));
  return { ...order, _id: order.id, items };
};

// POST /api/orders
router.post("/", async (req, res) => {
  try {
    const { email, items, shippingAddress, total } = req.body;
    const orderItems = items.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      image: item.product.images[0],
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));
    const order = await prisma.order.create({
      data: {
        userId: req.user?.id || null,
        email,
        items: orderItems,
        shippingAddress,
        total,
      },
    });
    res.status(201).json({ order: fmtOrder(order) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/my-orders — MUST be before /:id
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ orders: orders.map(fmtOrder) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/:id
router.get("/:id", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order: fmtOrder(order) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
