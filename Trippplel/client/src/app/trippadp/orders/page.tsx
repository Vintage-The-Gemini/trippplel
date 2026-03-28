"use client";
import { useEffect, useState } from "react";
import { getAdminOrders, updateOrderStatus } from "@/lib/adminApi";
import { Order } from "@/types";
import { formatKES } from "@/lib/currency";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["pending", "paid", "shipped", "delivered", "cancelled"];

const STATUS_COLORS: Record<string, string> = {
  paid: "text-green-400",
  shipped: "text-blue-400",
  delivered: "text-emerald-400",
  cancelled: "text-red-400",
  pending: "text-zinc-400",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminOrders()
      .then((res) => setOrders(res.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === id ? { ...o, status: status as Order["status"] } : o
        )
      );
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

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
        Orders ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <p className="text-zinc-600 text-sm">No orders yet.</p>
      ) : (
        <div className="border border-zinc-800">
          <div className="grid grid-cols-[90px_1fr_60px_100px_140px] gap-4 px-4 py-2 border-b border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          {orders.map((order) => (
            <div
              key={order._id}
              className="grid grid-cols-[90px_1fr_60px_100px_140px] gap-4 px-4 py-4 border-b border-zinc-800 items-center hover:bg-zinc-900 transition-colors"
            >
              <span className="text-[10px] text-zinc-500 font-mono">
                #{order._id.slice(-8).toUpperCase()}
              </span>

              <div>
                <p className="text-xs font-bold text-white">{order.email}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-KE", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                {order.shippingAddress?.city && (
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {order.shippingAddress.city}
                  </p>
                )}
              </div>

              <span className="text-xs text-zinc-400">{order.items.length}</span>

              <span className="text-xs font-black text-[#CCFF00]">
                {formatKES(order.total)}
              </span>

              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                className={`bg-zinc-900 border border-zinc-700 px-2 py-1.5 text-xs font-bold uppercase tracking-wider focus:border-[#CCFF00] focus:outline-none cursor-pointer ${
                  STATUS_COLORS[order.status] || "text-zinc-400"
                }`}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="text-white bg-zinc-900">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
