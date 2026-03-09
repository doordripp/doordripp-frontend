/**
 * Delivery Partner Dashboard - My Orders
 * Shows orders assigned to the logged-in delivery partner
 * Allows updating delivery status: Accepted → Picked Up → Out For Delivery → Delivered
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './DeliveryOrders.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchMyOrders();
    fetchStats();

    // Connect to socket.io for real-time updates
    const token = localStorage.getItem('token');
    if (token) {
      const socket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true
      });

      socket.on('connect', () => {
        console.log('[DeliveryPartner] Socket connected');
      });

      socket.on('orderStatusUpdated', (data) => {
        console.log('[DeliveryPartner] Order status updated:', data);
        // Refresh orders when any order status changes
        fetchMyOrders();
        fetchStats();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/delivery-partner/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrders(response.data.orders);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/delivery-partner/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Update order status to "${newStatus}"?`)) {
      return;
    }

    try {
      setUpdatingOrder(orderId);
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${API_URL}/delivery-partner/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert(`Order status updated to ${newStatus}`);
        fetchMyOrders();
        fetchStats();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Order Placed': '#94a3b8',
      'Accepted': '#60a5fa',
      'Picked Up': '#a78bfa',
      'Out For Delivery': '#f97316',
      'Delivered': '#10b981',
      'Cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Order Placed': '📋',
      'Accepted': '✅',
      'Picked Up': '📦',
      'Out For Delivery': '🚚',
      'Delivered': '✔️',
      'Cancelled': '❌'
    };
    return icons[status] || '📋';
  };

  const getNextStatus = (currentStatus) => {
    const flow = {
      'Order Placed': 'Accepted',
      'Accepted': 'Picked Up',
      'Picked Up': 'Out For Delivery',
      'Out For Delivery': 'Delivered'
    };
    return flow[currentStatus];
  };

  const canUpdateStatus = (status) => {
    return status !== 'Delivered' && status !== 'Cancelled';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="delivery-orders">
        <div className="loading">Loading your orders...</div>
      </div>
    );
  }

  return (
    <div className="delivery-orders">
      <div className="header">
        <h1>My Deliveries</h1>
        <button onClick={fetchMyOrders} className="btn-refresh" disabled={loading}>
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.activeOrders}</div>
            <div className="stat-label">Active Orders</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedOrders}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.todayOrders}</div>
            <div className="stat-label">Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* Orders List */}
      <div className="orders-grid">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders assigned to you yet</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <h3>Order #{order.orderId}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.deliveryStatus) }}
                >
                  {getStatusIcon(order.deliveryStatus)} {order.deliveryStatus}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="label">Customer:</span>
                  <span className="value">{order.customer?.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">{order.customer?.phone || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Total:</span>
                  <span className="value">₹{order.total.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Items:</span>
                  <span className="value">{order.items?.length || 0} items</span>
                </div>
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span className="value">
                    {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Ordered:</span>
                  <span className="value">{formatDate(order.createdAt)}</span>
                </div>
              </div>

              <div className="order-actions">
                {canUpdateStatus(order.deliveryStatus) && (
                  <button
                    className="btn-action btn-primary"
                    onClick={() => updateOrderStatus(order.id, getNextStatus(order.deliveryStatus))}
                    disabled={updatingOrder === order.id}
                  >
                    {updatingOrder === order.id
                      ? 'Updating...'
                      : `Mark as ${getNextStatus(order.deliveryStatus)}`}
                  </button>
                )}
                
                <button
                  className="btn-action btn-secondary"
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.orderId}</h2>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.customer?.name}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer?.phone}</p>
              </div>

              <div className="section">
                <h3>Delivery Address</h3>
                <p>{selectedOrder.shippingAddress?.line1}</p>
                {selectedOrder.shippingAddress?.line2 && <p>{selectedOrder.shippingAddress.line2}</p>}
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
              </div>

              <div className="section">
                <h3>Order Items</h3>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="item-row">
                    <img src={item.image} alt={item.name} className="item-image" />
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-details">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                    <div className="item-total">₹{(item.quantity * item.price).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="section">
                <h3>Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{selectedOrder.total.toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <strong>Total:</strong>
                  <strong>₹{selectedOrder.total.toFixed(2)}</strong>
                </div>
              </div>

              {canUpdateStatus(selectedOrder.deliveryStatus) && (
                <button
                  className="btn-action btn-primary btn-full"
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, getNextStatus(selectedOrder.deliveryStatus));
                    setSelectedOrder(null);
                  }}
                  disabled={updatingOrder === selectedOrder.id}
                >
                  {updatingOrder === selectedOrder.id
                    ? 'Updating...'
                    : `Mark as ${getNextStatus(selectedOrder.deliveryStatus)}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrders;

