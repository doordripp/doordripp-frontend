// src/services/adminAPI.js
import api from "./api";
// testing purpose
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
  assignDeliveryPartner: async (orderId, partnerId) => (await api.post(`/admin/orders/${orderId}/assign`, { deliveryPartnerId: partnerId })).data,
  unassignDeliveryPartner: async (orderId) => (await api.post(`/admin/orders/${orderId}/unassign`, {})).data,

  // Users
  updateUser: async (id, data) => (await api.put(`/admin/users/${id}`, data)).data,
  deleteUser: async (id) => (await api.delete(`/admin/users/${id}`)).data,

  // User Management
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

  // Vouchers / Coupons
  getVouchers: async (q = {}) => (await api.get("/admin/vouchers", { params: q })).data,
  createVoucher: async (data) => (await api.post("/admin/vouchers", data)).data,
  toggleVoucherStatus: async (id) => (await api.patch(`/admin/vouchers/${id}/toggle`)).data,

  // Delivery Zones
  getDeliveryZones: async (q = {}) => (await api.get("/admin/delivery-zones", { params: q })).data,
  getDeliveryZone: async (id) => (await api.get(`/admin/delivery-zones/${id}`)).data,
  createDeliveryZone: async (data) => (await api.post("/admin/delivery-zones", data)).data,
  updateDeliveryZone: async (id, data) => (await api.put(`/admin/delivery-zones/${id}`, data)).data,
  deleteDeliveryZone: async (id) => (await api.delete(`/admin/delivery-zones/${id}`)).data,
  toggleDeliveryZoneStatus: async (id) => (await api.patch(`/admin/delivery-zones/${id}/toggle`)).data,
  getDeliveryZoneStats: async () => (await api.get("/admin/delivery-zones/stats")).data,

  // Banners & Content
  getBanners: async (q = {}) => (await api.get("/content/banners", { params: q })).data,
  createBanner: async (data) => (await api.post("/content/banners", data)).data,
  updateBanner: async (id, data) => (await api.put(`/content/banners/${id}`, data)).data,
  updateBannerStatus: async (id, isActive) => (await api.patch(`/content/banners/${id}`, { isActive })).data,
  deleteBanner: async (id) => (await api.delete(`/content/banners/${id}`)).data,

  // Categories
  getCategories: async (q = {}) => (await api.get("/content/categories", { params: q })).data,
  createCategory: async (data) => (await api.post("/content/categories", data)).data,
  updateCategoryStatus: async (id, isActive) => (await api.patch(`/content/categories/${id}`, { isActive })).data,
  deleteCategory: async (id) => (await api.delete(`/content/categories/${id}`)).data,
};

export default adminAPI;
