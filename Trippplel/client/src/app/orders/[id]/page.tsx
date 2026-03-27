"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrder } from "@/lib/api";
import { Order } from "@/types";
import { formatKES } from "@/lib/currency";
import Link from "next/link";
import { HiCheckCircle } from "react-icons/hi";

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id as string)
      .then((res) => setOrder(res.data.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="pt-28 min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="pt-28 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
      <div className="flex justify-center mb-6">
        <HiCheckCircle size={64} className="text-black" />
      </div>
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Order Confirmed!</h1>
      <p className="text-gray-500 text-sm mb-2">Order #{order?._id?.slice(-8).toUpperCase()}</p>
      <p className="text-gray-400 text-sm mb-10">
        We&apos;ll send a confirmation to <strong>{order?.email}</strong>
      </p>

      {order && (
        <div className="text-left border border-gray-100 p-6 mb-8">
          <h2 className="text-xs font-bold tracking-widest uppercase mb-4 text-gray-500">Items</h2>
          <ul className="space-y-3">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>{item.product.name} — {item.size} x{item.quantity}</span>
                <span className="font-semibold">{formatKES(item.product.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-black">
            <span>Total</span>
            <span>{formatKES(order.total)}</span>
          </div>
        </div>
      )}

      <Link href="/products" className="btn-primary inline-block">
        Continue Shopping
      </Link>
    </div>
  );
}
