const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    category: { type: String, enum: ["tshirt", "hoodie"], required: true },
    sizes: [{ type: String, enum: ["XS", "S", "M", "L", "XL", "XXL"] }],
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
      },
    ],
    stock: { type: Number, required: true, default: 0, min: 0 },
    isNew: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
