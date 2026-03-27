import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import { getFeaturedProducts } from "@/lib/api";
import { Product } from "@/types";

async function fetchFeatured(): Promise<Product[]> {
  try {
    const res = await getFeaturedProducts();
    return res.data.products;
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await fetchFeatured();

  return (
    <div>

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative h-screen bg-black flex items-center overflow-hidden">

        {/* Background: scattered product images */}
        <div className="absolute inset-0 z-0">
          {/* Large bg image — faded */}
          <Image
            src="/images/products/tee-it-is-what-it-is.jpg"
            alt=""
            fill
            className="object-cover opacity-10 scale-110"
            priority
          />
        </div>

        {/* Floating product cards — right side */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 z-10 hidden md:flex items-center justify-end pr-8 lg:pr-16">
          <div className="relative w-full max-w-sm h-full flex items-center">

            {/* Card 1 — back left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-44 aspect-[3/4] shadow-2xl rotate-[-6deg] overflow-hidden">
              <Image src="/images/products/hoodie-cant-adult.jpg" alt="" fill className="object-cover" />
            </div>

            {/* Card 2 — front center */}
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-52 aspect-[3/4] shadow-2xl z-10 overflow-hidden">
              <Image src="/images/products/tee-i-dont-make-mistakes.jpg" alt="" fill className="object-cover" />
            </div>

            {/* Card 3 — back right */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-44 aspect-[3/4] shadow-2xl rotate-[6deg] overflow-hidden">
              <Image src="/images/products/hoodie-pray.jpg" alt="" fill className="object-cover" />
            </div>
          </div>
        </div>

        {/* Dark gradient over right side */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black via-black/90 to-black/20 md:to-transparent" />

        {/* Hero text — left side */}
        <div className="relative z-20 px-6 sm:px-10 lg:px-20 max-w-3xl">
          <p className="section-label text-gray-500 mb-4">SS 2026 Collection</p>
          <h1 className="display text-[18vw] sm:text-[16vw] md:text-[12vw] lg:text-[10vw] text-white leading-none mb-6">
            MOVE<br />
            <span className="text-accent">DIFF</span><br />ERENT
          </h1>
          <p className="text-[11px] tracking-[0.5em] uppercase text-gray-400 mb-10 max-w-xs">
            Premium Streetwear · Limited Drops · Real Culture
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/products" className="btn-accent">Shop Now</Link>
            <Link href="/products?sort=new" className="btn-outline border-white text-white hover:bg-white hover:text-black">
              New Drops
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
          <p className="text-[9px] tracking-[0.5em] uppercase text-gray-500">Scroll</p>
          <div className="w-px h-8 bg-gray-600 animate-pulse" />
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────── */}
      <div className="bg-accent py-3 overflow-hidden">
        <div className="marquee-track">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} className="text-[10px] font-black tracking-[0.4em] uppercase text-black mx-10 whitespace-nowrap">
              PREMIUM STREETWEAR ✦ LIMITED DROPS ✦ FREE SHIPPING OVER KES 5,000 ✦
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

          {/* T-Shirts */}
          <Link href="/products?category=tshirt" className="group relative aspect-[3/4] md:aspect-[4/5] overflow-hidden block">
            <Image
              src="/images/products/tee-are-you-drunk.jpg"
              alt="T-Shirts"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <div className="bg-black p-6 group-hover:-translate-y-2 transition-transform duration-300">
                <p className="section-label text-gray-400 mb-1">Shop</p>
                <h2 className="display text-5xl text-white">T-SHIRTS</h2>
                <p className="text-xs text-gray-400 mt-2 tracking-widest uppercase">Explore collection →</p>
              </div>
            </div>
          </Link>

          {/* Hoodies */}
          <Link href="/products?category=hoodie" className="group relative aspect-[3/4] md:aspect-[4/5] overflow-hidden block">
            <Image
              src="/images/products/hoodie-cant-adult.jpg"
              alt="Hoodies"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <div className="bg-accent p-6 group-hover:-translate-y-2 transition-transform duration-300">
                <p className="section-label text-black/50 mb-1">Shop</p>
                <h2 className="display text-5xl text-black">HOODIES</h2>
                <p className="text-xs text-black/60 mt-2 tracking-widest uppercase">Explore collection →</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="flex items-end justify-between mb-10 border-b border-black pb-4">
            <div>
              <span className="section-label">Hand Picked</span>
              <h2 className="display text-5xl">Featured Drops</h2>
            </div>
            <Link href="/products" className="text-[10px] font-bold tracking-[0.3em] uppercase hover:text-gray-500 transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── EDITORIAL STRIP ───────────────────────────────────────── */}
      <section className="bg-black py-24 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <span className="section-label text-gray-500">Limited Edition</span>
            <h2 className="display text-[10vw] md:text-7xl text-white leading-none mb-6">
              DROP<br />
              <span className="text-accent">CULTURE.</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-8">
              Each piece is produced in limited quantity. Once it&apos;s gone, it&apos;s gone. Sign up to be first in line for every drop.
            </p>
            <Link href="/products?sort=new" className="btn-accent">See New Drops</Link>
          </div>
          <div className="flex-1 flex gap-3">
            <div className="flex-1 relative aspect-[3/4] overflow-hidden">
              <Image src="/images/products/tee-hakuna-mavodka.jpg" alt="" fill className="object-cover" />
            </div>
            <div className="flex-1 relative aspect-[3/4] overflow-hidden mt-8">
              <Image src="/images/products/hoodie-trusting-god.jpg" alt="" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FREE SHIPPING BANNER ──────────────────────────────────── */}
      <section className="border-y border-black py-16 px-4 text-center">
        <span className="section-label">Limited Time Offer</span>
        <h2 className="display text-[12vw] md:text-8xl tracking-tight leading-none mb-6">
          FREE SHIPPING<br />OVER KES 5,000
        </h2>
        <Link href="/products" className="btn-primary">Shop the Collection</Link>
      </section>

    </div>
  );
}
