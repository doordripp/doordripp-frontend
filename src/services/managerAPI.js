import api from './api'

const managerAPI = {
  // Delivery Partners
  getDeliveryPartners: async (q = {}) => (await api.get('/manager/delivery-partners', { params: q })).data,
  getDeliveryPartner: async (id) => (await api.get(`/manager/delivery-partners/${id}`)).data,
  createDeliveryPartner: async (data) => (await api.post('/manager/delivery-partners', data)).data,
  updateDeliveryPartner: async (id, data) => (await api.put(`/manager/delivery-partners/${id}`, data)).data,
  deleteDeliveryPartner: async (id) => (await api.delete(`/manager/delivery-partners/${id}`)).data,
  updateDeliveryPartnerSchedule: async (id, data) =>
    (await api.put(`/manager/delivery-partners/${id}/schedule`, data)).data,

  // Order Assignment
  assignOrder: async (partnerId, orderId) => (await api.post(`/manager/delivery-partners/${partnerId}/assign-order`, { orderId: String(orderId || '').trim() })).data,
  unassignOrder: async (partnerId, orderId) => (await api.delete(`/manager/delivery-partners/${partnerId}/unassign-order/${orderId}`)).data,

  // Delivery partner's own schedule (used by delivery panel)
  getMySchedule: async () => (await api.get('/manager/delivery-partners/me/schedule')).data,
  updateMySchedule: async (data) => (await api.put('/manager/delivery-partners/me/schedule', data)).data,
}

export default managerAPI
