/**
 * Delivery Analytics Dashboard
 * Comprehensive analytics for admin to track delivery operations
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DeliveryAnalytics.css';

const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
const API_URL = import.meta.env.VITE_API_URL || runtimeOrigin;

const DeliveryAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await axios.get(`${API_URL}/api/admin/delivery-analytics`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.ok) {
        setAnalytics(response.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchAnalytics();
  };

  if (loading && !analytics) {
    return (
      <div className="delivery-analytics">
        <div className="loading">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="delivery-analytics">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="delivery-analytics">
      <div className="analytics-header">
        <h1>📊 Delivery Analytics</h1>
        <div className="date-filter">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="date-input"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="date-input"
          />
          <button onClick={handleDateFilter} className="btn-filter">
            Apply Filter
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard
          title="Total Orders"
          value={analytics?.summary?.totalOrders || 0}
          icon="📦"
          color="#3b82f6"
        />
        <SummaryCard
          title="Delivered"
          value={analytics?.summary?.deliveredOrders || 0}
          icon="✅"
          color="#10b981"
        />
        <SummaryCard
          title="Pending"
          value={analytics?.summary?.pendingOrders || 0}
          icon="⏳"
          color="#f59e0b"
        />
        <SummaryCard
          title="Today's Deliveries"
          value={analytics?.summary?.deliveriesToday || 0}
          icon="🚚"
          color="#8b5cf6"
        />
        <SummaryCard
          title="Delivery Rate"
          value={analytics?.summary?.deliveryRate || '0%'}
          icon="📈"
          color="#06b6d4"
        />
        <SummaryCard
          title="Avg Delivery Time"
          value={analytics?.performance?.avgDeliveryTime || '0 min'}
          icon="⏱️"
          color="#ec4899"
        />
      </div>

      {/* Top Partners */}
      <div className="section-card">
        <h2>🏆 Top Delivery Partners</h2>
        <div className="partners-table">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Partner</th>
                <th>Deliveries</th>
                <th>Total Revenue</th>
                <th>Avg Order Value</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.topPartners?.map((partner, index) => (
                <tr key={partner._id}>
                  <td className="rank">#{index + 1}</td>
                  <td>
                    <div className="partner-info">
                      <strong>{partner.name}</strong>
                      <span className="partner-email">{partner.email}</span>
                    </div>
                  </td>
                  <td className="deliveries">{partner.deliveries}</td>
                  <td className="revenue">₹{partner.totalRevenue?.toFixed(2)}</td>
                  <td className="avg-value">₹{partner.avgOrderValue?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Performance */}
      <div className="section-card">
        <h2>📊 Partner Performance (Success Rate)</h2>
        <div className="performance-grid">
          {analytics?.partnerPerformance?.map((partner) => (
            <div key={partner._id} className="performance-card">
              <div className="performance-header">
                <strong>{partner.name}</strong>
                <span className="success-rate" style={{ color: getSuccessRateColor(partner.successRate) }}>
                  {partner.successRate?.toFixed(1)}%
                </span>
              </div>
              <div className="performance-stats">
                <div className="stat">
                  <span className="stat-label">Assigned:</span>
                  <span className="stat-value">{partner.totalAssigned}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Delivered:</span>
                  <span className="stat-value delivered">{partner.delivered}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Cancelled:</span>
                  <span className="stat-value cancelled">{partner.cancelled}</span>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${partner.successRate}%`,
                    background: getSuccessRateColor(partner.successRate)
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone Statistics */}
      <div className="zones-section">
        <div className="section-card">
          <h2>⚡ Fastest Delivery Zones</h2>
          <div className="zones-list">
            {analytics?.zones?.fastest?.map((zone, index) => (
              <div key={zone.zoneId} className="zone-item fastest">
                <span className="zone-rank">#{index + 1}</span>
                <div className="zone-info">
                  <strong>{zone.zone}</strong>
                  <span className="zone-time">{zone.avgTimeFormatted}</span>
                </div>
                <span className="zone-orders">{zone.orderCount} orders</span>
              </div>
            ))}
          </div>
        </div>

        <div className="section-card">
          <h2>🐌 Slowest Delivery Zones</h2>
          <div className="zones-list">
            {analytics?.zones?.slowest?.map((zone, index) => (
              <div key={zone.zoneId} className="zone-item slowest">
                <span className="zone-rank">#{index + 1}</span>
                <div className="zone-info">
                  <strong>{zone.zone}</strong>
                  <span className="zone-time">{zone.avgTimeFormatted}</span>
                </div>
                <span className="zone-orders">{zone.orderCount} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="section-card">
        <h2>📋 Order Status Breakdown</h2>
        <div className="status-grid">
          {Object.entries(analytics?.statusBreakdown || {}).map(([status, count]) => (
            <div key={status} className="status-card">
              <span className="status-icon">{getStatusIcon(status)}</span>
              <div className="status-info">
                <span className="status-name">{status}</span>
                <span className="status-count">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Trends */}
      <div className="section-card">
        <h2>📈 Daily Trends (Last 7 Days)</h2>
        <div className="trends-chart">
          {analytics?.dailyTrends?.map((day) => (
            <div key={day._id} className="trend-bar">
              <div className="trend-label">{formatDate(day._id)}</div>
              <div className="trend-values">
                <div className="trend-item">
                  <span>Orders: {day.totalOrders}</span>
                  <div className="mini-bar" style={{ width: `${(day.totalOrders / 50) * 100}%` }} />
                </div>
                <div className="trend-item">
                  <span>Delivered: {day.delivered}</span>
                  <div className="mini-bar delivered" style={{ width: `${(day.delivered / 50) * 100}%` }} />
                </div>
                <div className="trend-item">
                  <span>Revenue: ₹{day.revenue?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Summary Card Component
const SummaryCard = ({ title, value, icon, color }) => (
  <div className="summary-card" style={{ borderColor: color }}>
    <div className="summary-icon" style={{ background: color }}>
      {icon}
    </div>
    <div className="summary-content">
      <span className="summary-title">{title}</span>
      <span className="summary-value">{value}</span>
    </div>
  </div>
);

// Helper Functions
const getSuccessRateColor = (rate) => {
  if (rate >= 90) return '#10b981';
  if (rate >= 75) return '#3b82f6';
  if (rate >= 60) return '#f59e0b';
  return '#ef4444';
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

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default DeliveryAnalytics;
