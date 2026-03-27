"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { HiOutlineShoppingBag, HiOutlineMenu, HiX } from "react-icons/hi";
import CartSidebar from "@/components/ui/CartSidebar";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "All", href: "/products" },
  { label: "T-Shirts", href: "/products?category=tshirt" },
  { label: "Hoodies", href: "/products?category=hoodie" },
  { label: "New Drops", href: "/products?sort=new" },
];

const ANNOUNCEMENTS = [
  "FREE SHIPPING ON ORDERS OVER KES 5,000",
  "NEW DROP — LIMITED STOCK",
  "EASY 30-DAY RETURNS",
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const { itemCount, toggleCart } = useCartStore();
  const count = itemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setAnnouncementIdx((i) => (i + 1) % ANNOUNCEMENTS.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Announcement Bar ── */}
      <div className="bg-black text-white h-9 flex items-center justify-center overflow-hidden">
        <p className="text-[10px] font-bold tracking-[0.35em] uppercase transition-all duration-500 animate-fadeIn" key={announcementIdx}>
          {ANNOUNCEMENTS[announcementIdx]}
        </p>
      </div>

      {/* ── Main Navbar ── */}
      <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-sm" : "border-b border-gray-100"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">

            {/* Hamburger (mobile) */}
            <button className="md:hidden p-2 -ml-2" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <HiOutlineMenu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="display text-2xl tracking-wider hover:text-gray-600 transition-colors">
              TRIPPPLEL
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-[11px] font-bold tracking-[0.25em] uppercase hover:text-gray-500 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Cart */}
            <button onClick={toggleCart} className="relative p-2 hover:text-gray-500 transition-colors" aria-label="Open cart">
              <HiOutlineShoppingBag size={22} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-black text-[10px] w-5 h-5 flex items-center justify-center font-black rounded-none">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Full-screen Mobile Menu ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col animate-fadeIn">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <span className="display text-2xl text-white tracking-wider">TRIPPPLEL</span>
            <button onClick={() => setMenuOpen(false)} className="text-white p-2" aria-label="Close menu">
              <HiX size={26} />
            </button>
          </div>
          <nav className="flex flex-col justify-center flex-1 px-8 gap-2">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="display text-6xl text-white hover:text-accent transition-colors py-2"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="px-8 py-8 border-t border-white/10">
            <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase">Free shipping over KES 5,000 · 30-day returns</p>
          </div>
        </div>
      )}

      <CartSidebar />
    </>
  );
}
