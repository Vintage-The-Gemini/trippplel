"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useCartStore } from "@/store/cartStore";
import { formatKES } from "@/lib/currency";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    const defaultSize = product.sizes[0] || "M";
    const defaultColor = product.colors[0] || { name: "Black", hex: "#000000" };
    addItem(product, defaultSize, defaultColor);
    toast.success(`${product.name} added to bag`);
  };

  return (
    <Link href={`/products/${product.slug}`} className="product-card group block">

      {/* ── Image container ── */}
      <div className="relative aspect-[4/5] bg-surface overflow-hidden img-hover-swap">

        {/* Primary image */}
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover img-primary"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}

        {/* Hover image (worn shot) */}
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt={product.name}
            fill
            className="object-cover img-secondary"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="badge bg-accent text-black">New</span>
          )}
          {product.stock > 0 && product.stock < 5 && (
            <span className="badge bg-accent-red text-white">Low Stock</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-black/60 text-white">Sold Out</span>
          )}
        </div>

        {/* Quick-add */}
        <button
          onClick={handleQuickAdd}
          disabled={product.stock === 0}
          className="quick-add disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {product.stock === 0 ? "Sold Out" : "Quick Add"}
        </button>
      </div>

      {/* ── Info ── */}
      <div className="pt-3 pb-1">
        <p className="text-[9px] tracking-[0.35em] uppercase text-gray-400 mb-1">
          {product.category === "tshirt" ? "T-Shirt" : "Hoodie"}
        </p>
        <h3 className="text-sm font-semibold uppercase tracking-wide truncate">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-bold">{formatKES(product.price)}</p>
          {/* Color dots */}
          {product.colors.length > 0 && (
            <div className="flex gap-1">
              {product.colors.slice(0, 4).map((color) => (
                <div
                  key={color.name}
                  title={color.name}
                  className="w-3 h-3 rounded-full border border-gray-200"
                  style={{ backgroundColor: color.hex }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[9px] text-gray-400">+{product.colors.length - 4}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
