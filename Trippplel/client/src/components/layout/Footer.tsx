import Link from "next/link";
import NewsletterForm from "@/components/ui/NewsletterForm";

export default function Footer() {
  return (
    <footer className="bg-black text-white">

      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="display text-4xl md:text-5xl text-white">JOIN THE MOVEMENT</h3>
            <p className="text-gray-500 text-xs tracking-widest uppercase mt-1">Be first for every drop.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          <div className="col-span-2 md:col-span-1">
            <h2 className="display text-3xl text-white mb-3">TRIPPPLEL</h2>
            <p className="text-gray-500 text-xs leading-relaxed max-w-[180px]">
              Premium streetwear. Limited drops. Real culture.
            </p>
          </div>

          <div>
            <h4 className="section-label text-gray-600 mb-4">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: "All Products", href: "/products" },
                { label: "T-Shirts", href: "/products?category=tshirt" },
                { label: "Hoodies", href: "/products?category=hoodie" },
                { label: "New Drops", href: "/products?sort=new" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-gray-400 hover:text-white transition-colors tracking-wide uppercase">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="section-label text-gray-600 mb-4">Help</h4>
            <ul className="space-y-3">
              {[
                { label: "Shipping Info", href: "/shipping" },
                { label: "Returns", href: "/returns" },
                { label: "Size Guide", href: "/size-guide" },
                { label: "Contact Us", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-gray-400 hover:text-white transition-colors tracking-wide uppercase">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="section-label text-gray-600 mb-4">Follow</h4>
            <ul className="space-y-3">
              {["Instagram", "TikTok", "Twitter/X"].map((s) => (
                <li key={s}>
                  <a href="#" className="text-xs text-gray-400 hover:text-accent transition-colors tracking-wide uppercase">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-gray-600 tracking-[0.3em] uppercase">
            © {new Date().getFullYear()} Trippplel. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[10px] text-gray-600 hover:text-white transition-colors tracking-widest uppercase">Privacy</Link>
            <Link href="/terms" className="text-[10px] text-gray-600 hover:text-white transition-colors tracking-widest uppercase">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
