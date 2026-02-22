/**
 * Trial Room Modal Component
 * 
 * Main UI for Trial Room feature:
 * - Display selected items (max 3)
 * - Select item to purchase
 * - Show price breakdown
 * - Create trial order
 * 
 * @component
 */

import { useState } from 'react';
import { useTrial } from '../../context/TrialContext';
import { useAuth } from '../../context/AuthContext';
import { TrialItemCard } from './TrialItemCard';
import './styles/TrialModal.css';

export function TrialModal() {
  const {
    items,
    selectedPurchaseItemId,
    selectPurchaseItem,
    toggleTrialModal,
    isModalOpen,
    calculateTotals,
    createTrialOrder,
    loading,
    error,
    hasUsedToday
  } = useTrial();

  const { user } = useAuth();
  const [localError, setLocalError] = useState(null);
  const totals = calculateTotals();

  if (!isModalOpen) {
    return null;
  }

  const handleClose = () => {
    toggleTrialModal(false);
    setLocalError(null);
  };

  const handleCreateTrial = async () => {
    setLocalError(null);

    // Validations
    if (items.length === 0) {
      setLocalError('Add at least 1 item to trial');
      return;
    }

    if (!selectedPurchaseItemId) {
      setLocalError('Select an item you want to purchase');
      return;
    }

    if (hasUsedToday) {
      setLocalError('Trial already used today. Try again tomorrow!');
      return;
    }

    try {
      const result = await createTrialOrder();
      
      // Success! Show success message and clear modal
      setTimeout(() => {
        handleClose();
        // Show success toast
        if (window.showToast) {
          window.showToast('Trial room created! Proceed to checkout.', 'success');
        }
      }, 500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create trial';
      setLocalError(errorMsg);
    }
  };

  const displayError = error || localError;
  const isCheckoutDisabled = 
    loading || 
    items.length === 0 || 
    !selectedPurchaseItemId || 
    hasUsedToday;

  return (
    <>
      {/* Backdrop */}
      <div className="trial-modal-backdrop" onClick={handleClose} />

      {/* Modal */}
      <div className="trial-modal-container">
        <div className="trial-modal-content">
          {/* Header */}
          <div className="trial-modal-header">
            <h2 className="trial-modal-title">
              <span className="icon">📦</span>
              Trial Room
            </h2>
            <button
              className="trial-modal-close"
              onClick={handleClose}
              aria-label="Close trial room"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="trial-modal-body">
            {/* Empty State */}
            {items.length === 0 ? (
              <div className="trial-empty-state">
                <div className="empty-icon">📭</div>
                <h3>Trial Room is Empty</h3>
                <p>Add items to try before buying!</p>
              </div>
            ) : (
              <>
                {/* Info Message */}
                <div className="trial-info-message">
                  <span className="info-icon">ℹ️</span>
                  <div>
                    <p className="info-title">How Trial Room Works</p>
                    <p className="info-text">
                      Select up to 3 items to try, then choose 1 to purchase. You pay ₹{totals.trialFee} trial fee.
                    </p>
                  </div>
                </div>

                {/* Items Count */}
                <div className="trial-items-count">
                  Items Selected: <strong>{items.length}/3</strong>
                </div>

                {/* Items List */}
                <div className="trial-items-list">
                  {items.map((item) => (
                    <TrialItemCard
                      key={item.productId}
                      item={item}
                      isSelected={selectedPurchaseItemId === item.productId}
                      onSelect={selectPurchaseItem}
                    />
                  ))}
                </div>

                {/* Purchase Selection Requirement */}
                {!selectedPurchaseItemId && (
                  <div className="trial-warning">
                    <span className="warning-icon">⚠️</span>
                    <p>You must select at least 1 item to purchase</p>
                  </div>
                )}

                {/* Error Message */}
                {displayError && (
                  <div className="trial-error-message">
                    <span className="error-icon">❌</span>
                    <p>{displayError}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - Price Breakdown and Buttons */}
          {items.length > 0 && (
            <div className="trial-modal-footer">
              {/* Price Breakdown */}
              <div className="trial-price-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">Items Total:</span>
                  <span className="breakdown-value">₹{totals.itemsTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Trial Fee:</span>
                  <span className="breakdown-value trial-fee-badge">+₹{totals.trialFee}</span>
                </div>
                <div className="breakdown-divider"></div>
                <div className="breakdown-item total">
                  <span className="breakdown-label">Final Total:</span>
                  <span className="breakdown-value-total">₹{totals.finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="trial-modal-actions">
                <button
                  className="trial-btn-cancel"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Discard
                </button>
                <button
                  className="trial-btn-checkout"
                  onClick={handleCreateTrial}
                  disabled={isCheckoutDisabled}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="icon">🛍️</span>
                      Start Trial
                    </>
                  )}
                </button>
              </div>

              {/* Daily Limit Message */}
              {hasUsedToday && (
                <p className="trial-daily-limit-message">
                  ⏰ Trial already used today. Come back tomorrow!
                </p>
              )}
            </div>
          )}

          {/* Empty State Buttons */}
          {items.length === 0 && (
            <div className="trial-modal-footer">
              <button
                className="trial-btn-close"
                onClick={handleClose}
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default TrialModal;
