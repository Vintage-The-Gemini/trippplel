const express = require("express");
const router = express.Router();
const prisma = require("../lib/prisma");

// Helper to format product for frontend
const fmt = (p) => p ? { ...p, _id: p.id } : null;

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const { category, sort, search } = req.query;

    const where = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };

    const products = await prisma.product.findMany({ where, orderBy });
    res.json({ products: products.map(fmt) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/featured
router.get("/featured", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isFeatured: true },
      take: 8,
    });
    res.json({ products: products.map(fmt) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product: fmt(product) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
