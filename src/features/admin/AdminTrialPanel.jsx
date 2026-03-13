/**
 * Admin Trial Room Panel
 * 
 * Admin interface to view and manage:
 * - All trial room orders
 * - Trial analytics
 * - Revenue tracking
 * - Most trialed items
 * 
 * @component
 */

import { useEffect, useState } from 'react';
import api from '../../services/api';
import './AdminTrialPanel.css';

export function AdminTrialPanel() {
  const [trials, setTrials] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trials');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch trials
      let trialsUrl = `/trial-room/admin/list?page=1&limit=50`;
      if (filter !== 'all') {
        trialsUrl += `&status=${filter}`;
      }

      const [trialsRes, analyticsRes] = await Promise.all([
        api.get(trialsUrl),
        api.get(`/trial-room/admin/analytics`)
      ]);

      setTrials(trialsRes.data.data || []);
      setAnalytics(analyticsRes.data.data || {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data');
      console.error('Admin Trial Panel Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      trial_created: '#3b82f6',
      converted_to_order: '#10b981',
      trial_abandoned: '#6b7280',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="admin-trial-panel">
      {/* Tab Navigation */}
      <div className="admin-trial-tabs">
        <button
          className={`tab-btn ${activeTab === 'trials' ? 'active' : ''}`}
          onClick={() => setActiveTab('trials')}
        >
          📋 All Trials
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="admin-trial-loading">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="admin-trial-error">
          <p>❌ {error}</p>
          <button onClick={loadData} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Trials Tab */}
      {activeTab === 'trials' && !loading && !error && (
        <div className="admin-trial-content">
          {/* Filters */}
          <div className="trial-filters">
            {['all', 'trial_created', 'converted_to_order', 'cancelled'].map(status => (
              <button
                key={status}
                className={`filter-btn ${filter === status ? 'active' : ''}`}
                onClick={() => setFilter(status)}
              >
                {status === 'all' && 'All Trials'}
                {status === 'trial_created' && 'Active'}
                {status === 'converted_to_order' && 'Converted'}
                {status === 'cancelled' && 'Cancelled'}
              </button>
            ))}
          </div>

          {/* Trials Table */}
          {trials.length === 0 ? (
            <p className="empty-msg">No trials found</p>
          ) : (
            <div className="trials-table-container">
              <table className="trials-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {trials.map(trial => (
                    <tr key={trial._id}>
                      <td>
                        <strong>{trial.userId?.name}</strong>
                        <small>{trial.userId?.email}</small>
                      </td>
                      <td>{trial.trialItems?.length || 0} items</td>
                      <td className="amount">
                        ₹{trial.finalTotal?.toLocaleString('en-IN')}
                        <span className="fee-badge">+₹{trial.trialFee} fee</span>
                      </td>
                      <td>
                        <span
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(trial.status) }}
                        >
                          {trial.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{formatDate(trial.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && !loading && !error && analytics && (
        <div className="admin-trial-analytics">
          {/* Key Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-value">{analytics.totalTrials || 0}</div>
              <div className="metric-label">Total Trials</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.todayTrials || 0}</div>
              <div className="metric-label">Today's Trials</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.convertedTrials || 0}</div>
              <div className="metric-label">Converted</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.conversionRate}</div>
              <div className="metric-label">Conversion Rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">
                ₹{(analytics.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="metric-label">Total Revenue</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{analytics.monthTrials || 0}</div>
              <div className="metric-label">This Month</div>
            </div>
          </div>

          {/* Most Trialed Items */}
          <div className="most-trialed">
            <h3>Most Trialed Items</h3>
            {analytics.mostTrialedItems && analytics.mostTrialedItems.length > 0 ? (
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Trial Count</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.mostTrialedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName || 'Unknown'}</td>
                      <td className="count">{item.trialCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-msg">No data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTrialPanel;
