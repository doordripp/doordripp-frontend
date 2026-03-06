/**
 * Delivery Partner Dashboard - My Orders
 * Shows orders assigned to the logged-in delivery partner
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socketService from '../../services/socketService';
import './DeliveryOrders.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchMyOrders();

    // Connect to socket.io for real-time updates
    const token = localStorage.getItem('accessToken');
    if (token) {
      socketService.connect(token);

      // Listen for order status updates
      socketService.onOrderStatusUpdate((data) => {
        console.log('Order status updated:', data);
        fetchMyOrders();
      });

      // Listen for new assignments
      socketService.onOrderAssigned((data) => {
        console.log('Order assigned:', data);
        fetchMyOrders();
      });

      // Listen for unassignments
      socketService.onOrderUnassigned((data) => {
        console.log('Order unassigned:', data);
        fetchMyOrders();
      });
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, [statusFilter]);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/delivery/my-orders`, {
        params: { status: statusFilter },
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.ok) {
        setOrders(response.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, note) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.put(
        `${API_URL}/delivery/orders/${orderId}/status`,
        { status: newStatus, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ok) {
        alert('Order status updated successfully');
        fetchMyOrders();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24',
      confirmed: '#60a5fa',
      packed: '#a78bfa',
      processing: '#f97316',
      shipped: '#3b82f6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✅',
      packed: '📦',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '✔️',
      cancelled: '❌'
    };
    return icons[status] || '📋';
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
        <button onClick={fetchMyOrders} className="btn-refresh">
          🔄 Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="status-filter">
        {['all', 'packed', 'processing', 'shipped'].map((status) => (
          <button
            key={status}
            className={`filter-btn ${statusFilter === status ? 'active' : ''}`}
            onClick={() => setStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Orders List */}
      <div className="orders-grid">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders assigned to you yet</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <h3>Order #{order._id.slice(-6)}</h3>
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusIcon(order.status)} {order.status}
                </span>
              </div>

              <div className="order-details">
                <div className="detail-row">
                  <span className="label">Customer:</span>
                  <span className="value">{order.customer?.name || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Total:</span>
                  <span className="value">₹{order.total}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Items:</span>
                  <span className="value">{order.items?.length || 0}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span className="value">
                    {order.shippingAddress?.city}, {order.shippingAddress?.pincode}
                  </span>
                </div>
              </div>

              <div className="order-actions">
                {order.status === 'packed' && (
                  <button
                    className="btn-action btn-processing"
                    onClick={() => updateOrderStatus(order._id, 'processing', 'Started processing')}
                  >
                    Start Processing
                  </button>
                )}
                {order.status === 'processing' && (
                  <button
                    className="btn-action btn-shipped"
                    onClick={() => updateOrderStatus(order._id, 'shipped', 'Out for delivery')}
                  >
                    Mark as Shipped
                  </button>
                )}
                {order.status === 'shipped' && (
                  <button
                    className="btn-action btn-track"
                    onClick={() => setSelectedOrder(order)}
                  >
                    Track & Deliver
                  </button>
                )}
                <button
                  className="btn-action btn-view"
                  onClick={() => setSelectedOrder(order)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={fetchMyOrders}
        />
      )}
    </div>
  );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, onClose, onUpdate }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order #{order._id.slice(-8)}</h2>
          <button className="btn-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <section className="info-section">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> {order.customer?.name}</p>
            <p><strong>Email:</strong> {order.customer?.email}</p>
            <p><strong>Phone:</strong> {order.customer?.phone}</p>
          </section>

          <section className="info-section">
            <h3>Delivery Address</h3>
            <p>{order.shippingAddress?.line1}</p>
            {order.shippingAddress?.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.pincode}
            </p>
          </section>

          <section className="info-section">
            <h3>Order Items</h3>
            {order.items?.map((item, idx) => (
              <div key={idx} className="item-row">
                <span>{item.name}</span>
                <span>×{item.quantity}</span>
                <span>₹{item.price}</span>
              </div>
            ))}
            <div className="item-row total">
              <strong>Total:</strong>
              <strong>₹{order.total}</strong>
            </div>
          </section>

          {order.status === 'shipped' && (
            <section className="info-section">
              <a
                href={`/delivery/track/${order._id}`}
                className="btn-primary btn-block"
                target="_blank"
                rel="noopener noreferrer"
              >
                📍 Open Live Tracking
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryOrders;
