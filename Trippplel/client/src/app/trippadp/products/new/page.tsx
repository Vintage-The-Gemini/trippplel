"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/adminApi";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: object) => {
    setLoading(true);
    try {
      await createProduct(data);
      toast.success("Product created");
      router.push("/trippadp/products");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create product";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
          New Product
        </h1>
      </div>
      <ProductForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
