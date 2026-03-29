import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function adminAxios() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  return axios.create({
    baseURL: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export const adminLogin = (email: string, password: string) =>
  axios.post(`${API_URL}/auth/login`, { email, password });

export const getAdminStats = () => adminAxios().get("/admin/stats");
export const getAdminFinances = () => adminAxios().get("/admin/finances");

export const getAdminProducts = () => adminAxios().get("/admin/products");
export const getAdminProduct = (id: string) => adminAxios().get(`/admin/products/${id}`);
export const createProduct = (data: object) => adminAxios().post("/admin/products", data);
export const updateProduct = (id: string, data: object) => adminAxios().put(`/admin/products/${id}`, data);
export const deleteProduct = (id: string) => adminAxios().delete(`/admin/products/${id}`);

export const getAdminOrders = () => adminAxios().get("/admin/orders");
export const updateOrderStatus = (id: string, status: string) =>
  adminAxios().put(`/admin/orders/${id}/status`, { status });

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  return adminAxios().post("/admin/upload", formData);
};

// User management (super_admin only)
export const getAdminUsers = () => adminAxios().get("/admin/users");
export const createAdminUser = (data: { name: string; username: string; password: string; role: string }) =>
  adminAxios().post("/admin/users", data);
export const updateUserRole = (id: string, role: string) =>
  adminAxios().put(`/admin/users/${id}/role`, { role });
export const revokeUserAccess = (id: string) => adminAxios().delete(`/admin/users/${id}`);
