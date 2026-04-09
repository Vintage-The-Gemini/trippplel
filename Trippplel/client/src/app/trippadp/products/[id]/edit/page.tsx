"use client";

export function generateStaticParams() { return []; }

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getAdminProduct, updateProduct } from "@/lib/adminApi";
import { Product } from "@/types";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getAdminProduct(id)
      .then((res) => setProduct(res.data.product))
      .catch(() => toast.error("Product not found"))
      .finally(() => setFetching(false));
  }, [id]);

  const handleSubmit = async (data: object) => {
    setLoading(true);
    try {
      await updateProduct(id, data);
      toast.success("Product updated");
      router.push("/trippadp/products");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update product";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="p-8 text-zinc-500 text-xs uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <p className="text-red-400 text-sm">Product not found.</p>
        <Link
          href="/trippadp/products"
          className="text-[#CCFF00] text-xs uppercase tracking-wider font-bold mt-4 inline-block"
        >
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/trippadp/products"
          className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest font-bold transition-colors"
        >
          ← Back
        </Link>
        <h1
          className="text-4xl font-black text-white"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Edit Product
        </h1>
      </div>
      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-6">
        {product.name}
      </p>
      <ProductForm initialData={product} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
