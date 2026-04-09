"use client";

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
    const data = await res.json();
    return (data.products || []).map((p: { _id: string }) => ({ id: p._id }));
  } catch {
    return [];
  }
}

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { getProduct } from "@/lib/api";
import { Product, Color } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { formatKES } from "@/lib/currency";
import toast from "react-hot-toast";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCartStore();

  useEffect(() => {
    getProduct(id as string)
      .then((res) => {
        setProduct(res.data.product);
        if (res.data.product.colors.length > 0) {
          setSelectedColor(res.data.product.colors[0]);
        }
      })
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error("Please select a size");
    if (!selectedColor) return toast.error("Please select a color");
    if (!product) return;
    addItem(product, selectedSize, selectedColor);
    toast.success("Added to bag");
  };

  if (loading) return (
    <div className="pt-28 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="pt-28 min-h-screen flex items-center justify-center">
      <p className="text-gray-400 uppercase tracking-widest text-sm">Product not found</p>
    </div>
  );

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28 md:pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

        {/* Images */}
        <div className="flex gap-4">
          {/* Thumbnails — hidden on mobile */}
          <div className="hidden sm:flex flex-col gap-2 w-16">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative aspect-square bg-gray-100 overflow-hidden border-2 transition-colors ${
                  activeImage === i ? "border-black" : "border-transparent"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="relative flex-1 aspect-[3/4] bg-gray-100 overflow-hidden">
            {product.images[activeImage] && (
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
              />
            )}
            {product.isNew && (
              <span className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-2 py-1 tracking-widest uppercase">
                New
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:pt-8">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 mb-2">
            {product.category === "tshirt" ? "T-Shirt" : "Hoodie"}
          </p>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-3">
            {product.name}
          </h1>
          <p className="text-2xl font-bold mb-6">{formatKES(product.price)}</p>

          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Color */}
          <div className="mb-6">
            <p className="text-xs font-bold tracking-widest uppercase mb-3">
              Color: <span className="text-gray-500">{selectedColor?.name}</span>
            </p>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor?.name === color.name
                      ? "border-black scale-110"
                      : "border-transparent hover:border-gray-300"
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-widest uppercase">Size</p>
              <button className="text-xs underline underline-offset-2 text-gray-500 hover:text-black">
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => {
                const available = product.sizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => available && setSelectedSize(size)}
                    disabled={!available}
                    className={`w-12 h-12 text-xs font-bold uppercase tracking-wider border transition-all ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : available
                        ? "border-gray-200 hover:border-black"
                        : "border-gray-100 text-gray-300 cursor-not-allowed line-through"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Add to Cart — desktop */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="hidden md:block btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {product.stock === 0 ? "Sold Out" : "Add to Bag"}
          </button>

          {/* Stock warning */}
          {product.stock > 0 && product.stock < 5 && (
            <p className="text-red-600 text-xs font-semibold uppercase tracking-wider mt-3 text-center">
              Only {product.stock} left!
            </p>
          )}
        </div>
      </div>

      {/* Sticky bottom bar — mobile only */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-100 p-4">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? "Sold Out" : `Add to Bag — KES ${product.price.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}
