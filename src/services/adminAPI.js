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

  // User Management - New Functions
  getAllUsers: async (q = {}) => (await api.get("/admin/users", { params: q })).data,
  getUserDetails: async (userId) => (await api.get(`/admin/users/${userId}`)).data,
  changeUserRole: async (userId, roles) => (await api.put(`/admin/users/${userId}/role`, { roles })).data,
  banUser: async (userId, reason) => (await api.post(`/admin/users/${userId}/ban`, { reason })).data,
  unbanUser: async (userId) => (await api.post(`/admin/users/${userId}/unban`, {})).data,

  // Area Manager Assignment
  assignManagerToArea: async (data) => (await api.post("/admin/area-managers", data)).data,
  removeManagerFromArea: async (assignmentId) => (await api.delete(`/admin/area-managers/${assignmentId}`)).data,
  getAreaManagerAssignments: async (q = {}) => (await api.get("/admin/area-managers", { params: q })).data,

  // Reports (best sellers)
  getBestSellers: async (q = {}) => (await api.get("/admin/reports/best-sellers", { params: q })).data,

  // Delivery Zones
  getDeliveryZones: async (q = {}) => (await api.get("/admin/delivery-zones", { params: q })).data,
  getDeliveryZone: async (id) => (await api.get(`/admin/delivery-zones/${id}`)).data,
  createDeliveryZone: async (data) => (await api.post("/admin/delivery-zones", data)).data,
  updateDeliveryZone: async (id, data) => (await api.put(`/admin/delivery-zones/${id}`, data)).data,
  deleteDeliveryZone: async (id) => (await api.delete(`/admin/delivery-zones/${id}`)).data,
  toggleDeliveryZoneStatus: async (id) => (await api.patch(`/admin/delivery-zones/${id}/toggle`)).data,
  getDeliveryZoneStats: async () => (await api.get("/admin/delivery-zones/stats")).data,
};

export default adminAPI;