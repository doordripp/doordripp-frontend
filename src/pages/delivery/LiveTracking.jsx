/**
 * Live Tracking Component
 * Shows delivery partner location on map in real-time
 * Uses Leaflet for map rendering
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import socketService from '../../services/socketService';
import { getOrderDisplayId } from '../../utils/orderUtils';
import './LiveTracking.css';

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const rawApiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || runtimeOrigin;
const API_URL = /\/api\/?$/.test(rawApiBase) ? rawApiBase.replace(/\/+$/, '') : `${rawApiBase.replace(/\/+$/, '')}/api`;
const getStoredToken = () => localStorage.getItem('auth_token') || localStorage.getItem('accessToken');

const LiveTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
    connectToTracking();

    return () => {
      stopTracking();
      socketService.removeAllListeners();
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = getStoredToken();
      const response = await axios.get(
        `${API_URL}/delivery/my-orders?orderId=${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.ok && response.data.orders.length > 0) {
        setOrder(response.data.orders[0]);

        // Set initial rider location from order data
        if (response.data.orders[0].deliveryPartner?.location) {
          setRiderLocation(response.data.orders[0].deliveryPartner.location);
        }
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const connectToTracking = () => {
    const token = getStoredToken();
    if (token) {
      socketService.connect(token);
      socketService.joinAsRider(orderId, token);

      // Listen for location updates from other clients
      socketService.onPartnerLocationUpdate((data) => {
        if (data.orderId === orderId) {
          setRiderLocation({ lat: data.lat, lng: data.lng });
          setLocationHistory((prev) => [
            ...prev,
            { lat: data.lat, lng: data.lng, timestamp: data.timestamp }
          ]);
        }
      });

      socketService.onLocationUpdate((data) => {
        if (data.orderId === orderId) {
          setRiderLocation({ lat: data.lat, lng: data.lng });
        }
      });
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, accuracy } = position.coords;

        const locationData = {
          lat: latitude,
          lng: longitude,
          orderId,
          speed: speed || 0,
          accuracy: accuracy || 0
        };

        // Update locally
        setRiderLocation({ lat: latitude, lng: longitude });
        setLocationHistory((prev) => [
          ...prev,
          { lat: latitude, lng: longitude, timestamp: new Date() }
        ]);

        // Send to server via REST API
        updateLocationToServer(locationData);

        // Also emit via socket for real-time update
        socketService.updateRiderLocation(locationData);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Failed to get your location. Please enable location services.');
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  };

  const updateLocationToServer = async (locationData) => {
    try {
      const token = getStoredToken();
      await axios.post(`${API_URL}/delivery/location`, locationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  const openInGoogleMaps = () => {
    if (order?.shippingAddress?.latitude && order?.shippingAddress?.longitude) {
      const { latitude, longitude } = order.shippingAddress;
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    } else {
      alert('Destination coordinates not available');
    }
  };

  if (loading) {
    return (
      <div className="live-tracking">
        <div className="loading">Loading tracking information...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="live-tracking">
        <div className="error-message">{error || 'Order not found'}</div>
        <button onClick={() => navigate('/delivery/orders')} className="btn-back">
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="live-tracking">
      <div className="tracking-header">
        <button onClick={() => navigate('/delivery/orders')} className="btn-back">
          ← Back
        </button>
        <h1>Live Tracking</h1>
        <span className="order-id">Order {getOrderDisplayId(order)}</span>
      </div>

      {/* Map Container */}
      <div className="map-container">
        <LeafletMap
          riderLocation={riderLocation}
          destinationLocation={
            order.shippingAddress?.latitude && order.shippingAddress?.longitude
              ? {
                  lat: order.shippingAddress.latitude,
                  lng: order.shippingAddress.longitude
                }
              : null
          }
          locationHistory={locationHistory}
          mapRef={mapRef}
        />
      </div>

      {/* Tracking Controls */}
      <div className="tracking-controls">
        {!isTracking ? (
          <button onClick={startTracking} className="btn-start-tracking">
            📍 Start Live Tracking
          </button>
        ) : (
          <button onClick={stopTracking} className="btn-stop-tracking">
            ⏹️ Stop Tracking
          </button>
        )}
        <button onClick={openInGoogleMaps} className="btn-navigate">
          🗺️ Open in Google Maps
        </button>
      </div>

      {/* Order Details Card */}
      <div className="order-info-card">
        <h3>Delivery Details</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">Customer:</span>
            <span className="value">{order.customer?.name}</span>
          </div>
          <div className="info-item">
            <span className="label">Phone:</span>
            <span className="value">{order.customer?.phone || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="label">Address:</span>
            <span className="value">
              {order.shippingAddress?.line1}, {order.shippingAddress?.city}
            </span>
          </div>
          <div className="info-item">
            <span className="label">Total:</span>
            <span className="value">₹{order.total}</span>
          </div>
        </div>

        {isTracking && (
          <div className="tracking-status">
            <span className="status-indicator active"></span>
            <span>Live tracking active</span>
          </div>
        )}
      </div>

      {/* Complete Delivery Button */}
      {order.status === 'shipped' && (
        <button
          onClick={() => navigate(`/delivery/proof/${orderId}`)}
          className="btn-complete-delivery"
        >
          ✅ Complete Delivery & Upload Proof
        </button>
      )}
    </div>
  );
};

// Simple Leaflet Map Component (can be replaced with actual Leaflet implementation)
const LeafletMap = ({ riderLocation, destinationLocation, locationHistory, mapRef }) => {
  useEffect(() => {
    // This is a placeholder. In production, use react-leaflet or Leaflet.js
    // Example: Initialize map with Leaflet and add markers
    console.log('Map data:', { riderLocation, destinationLocation, locationHistory });
  }, [riderLocation, destinationLocation, locationHistory]);

  return (
    <div className="map-view" ref={mapRef}>
      <div className="map-placeholder">
        <p>🗺️ Map View</p>
        {riderLocation && (
          <div className="location-info">
            <p><strong>Your Location:</strong></p>
            <p>Lat: {riderLocation.lat.toFixed(6)}</p>
            <p>Lng: {riderLocation.lng.toFixed(6)}</p>
          </div>
        )}
        {destinationLocation && (
          <div className="location-info">
            <p><strong>Destination:</strong></p>
            <p>Lat: {destinationLocation.lat.toFixed(6)}</p>
            <p>Lng: {destinationLocation.lng.toFixed(6)}</p>
          </div>
        )}
        <p className="map-note">
          <em>
            Note: Integrate with Leaflet.js or Google Maps API for production use.
            <br />
            Install: npm install react-leaflet leaflet
          </em>
        </p>
      </div>
    </div>
  );
};

export default LiveTracking;
