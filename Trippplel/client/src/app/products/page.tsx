import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/api";
import { Product } from "@/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description: "Shop all t-shirts and hoodies from Tripppluxe",
};

async function fetchProducts(params: {
  category?: string;
  sort?: string;
  search?: string;
}): Promise<Product[]> {
  try {
    const res = await getProducts(params);
    return res.data.products;
  } catch {
    return [];
  }
}

interface Props {
  searchParams: { category?: string; sort?: string; search?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  const products = await fetchProducts(searchParams);

  const categoryLabel =
    searchParams.category === "tshirt"
      ? "T-Shirts"
      : searchParams.category === "hoodie"
      ? "Hoodies"
      : "All Products";

  return (
    <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
          {categoryLabel}
        </h1>
        <p className="text-gray-400 text-sm mt-2">{products.length} products</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-10">
        {[
          { label: "All", href: "/products" },
          { label: "T-Shirts", href: "/products?category=tshirt" },
          { label: "Hoodies", href: "/products?category=hoodie" },
          { label: "New Drops", href: "/products?sort=new" },
        ].map((filter) => (
          <a
            key={filter.label}
            href={filter.href}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-black hover:bg-black hover:text-white transition-colors"
          >
            {filter.label}
          </a>
        ))}
      </div>

      {/* Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm uppercase tracking-widest">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
