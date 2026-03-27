"use client";

import { useCartStore } from "@/store/cartStore";
import { formatKES, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/currency";
import Image from "next/image";
import Link from "next/link";
import { HiOutlineTrash } from "react-icons/hi";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="pt-28 min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Your Bag is Empty</h1>
        <p className="text-gray-400 text-sm">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  const shipping = total() >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  return (
    <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-10">Your Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item, i) => (
            <div key={i} className="flex gap-5 pb-6 border-b border-gray-100">
              <div className="relative w-24 h-32 bg-gray-100 flex-shrink-0">
                {item.product.images[0] && (
                  <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold uppercase tracking-wide text-sm">{item.product.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{item.size} · {item.color.name}</p>
                  </div>
                  <button onClick={() => removeItem(item.product._id, item.size, item.color.name)} className="text-gray-400 hover:text-black transition-colors">
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-gray-200">
                    <button onClick={() => updateQuantity(item.product._id, item.size, item.color.name, item.quantity - 1)} className="px-4 py-2 text-sm hover:bg-gray-100">−</button>
                    <span className="px-4 py-2 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.size, item.color.name, item.quantity + 1)} className="px-4 py-2 text-sm hover:bg-gray-100">+</button>
                  </div>
                  <span className="font-bold">{formatKES(item.product.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-xs text-gray-400 hover:text-black transition-colors uppercase tracking-widest underline">
            Clear Bag
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-6 h-fit">
          <h2 className="text-lg font-black uppercase tracking-wide mb-6">Order Summary</h2>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">{formatKES(total())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="font-semibold">{shipping === 0 ? "FREE" : formatKES(SHIPPING_COST)}</span>
            </div>
            {total() < FREE_SHIPPING_THRESHOLD && (
              <p className="text-xs text-gray-400">
                Add {formatKES(FREE_SHIPPING_THRESHOLD - total())} more for free shipping
              </p>
            )}
          </div>
          <div className="border-t border-gray-200 pt-4 mb-6">
            <div className="flex justify-between">
              <span className="font-bold uppercase tracking-wide">Total</span>
              <span className="font-black text-xl">{formatKES(total() + shipping)}</span>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary w-full text-center block">
            Proceed to Checkout
          </Link>
          <Link href="/products" className="block text-center text-xs text-gray-400 hover:text-black transition-colors mt-4 tracking-widest uppercase">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
