export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: "tshirt" | "hoodie";
  sizes: string[];
  colors: Color[];
  stock: number;
  isNew?: boolean;
  isFeatured?: boolean;
  slug: string;
  createdAt: string;
}

export interface Color {
  name: string;
  hex: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: Color;
}

export interface Order {
  _id: string;
  user?: string;
  email: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  total: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  stripePaymentId?: string;
  createdAt: string;
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}
