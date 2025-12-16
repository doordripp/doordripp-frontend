// src/services/adminAPI.js
import api from "./api";

const adminAPI = {
  // Dashboard
  getStats: async () => (await api.get("/admin/dashboard/stats")).data,

  // Products
  getProducts: async (q = {}) => (await api.get("/admin/products", { params: q })).data,
  getProduct: async (id) => (await api.get(`/admin/products/${id}`)).data,
  createProduct: async (data) =>
    (await api.post("/admin/products", data)).data,
  updateProduct: async (id, data) =>
    (await api.put(`/admin/products/${id}`, data)).data,
  deleteProduct: async (id) => (await api.delete(`/admin/products/${id}`)).data,

  // Orders
  getOrders: async (q = {}) => (await api.get("/admin/orders", { params: q })).data,
  getOrder: async (id) => (await api.get(`/admin/orders/${id}`)).data,
  updateOrderStatus: async (id, status) => (await api.put(`/admin/orders/${id}/status`, { status })).data,

  // Customers / Users
  getCustomers: async (q = {}) => (await api.get("/admin/users", { params: q })).data,
  getCustomer: async (id) => (await api.get(`/admin/users/${id}`)).data,
  updateUser: async (id, data) => (await api.put(`/admin/users/${id}`, data)).data,
  deleteUser: async (id) => (await api.delete(`/admin/users/${id}`)).data,

  // Reports (best sellers)
  getBestSellers: async (q = {}) => (await api.get("/admin/reports/best-sellers", { params: q })).data,
};

export default adminAPI;