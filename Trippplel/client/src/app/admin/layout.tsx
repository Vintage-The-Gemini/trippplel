"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    if (pathname === "/admin/login") {
      setChecking(false);
      return;
    }
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    const stored = localStorage.getItem("adminUser");
    if (stored) {
      try {
        setAdminName(JSON.parse(stored).name);
      } catch {}
    }
    setChecking(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;
  if (checking) return <div className="min-h-screen bg-zinc-950" />;

  const navItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/orders", label: "Orders" },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="p-5 border-b border-zinc-800">
          <span
            className="text-2xl font-black tracking-tighter"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            TRIPPPLEL<span className="text-[#CCFF00]">.</span>
          </span>
          <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-widest">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-xs font-black uppercase tracking-widest transition-colors ${
                  isActive
                    ? "bg-[#CCFF00] text-black"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          {adminName && (
            <p className="text-[10px] text-zinc-500 mb-2 truncate uppercase tracking-wider">
              {adminName}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 py-2 text-left transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
