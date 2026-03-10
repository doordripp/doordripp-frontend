/**
 * Socket.io Client Connection
 * Real-time communication for order updates and location tracking
 */

import { io } from 'socket.io-client';

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || runtimeOrigin;
const isDev = import.meta.env.DEV;

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  /**
   * Connect to socket.io server with authentication
   */
  connect(token) {
    if (this.socket?.connected) {
      if (isDev) console.log('[Socket] Already connected');
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      if (isDev) console.log('[Socket] Connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      if (isDev) console.log('[Socket] Disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });

    // Pong handler for keep-alive
    this.socket.on('pong', () => {
      if (isDev) console.log('[Socket] Pong received');
    });

    return this.socket;
  }

  /**
   * Disconnect from socket.io server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      if (isDev) console.log('[Socket] Disconnected');
    }
  }

  /**
   * Join order tracking room (for customers)
   */
  joinOrderTracking(orderId, token) {
    if (!this.socket?.connected) {
      console.error('[Socket] Not connected');
      return;
    }

    this.socket.emit('customerJoinTracking', { orderId, token });
    if (isDev) console.log('[Socket] Joined order tracking:', orderId);
  }

  /**
   * Join as delivery partner (rider)
   */
  joinAsRider(orderId, token) {
    if (!this.socket?.connected) {
      console.error('[Socket] Not connected');
      return;
    }

    this.socket.emit('riderJoinTracking', { orderId, token });
    if (isDev) console.log('[Socket] Joined as rider:', orderId);
  }

  /**
   * Update rider location
   */
  updateRiderLocation(data) {
    if (!this.socket?.connected) {
      console.error('[Socket] Not connected');
      return;
    }

    this.socket.emit('riderLocationUpdate', data);
  }

  /**
   * Listen for order status updates
   */
  onOrderStatusUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('order-status-updated', callback);
  }

  /**
   * Listen for order assignment
   */
  onOrderAssigned(callback) {
    if (!this.socket) return;
    this.socket.on('order-assigned', callback);
  }

  /**
   * Listen for order unassignment
   */
  onOrderUnassigned(callback) {
    if (!this.socket) return;
    this.socket.on('order-unassigned', callback);
  }

  /**
   * Listen for delivery partner location updates
   */
  onPartnerLocationUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('partner-location-update', callback);
  }

  /**
   * Listen for location updates (tracking)
   */
  onLocationUpdate(callback) {
    if (!this.socket) return;
    this.socket.on('locationUpdated', callback);
  }

  /**
   * Listen for current rider location
   */
  onCurrentRiderLocation(callback) {
    if (!this.socket) return;
    this.socket.on('currentRiderLocation', callback);
  }

  /**
   * Listen for order delivered event
   */
  onOrderDelivered(callback) {
    if (!this.socket) return;
    this.socket.on('order-delivered', callback);
  }

  /**
   * Listen for rider online status
   */
  onRiderOnline(callback) {
    if (!this.socket) return;
    this.socket.on('riderOnline', callback);
  }

  /**
   * Listen for customer online status
   */
  onCustomerOnline(callback) {
    if (!this.socket) return;
    this.socket.on('customerOnline', callback);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  /**
   * Remove specific listener
   */
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  /**
   * Send ping to keep connection alive
   */
  ping() {
    if (this.socket?.connected) {
      this.socket.emit('ping');
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
export default new SocketService();
