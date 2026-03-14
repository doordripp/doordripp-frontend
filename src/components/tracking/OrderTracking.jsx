/**
 * Order Tracking Component
 * Real-time order status tracking for customers
 * Shows status timeline: Order Placed → Accepted → Picked Up → Out For Delivery → Delivered
 */

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getOrderDisplayId } from '../../utils/orderUtils';
import './OrderTracking.css';

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || runtimeOrigin;
const API_URL = import.meta.env.VITE_API_URL || (runtimeOrigin ? `${runtimeOrigin}/api` : '/api');


// Use backend status keys for progress logic
const STATUS_FLOW = [
  'confirmed',
  'accepted',
  'picked_up',
  'out_for_delivery',
  'delivered'
];

// Map backend keys to display names and icons
const STATUS_DISPLAY = {
  confirmed: { label: 'Order Placed', icon: '📋' },
  accepted: { label: 'Accepted', icon: '✅' },
  picked_up: { label: 'Picked Up', icon: '📦' },
  out_for_delivery: { label: 'Out For Delivery', icon: '🚚' },
  delivered: { label: 'Delivered', icon: '✔️' }
};

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const tokenRef = useRef(localStorage.getItem('auth_token') || localStorage.getItem('token'));

  // Fetch initial order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const headers = {};
        if (tokenRef.current) {
          headers.Authorization = `Bearer ${tokenRef.current}`;
        }

        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          credentials: 'include',
          headers
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        
        const data = await response.json();
        const fetchedOrder = data.order || data;
        setOrder(fetchedOrder);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError('Could not load order details');
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Setup socket connection for real-time updates
  useEffect(() => {
    if (!orderId) return;

    const socket = io(SOCKET_URL, {
      auth: { token: tokenRef.current },
      reconnection: true,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[OrderTracking] Socket connected');
      // Join this order's room for updates
      socket.emit('joinOrderRoom', orderId);
    });

    socket.on('orderStatusUpdated', (data) => {
      console.log('[OrderTracking] Status updated:', data);
      if (data.orderId === orderId || data.orderId.toString() === orderId) {
        // Update order state with new status
        setOrder(prev => ({
          ...prev,
          deliveryStatus: data.status,
          statusHistory: data.statusHistory || prev.statusHistory
        }));
      }
    });

    socket.on('disconnect', () => {
      console.log('[OrderTracking] Socket disconnected');
    });

    socket.on('error', (error) => {
      console.error('[OrderTracking] Socket error:', error);
    });

    return () => {
      socket.emit('leaveOrderRoom', orderId);
      socket.disconnect();
    };
  }, [orderId]);


  const getStatusIndex = (status) => STATUS_FLOW.indexOf(status);

  const isStatusComplete = (status) => {
    if (!order?.deliveryStatus) return false;
    const currentIndex = getStatusIndex(order.deliveryStatus);
    const checkIndex = getStatusIndex(status);
    return checkIndex <= currentIndex;
  };


  const getStatusIcon = (status) => STATUS_DISPLAY[status]?.icon || '📋';

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getStatusTime = (status) => {
    if (!order?.statusHistory) return null;
    const entry = order.statusHistory.find(h => h.status === status);
    return entry ? formatDate(entry.timestamp) : null;
  };

  if (loading) {
    return (
      <div className="order-tracking">
        <div className="container">
          <div className="loading-spinner">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-tracking">
        <div className="container">
          <div className="error-box">
            <p>{error}</p>
            <button onClick={() => navigate('/orders')} className="btn-primary">
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-tracking">
        <div className="container">
          <div className="error-box">
            <p>Order not found</p>
            <button onClick={() => navigate('/orders')} className="btn-primary">
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking">
      <div className="container">
        <div className="header">
          <button onClick={() => navigate('/orders')} className="btn-back">
            ← Back to Orders
          </button>
          <h1>Track Your Order</h1>
        </div>

        {/* Order Summary Card */}
        <div className="order-summary-card">
          <div className="order-id">
            <span className="label">Order ID:</span>
            <span className="value">{getOrderDisplayId(order)}</span>
          </div>
          <div className="order-info">
            <div className="info-item">
              <span className="label">Order Date:</span>
              <span className="value">{formatDate(order.createdAt)}</span>
            </div>
            <div className="info-item">
              <span className="label">Total Amount:</span>
              <span className="value">₹{order.total?.toFixed(2)}</span>
            </div>
            <div className="info-item">
              <span className="label">Items:</span>
              <span className="value">{order.items?.length || 0} items</span>
            </div>
          </div>
        </div>

        {/* Current Status Banner */}
        <div className="current-status-banner">
          <div className="status-icon">{getStatusIcon(order.deliveryStatus)}</div>
          <div className="status-info">
            <h2>Current Status</h2>
            <p className="status-text">{STATUS_DISPLAY[order.deliveryStatus]?.label || 'Order Placed'}</p>
            {order.deliveryStatus === 'delivered' && (
              <p className="status-subtext">Your order has been delivered!</p>
            )}
            {order.deliveryStatus === 'out_for_delivery' && (
              <p className="status-subtext">Your order is on its way!</p>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="status-timeline">
          <h3>Order Progress</h3>
          <div className="timeline">
            {(() => {
              const currentIndex = STATUS_FLOW.indexOf(order.deliveryStatus);
              return STATUS_FLOW.map((status, index) => {
                const isComplete = index < currentIndex;
                const isCurrent = index === currentIndex;
                const statusTime = getStatusTime(status);
                return (
                  <div
                    key={status}
                    className={`timeline-item${isComplete ? ' complete' : ''}${isCurrent ? ' current' : ''}`}
                  >
                    <div className="timeline-marker">
                      <div className={`marker-circle${isComplete ? ' complete' : ''}${isCurrent ? ' current' : ''}`}> 
                        {isComplete ? (
                          <span className="marker-tick">✓</span>
                        ) : (
                          index + 1
                        )}
                      </div>
                      {index < STATUS_FLOW.length - 1 && (
                        <div className={`marker-line${isComplete ? ' complete' : ''}`} />
                      )}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-status">
                        <span className="status-icon-small">{getStatusIcon(status)}</span>
                        <span className="status-name">{STATUS_DISPLAY[status]?.label || status}</span>
                      </div>
                      {statusTime && (
                        <div className="timeline-time">{statusTime}</div>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Delivery Address */}
        {order.shippingAddress && (
          <div className="delivery-address-card">
            <h3>Delivery Address</h3>
            <div className="address-content">
              <p className="address-name">{order.shippingAddress.name}</p>
              <p className="address-line">{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && (
                <p className="address-line">{order.shippingAddress.line2}</p>
              )}
              <p className="address-line">
                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
              <p className="address-phone">📞 {order.shippingAddress.phone}</p>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="order-items-card">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.items?.map((item, index) => (
              <div key={index} className="item">
                <img src={item.image} alt={item.name} className="item-image" />
                <div className="item-info">
                  <p className="item-name">{item.name}</p>
                  <p className="item-qty">Quantity: {item.quantity}</p>
                </div>
                <div className="item-price">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Partner Info (if assigned) */}
        {order.deliveryPartner?.name && (
          <div className="delivery-partner-card">
            <h3>Delivery Partner</h3>
            <div className="partner-info">
              {order.deliveryPartner.photo && (
                <img src={order.deliveryPartner.photo} alt={order.deliveryPartner.name} className="partner-photo" />
              )}
              <div>
                <p className="partner-name">{order.deliveryPartner.name}</p>
                {order.deliveryPartner.phone && (
                  <p className="partner-phone">📞 {order.deliveryPartner.phone}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
