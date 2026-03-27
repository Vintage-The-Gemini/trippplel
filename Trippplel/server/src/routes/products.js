const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// GET /api/products
router.get("/", async (req, res) => {
  try {
    const { category, sort, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };

    let sortOption = { createdAt: -1 };
    if (sort === "new") sortOption = { createdAt: -1 };
    if (sort === "price-asc") sortOption = { price: 1 };
    if (sort === "price-desc") sortOption = { price: -1 };

    const products = await Product.find(filter).sort(sortOption);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/featured
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(8);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/products/:slug
router.get("/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
