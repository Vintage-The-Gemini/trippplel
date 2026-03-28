import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product, Color } from "@/types";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string, color: Color) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size, color) => {
        const items = get().items;
        const existing = items.find(
          (i) =>
            i.product._id === product._id &&
            i.size === size &&
            i.color.name === color.name
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.product._id === product._id &&
              i.size === size &&
              i.color.name === color.name
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1, size, color }] });
        }
      },

      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter(
            (i) =>
              !(
                i.product._id === productId &&
                i.size === size &&
                i.color.name === color
              )
          ),
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((i) =>
            i.product._id === productId &&
            i.size === size &&
            i.color.name === color
              ? { ...i, quantity }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),

      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: "tripppluxe-cart" }
  )
);
