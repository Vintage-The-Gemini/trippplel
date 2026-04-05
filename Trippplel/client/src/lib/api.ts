import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Products
export const getProducts = (params?: {
  category?: string;
  search?: string;
  sort?: string;
}) => api.get("/products", { params });

export const getProduct = (slug: string) => api.get(`/products/${slug}`);

export const getFeaturedProducts = () => api.get("/products/featured");

// Orders
export const createOrder = (data: object) => api.post("/orders", data);

export const getOrder = (id: string) => api.get(`/orders/${id}`);

export const getUserOrders = () => api.get("/orders/my-orders");

// Payments
export const initiatePayment = (orderId: string) =>
  api.post("/payments/initiate", { orderId });

export const getPaymentStatus = (orderId: string) =>
  api.get(`/payments/status/${orderId}`);

// Auth
export const loginUser = (data: { email: string; password: string }) =>
  api.post("/auth/login", data);

export const registerUser = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post("/auth/register", data);

export const logoutUser = () => api.post("/auth/logout");

export const getMe = () => api.get("/auth/me");
