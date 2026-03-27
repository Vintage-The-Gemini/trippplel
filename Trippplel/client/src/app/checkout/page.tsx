"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { createOrder, createPaymentIntent } from "@/lib/api";
import { formatKES, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/currency";
import { ShippingAddress } from "@/types";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const emptyAddress: ShippingAddress = {
  fullName: "",
  address: "",
  city: "",
  postalCode: "",
  country: "Kenya",
  phone: "",
};

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [form, setForm] = useState<ShippingAddress>(emptyAddress);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const shipping = total() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const orderTotal = total() + shipping;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createPaymentIntent(Math.round(orderTotal * 100));
      const res = await createOrder({ email, items, shippingAddress: form, total: orderTotal });
      clearCart();
      router.push(`/orders/${res.data.order._id}`);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-4 text-gray-500">Contact</h2>
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
          </div>

          <div>
            <h2 className="text-xs font-bold tracking-widest uppercase mb-4 text-gray-500">Shipping Address</h2>
            <div className="space-y-3">
              <input name="fullName" placeholder="Full name" value={form.fullName} onChange={handleChange} required className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
              <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
              <div className="grid grid-cols-2 gap-3">
                <input name="city" placeholder="City" value={form.city} onChange={handleChange} required className="border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
                <input name="postalCode" placeholder="Postal code" value={form.postalCode} onChange={handleChange} required className="border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
              </div>
              <input name="country" placeholder="Country" value={form.country} onChange={handleChange} required className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
              <input name="phone" placeholder="Phone number (e.g. 0712345678)" value={form.phone} onChange={handleChange} required className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors" />
            </div>
          </div>

          <button type="submit" disabled={loading || items.length === 0} className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Processing..." : `Pay ${formatKES(orderTotal)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div>
          <h2 className="text-xs font-bold tracking-widest uppercase mb-6 text-gray-500">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-black flex-shrink-0" />
                  <span>{item.product.name} — {item.size} · {item.color.name}</span>
                  <span className="text-gray-400">x{item.quantity}</span>
                </div>
                <span className="font-semibold">{formatKES(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatKES(total())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatKES(SHIPPING_COST)}</span>
            </div>
            <div className="flex justify-between font-black text-lg pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{formatKES(orderTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
