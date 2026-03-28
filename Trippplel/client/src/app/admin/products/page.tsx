"use client";
import { useEffect, useState } from "react";
import { getAdminProducts, deleteProduct } from "@/lib/adminApi";
import { Product } from "@/types";
import { formatKES } from "@/lib/currency";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    getAdminProducts()
      .then((res) => setProducts(res.data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-zinc-500 text-xs uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-4xl font-black text-white"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Products ({products.length})
        </h1>
        <Link
          href="/admin/products/new"
          className="bg-[#CCFF00] text-black text-xs font-black uppercase tracking-widest px-5 py-2.5 hover:bg-white transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-zinc-600 text-sm">No products yet.</p>
      ) : (
        <div className="border border-zinc-800">
          {/* Table header */}
          <div className="grid grid-cols-[60px_1fr_100px_80px_80px_80px_120px] gap-4 px-4 py-2 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest">
            <span>Image</span>
            <span>Name</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Flags</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          {products.map((product) => (
            <div
              key={product._id}
              className="grid grid-cols-[60px_1fr_100px_80px_80px_80px_120px] gap-4 px-4 py-3 border-b border-zinc-800 items-center hover:bg-zinc-900 transition-colors"
            >
              {/* Image */}
              <div className="w-12 h-12 bg-zinc-800 overflow-hidden">
                {product.images?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                    —
                  </div>
                )}
              </div>

              {/* Name */}
              <div>
                <p className="text-sm font-bold text-white leading-tight">
                  {product.name}
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                  {product.slug}
                </p>
              </div>

              {/* Category */}
              <span className="text-xs text-zinc-400 uppercase tracking-wider">
                {product.category === "tshirt" ? "T-Shirt" : "Hoodie"}
              </span>

              {/* Price */}
              <span className="text-xs font-bold text-[#CCFF00]">
                {formatKES(product.price)}
              </span>

              {/* Stock */}
              <span
                className={`text-xs font-bold ${
                  product.stock === 0
                    ? "text-red-400"
                    : product.stock < 5
                    ? "text-yellow-400"
                    : "text-white"
                }`}
              >
                {product.stock}
              </span>

              {/* Flags */}
              <div className="flex flex-col gap-0.5">
                {product.isFeatured && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#CCFF00]">
                    Featured
                  </span>
                )}
                {product.isNew && (
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400">
                    New
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/admin/products/${product._id}/edit`}
                  className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-400 px-2.5 py-1 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(product._id, product.name)}
                  disabled={deleting === product._id}
                  className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 border border-zinc-700 hover:border-red-400 px-2.5 py-1 transition-colors disabled:opacity-50"
                >
                  {deleting === product._id ? "..." : "Del"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
