/**
 * Trial Room Page
 * 
 * Dedicated full-page experience for trial room
 * - Create and manage trial room
 * - View trial history
 * - Browse products to add
 * 
 * @component
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrial } from '../../context/TrialContext';
import { useNavigate } from 'react-router-dom';
import { TrialItemCard } from './TrialItemCard';
import axios from 'axios';
import './styles/TrialPage.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export function TrialPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    items,
    selectedPurchaseItemId,
    selectPurchaseItem,
    calculateTotals,
    createTrialOrder,
    loading,
    error,
    hasUsedToday
  } = useTrial();

  const [trials, setTrials] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [localError, setLocalError] = useState(null);
  const [activeTab, setActiveTab] = useState('current'); // 'current' or 'history'

  const totals = calculateTotals();

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/trial-room');
      return;
    }
    if (activeTab === 'history') {
      loadTrialHistory();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter, activeTab]);

  const loadTrialHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '20');
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await axios.get(
        `${API_BASE_URL}/trial-room/history?${params}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      setTrials(response.data.data || []);
    } catch (err) {
      setHistoryError(err.response?.data?.message || 'Failed to load trials');
      console.error('Load trial history error:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreateTrial = async () => {
    setLocalError(null);

    // Validations
    if (items.length === 0) {
      setLocalError('Add at least 1 item to trial');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!selectedPurchaseItemId) {
      setLocalError('Select an item you want to purchase');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (hasUsedToday) {
      setLocalError('Trial already used today. Try again tomorrow!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      await createTrialOrder();
      
      // Success!
      if (window.showToast) {
        window.showToast('Trial room created! Redirecting to checkout...', 'success');
      }
      
      // Redirect to checkout or orders
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create trial';
      setLocalError(errorMsg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      trial_created: { label: 'Active Trial', color: 'blue' },
      converted_to_order: { label: 'Converted', color: 'green' },
      trial_abandoned: { label: 'Abandoned', color: 'gray' },
      cancelled: { label: 'Cancelled', color: 'red' }
    };

    const badge = badges[status] || { label: 'Unknown', color: 'gray' };
    return (
      <span className={`status-badge status-${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const displayError = error || localError;
  const isCheckoutDisabled = 
    loading || 
    items.length === 0 || 
    !selectedPurchaseItemId || 
    hasUsedToday;

  return (
    <div className="trial-room-page">
      {/* Hero Section */}
      <div className="trial-hero">
        <div className="trial-hero-content">
          <h1>🏠 Virtual Trial Room</h1>
          <p>Try up to 3 items at home before you buy. Free delivery & pickup!</p>
          <div className="trial-benefits">
            <span>✓ No payment required to try</span>
            <span>✓ Free delivery & pickup</span>
            <span>✓ Buy only what you love</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="trial-tabs">
        <button
          className={`trial-tab ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          <span>📦</span> Current Trial
        </button>
        <button
          className={`trial-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>📜</span> History
        </button>
      </div>

      <div className="trial-content">
        {/* Current Trial Tab */}
        {activeTab === 'current' && (
          <div className="trial-current-section">
            {/* Error Display */}
            {displayError && (
              <div className="trial-error-banner">
                <span className="error-icon">⚠️</span>
                <span>{displayError}</span>
              </div>
            )}

            {/* Daily Limit Warning */}
            {hasUsedToday && (
              <div className="trial-warning-banner">
                <span>⏰</span>
                <span>Trial room already used today. Come back tomorrow!</span>
              </div>
            )}

            <div className="trial-main-content">
              {/* Trial Items Section */}
              <div className="trial-items-section">
                <div className="section-header">
                  <h2>Your Trial Items ({items.length}/3)</h2>
                  {items.length < 3 && (
                    <button 
                      className="browse-products-btn"
                      onClick={() => navigate('/products?mode=trial')}
                    >
                      + Browse Products
                    </button>
                  )}
                </div>

                {items.length === 0 ? (
                  <div className="trial-empty">
                    <div className="empty-icon">🛍️</div>
                    <h3>No items in trial room</h3>
                    <p>Browse products and add up to 3 items to try at home</p>
                    <button 
                      className="browse-btn-large"
                      onClick={() => navigate('/products?mode=trial')}
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="trial-items-grid">
                    {items.map((item) => (
                      <TrialItemCard
                        key={item.productId}
                        item={item}
                        isSelected={selectedPurchaseItemId === item.productId}
                        onSelect={selectPurchaseItem}
                      />
                    ))}
                  </div>
                )}

                {items.length > 0 && (
                  <div className="trial-info-box">
                    <p className="info-title">💡 How it works</p>
                    <ol className="info-list">
                      <li>Select which item you want to purchase (marked with radio button)</li>
                      <li>Click "Create Trial Order" to proceed</li>
                      <li>We'll deliver all items for you to try at home</li>
                      <li>Keep what you selected, return the rest for free</li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Checkout Section */}
              {items.length > 0 && (
                <div className="trial-checkout-section">
                  <div className="checkout-card">
                    <h3>Order Summary</h3>

                    <div className="summary-row">
                      <span>Trial Items:</span>
                      <span>{items.length} item{items.length > 1 ? 's' : ''}</span>
                    </div>

                    {selectedPurchaseItemId && (
                      <div className="summary-row highlight">
                        <span>Selected to Buy:</span>
                        <span>
                          {items.find(i => i.productId === selectedPurchaseItemId)?.name}
                        </span>
                      </div>
                    )}

                    <div className="summary-divider"></div>

                    <div className="summary-row">
                      <span>Items Total:</span>
                      <strong>₹{totals.itemsTotal?.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="summary-row">
                      <span>Trial Fee:</span>
                      <strong>₹{totals.trialFee}</strong>
                    </div>

                    <div className="summary-row total">
                      <span>Final Total:</span>
                      <strong>₹{totals.finalTotal?.toLocaleString('en-IN')}</strong>
                    </div>

                    <div className="summary-note">
                      <small>You only pay for the item you selected to purchase</small>
                    </div>

                    <button
                      className="checkout-btn"
                      onClick={handleCreateTrial}
                      disabled={isCheckoutDisabled}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-small"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          Create Trial Order
                        </>
                      )}
                    </button>

                    {!selectedPurchaseItemId && items.length > 0 && (
                      <p className="checkout-warning">
                        Please select an item to purchase
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="trial-history-section">
            {/* Filters */}
            <div className="trial-page-filters">
              {['all', 'trial_created', 'converted_to_order', 'cancelled'].map(status => (
                <button
                  key={status}
                  className={`filter-btn ${filter === status ? 'active' : ''}`}
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' && 'All'}
                  {status === 'trial_created' && 'Active'}
                  {status === 'converted_to_order' && 'Purchased'}
                  {status === 'cancelled' && 'Cancelled'}
                </button>
              ))}
            </div>

            {/* Content */}
            {historyLoading ? (
              <div className="trial-page-loading">
                <div className="spinner"></div>
                <p>Loading your trials...</p>
              </div>
            ) : historyError ? (
              <div className="trial-page-error">
                <p>❌ {historyError}</p>
                <button onClick={loadTrialHistory} className="retry-btn">
                  Retry
                </button>
              </div>
            ) : trials.length === 0 ? (
              <div className="trial-page-empty">
                <div className="empty-icon">📭</div>
                <h3>No trials yet</h3>
                <p>Start your first trial room experience!</p>
                <button 
                  className="empty-start-btn"
                  onClick={() => setActiveTab('current')}
                >
                  Create Trial
                </button>
              </div>
            ) : (
              <div className="trial-page-list">
                {trials.map(trial => (
                  <div key={trial._id} className="trial-item">
                    <div className="trial-item-header">
                      <div className="trial-date">
                        📅 {formatDate(trial.createdAt)}
                      </div>
                      {getStatusBadge(trial.status)}
                    </div>

                    <div className="trial-item-body">
                      <div className="trial-items">
                        <h4>Items Trialed:</h4>
                        <ul>
                          {trial.trialItems?.map((item, idx) => (
                            <li key={idx}>
                              {item.product?.name || item.name} - ₹{item.price?.toLocaleString('en-IN')}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="trial-purchased">
                        <h4>Purchase Item:</h4>
                        <p>
                          {trial.purchasedItemId?.name || 'N/A'} - ₹{trial.purchasedItemId?.price?.toLocaleString('en-IN') || 0}
                        </p>
                      </div>

                      <div className="trial-breakdown">
                        <div className="breakdown-row">
                          <span>Items Total:</span>
                          <strong>₹{trial.itemsTotal?.toLocaleString('en-IN')}</strong>
                        </div>
                        <div className="breakdown-row">
                          <span>Trial Fee:</span>
                          <strong>₹{trial.trialFee}</strong>
                        </div>
                        <div className="breakdown-row total">
                          <span>Final Total:</span>
                          <strong>₹{trial.finalTotal?.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>

                    {trial.linkedOrderId && (
                      <div className="trial-order-link">
                        <a href={`/orders/${trial.linkedOrderId}`} className="view-order-btn">
                          View Order →
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TrialPage;
