"use client";
import { useEffect, useState } from "react";
import { getAdminFinances } from "@/lib/adminApi";
import { formatKES } from "@/lib/currency";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-zinc-700",
  paid: "bg-green-500",
  shipped: "bg-blue-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
};

interface Finances {
  totalRevenue: number;
  monthRevenue: number;
  weekRevenue: number;
  ordersByStatus: Record<string, number>;
  categoryRevenue: { _id: string; revenue: number; units: number }[];
  topProducts: { _id: string; name: string; revenue: number; units: number }[];
  monthlyBreakdown: { _id: { year: number; month: number }; revenue: number; orders: number }[];
}

export default function FinancesPage() {
  const [data, setData] = useState<Finances | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminFinances()
      .then((res) => setData(res.data))
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

  const totalOrders = data
    ? Object.values(data.ordersByStatus).reduce((a, b) => a + b, 0)
    : 0;

  const maxMonthlyRevenue = data
    ? Math.max(...data.monthlyBreakdown.map((m) => m.revenue), 1)
    : 1;

  return (
    <div className="p-8 space-y-10">
      <h1
        className="text-4xl font-black text-white"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        Finances
      </h1>

      {/* Top stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "All-Time Revenue", value: formatKES(data?.totalRevenue || 0) },
          { label: "This Month", value: formatKES(data?.monthRevenue || 0) },
          { label: "This Week", value: formatKES(data?.weekRevenue || 0) },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders by status */}
        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
            Orders by Status
          </h2>
          <div className="space-y-3">
            {["pending", "paid", "shipped", "delivered", "cancelled"].map((status) => {
              const count = data?.ordersByStatus[status] || 0;
              const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      {status}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 w-full">
                    <div
                      className={`h-full transition-all ${STATUS_COLORS[status] || "bg-zinc-600"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by category */}
        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
            Revenue by Category
          </h2>
          {!data?.categoryRevenue?.length ? (
            <p className="text-zinc-600 text-sm">No data yet</p>
          ) : (
            <div className="space-y-4">
              {data.categoryRevenue.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wider text-white">
                      {cat._id === "tshirt" ? "T-Shirts" : cat._id === "hoodie" ? "Hoodies" : cat._id || "Unknown"}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{cat.units} units sold</p>
                  </div>
                  <p className="text-lg font-black text-[#CCFF00]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    {formatKES(cat.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly revenue bar chart */}
      <div className="bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-6">
          Monthly Revenue (Last 6 Months)
        </h2>
        {!data?.monthlyBreakdown?.length ? (
          <p className="text-zinc-600 text-sm">No data yet</p>
        ) : (
          <div className="flex items-end gap-3 h-40">
            {data.monthlyBreakdown.map((m) => {
              const pct = (m.revenue / maxMonthlyRevenue) * 100;
              return (
                <div
                  key={`${m._id.year}-${m._id.month}`}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-[9px] text-zinc-400 font-mono">
                    {formatKES(m.revenue).replace("KES ", "")}
                  </span>
                  <div className="w-full bg-zinc-800 relative" style={{ height: "80px" }}>
                    <div
                      className="absolute bottom-0 w-full bg-[#CCFF00] transition-all"
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider">
                    {MONTHS[m._id.month - 1]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-[10px] text-zinc-500 uppercase tracking-widest mb-4">
          Top Products by Revenue
        </h2>
        {!data?.topProducts?.length ? (
          <p className="text-zinc-600 text-sm">No data yet</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {data.topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <span
                    className="text-2xl font-black text-zinc-700 w-8"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{p.name || "Unknown Product"}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{p.units} units</p>
                  </div>
                </div>
                <p className="text-sm font-black text-[#CCFF00]">{formatKES(p.revenue)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
