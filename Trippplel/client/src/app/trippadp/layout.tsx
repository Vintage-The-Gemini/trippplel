"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type Role = "super_admin" | "admin" | "orders_manager" | "viewer" | "";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [role, setRole] = useState<Role>("");

  useEffect(() => {
    if (pathname === "/trippadp/login") {
      setChecking(false);
      return;
    }
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.replace("/trippadp/login");
      return;
    }
    const stored = localStorage.getItem("adminUser");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setAdminName(user.name);
        setRole(user.role);
      } catch {}
    }
    setChecking(false);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    router.push("/trippadp/login");
  };

  if (pathname === "/trippadp/login") return <>{children}</>;
  if (checking) return <div className="min-h-screen bg-zinc-950" />;

  const canManageProducts = ["admin", "super_admin"].includes(role);
  const canViewFinances = ["admin", "super_admin"].includes(role);
  const canManageUsers = role === "super_admin";

  const ROLE_LABELS: Record<string, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    orders_manager: "Orders Manager",
    viewer: "Viewer",
  };

  const navSections = [
    {
      label: "Overview",
      items: [
        { href: "/trippadp", label: "Dashboard", show: true },
        { href: "/trippadp/finances", label: "Finances", show: canViewFinances },
      ],
    },
    {
      label: "Store",
      items: [
        { href: "/trippadp/products", label: "Products", show: canManageProducts },
        { href: "/trippadp/orders", label: "Orders", show: true },
      ],
    },
    {
      label: "Admin",
      items: [
        { href: "/trippadp/users", label: "Users & Roles", show: canManageUsers },
      ],
    },
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
            TRPP<span className="text-[#CCFF00]">.</span>
          </span>
          <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-widest">
            Admin Panel
          </p>
        </div>

        <nav className="flex-1 p-3 overflow-y-auto">
          {navSections.map((section) => {
            const visibleItems = section.items.filter((i) => i.show);
            if (visibleItems.length === 0) return null;
            return (
              <div key={section.label} className="mb-4">
                <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold px-3 mb-1">
                  {section.label}
                </p>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const isActive =
                      item.href === "/trippadp"
                        ? pathname === "/trippadp"
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-xs font-black uppercase tracking-widest transition-colors ${
                          isActive
                            ? "bg-[#CCFF00] text-black"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          {adminName && (
            <p className="text-[10px] text-zinc-400 font-bold truncate uppercase tracking-wider">
              {adminName}
            </p>
          )}
          {role && (
            <span className="inline-block mt-1 mb-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-zinc-800 text-[#CCFF00]">
              {ROLE_LABELS[role] || role}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 py-1.5 text-left transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
