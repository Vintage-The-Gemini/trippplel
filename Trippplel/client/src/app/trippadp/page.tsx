"use client";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/lib/adminApi";
import { formatKES } from "@/lib/currency";
import Link from "next/link";

interface Stats {
  totalOrders: number;
  totalProducts: number;
  revenue: number;
  recentOrders: {
    _id: string;
    email: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  paid: "text-green-400",
  shipped: "text-blue-400",
  delivered: "text-emerald-400",
  cancelled: "text-red-400",
  pending: "text-zinc-400",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-zinc-500 text-xs uppercase tracking-widest">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1
        className="text-4xl font-black mb-8 text-white"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Revenue", value: formatKES(stats?.revenue || 0) },
          { label: "Total Orders", value: stats?.totalOrders ?? 0 },
          { label: "Total Products", value: stats?.totalProducts ?? 0 },
        ].map((card) => (
          <div key={card.label} className="bg-zinc-900 border border-zinc-800 p-6">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">
              {card.label}
            </p>
            <p
              className="text-3xl font-black text-[#CCFF00]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          href="/trippadp/products/new"
          className="bg-[#CCFF00] text-black text-xs font-black uppercase tracking-widest px-6 py-3 hover:bg-white transition-colors"
        >
          + Add Product
        </Link>
        <Link
          href="/trippadp/products"
          className="border border-zinc-700 text-zinc-300 text-xs font-black uppercase tracking-widest px-6 py-3 hover:border-[#CCFF00] hover:text-white transition-colors"
        >
          Manage Products
        </Link>
        <Link
          href="/trippadp/orders"
          className="border border-zinc-700 text-zinc-300 text-xs font-black uppercase tracking-widest px-6 py-3 hover:border-[#CCFF00] hover:text-white transition-colors"
        >
          View Orders
        </Link>
      </div>

      <div>
        <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
          Recent Orders
        </h2>
        {!stats?.recentOrders?.length ? (
          <p className="text-zinc-600 text-sm">No orders yet</p>
        ) : (
          <div className="border border-zinc-800 divide-y divide-zinc-800">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wide">
                    {order.email}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-[#CCFF00]">
                    {formatKES(order.total)}
                  </p>
                  <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${STATUS_COLORS[order.status] || "text-zinc-400"}`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
