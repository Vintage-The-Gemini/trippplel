"use client";

import { useCartStore } from "@/store/cartStore";
import { formatKES } from "@/lib/currency";
import Image from "next/image";
import Link from "next/link";
import { HiX, HiOutlineTrash } from "react-icons/hi";

export default function CartSidebar() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, total } = useCartStore();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={toggleCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold uppercase tracking-wider">
            Your Bag ({items.length})
          </h2>
          <button onClick={toggleCart} className="p-2 hover:text-gray-500 transition-colors">
            <HiX size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <p className="text-gray-400 text-sm">Your bag is empty</p>
              <button onClick={toggleCart} className="btn-outline text-xs">
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item, index) => (
                <li key={index} className="flex gap-4">
                  <div className="relative w-20 h-24 bg-gray-100 flex-shrink-0">
                    {item.product.images[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold uppercase tracking-wide">
                        {item.product.name}
                      </h3>
                      <button
                        onClick={() => removeItem(item.product._id, item.size, item.color.name)}
                        className="text-gray-400 hover:text-black transition-colors"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.size} · {item.color.name}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.product._id, item.size, item.color.name, item.quantity - 1)}
                          className="px-3 py-1 text-sm hover:bg-gray-100 transition-colors"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product._id, item.size, item.color.name, item.quantity + 1)}
                          className="px-3 py-1 text-sm hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold">
                        {formatKES(item.product.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-500 uppercase tracking-wider">Subtotal</span>
              <span className="text-xl font-bold">{formatKES(total())}</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">Shipping calculated at checkout</p>
            <Link
              href="/checkout"
              onClick={toggleCart}
              className="btn-primary w-full text-center block"
            >
              Checkout
            </Link>
            <button
              onClick={toggleCart}
              className="w-full text-center text-xs text-gray-400 hover:text-black transition-colors mt-4 tracking-wider uppercase"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
