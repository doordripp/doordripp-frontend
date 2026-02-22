/**
 * Trial Room Add Button
 * 
 * Button component that adds a product to trial room
 * Shows current trial count (0/3)
 * 
 * @component
 */

import { useState } from 'react';
import { useTrial } from '../../context/TrialContext';
import { useAuth } from '../../context/AuthContext';
import './styles/TrialButton.css';

export function TrialButton({ product, className = '' }) {
  const { addItemToTrial, isItemInTrial, items, hasUsedToday } = useTrial();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const isInTrial = isItemInTrial(product.id || product._id);

  const handleAddToTrial = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      window.location.href = '/login?redirect=/trial-room';
      return;
    }

    setIsAdding(true);
    try {
      addItemToTrial(product);
    } finally {
      setTimeout(() => setIsAdding(false), 300);
    }
  };

  const isDisabled = hasUsedToday || (items.length >= 3 && !isInTrial) || isAdding;
  
  let buttonText = 'Add to Trial';
  let tooltipText = 'Add to Trial Room (Try at home)';
  
  if (isInTrial) {
    buttonText = 'In Trial';
    tooltipText = 'Already added to trial room';
  } else if (hasUsedToday) {
    buttonText = 'Used Today';
    tooltipText = 'Trial already used today. Try again tomorrow!';
  } else if (items.length >= 3) {
    buttonText = 'Trial Full';
    tooltipText = 'Maximum 3 items allowed in trial room';
  }

  return (
    <button
      onClick={handleAddToTrial}
      disabled={isDisabled}
      className={`trial-button ${isInTrial ? 'active' : ''} ${isDisabled ? 'disabled' : ''} ${className}`}
      title={tooltipText}
      aria-label={`Add ${product.name} to trial room`}
    >
      <span className="trial-button-icon">
        {isInTrial ? '✓' : '📦'}
      </span>
      <span className="trial-button-text">
        {buttonText}
      </span>
      <span className="trial-counter">
        {items.length}/3
      </span>
    </button>
  );
}

export default TrialButton;
