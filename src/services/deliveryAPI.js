import api from './api'

// Delivery-partner focused API for their own view, separate from admin/manager
const deliveryAPI = {
  // Orders assigned to the logged-in delivery partner
  getMyOrders: async () => (await api.get('/delivery-partner/orders')).data,
  // Update status of one of my orders
  updateOrderStatus: async (orderId, status) =>
    (await api.patch(`/delivery-partner/orders/${orderId}/status`, { status })).data,
}

export default deliveryAPI

