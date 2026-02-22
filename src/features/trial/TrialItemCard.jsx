/**
 * Trial Item Card Component
 * 
 * Displays an item in the trial room with:
 * - Product image
 * - Product name and price
 * - Remove button
 * - Selection indicator for purchase
 * 
 * @component
 */

import { useTrial } from '../../context/TrialContext';
import './styles/TrialItemCard.css';

export function TrialItemCard({ item, isSelected, onSelect }) {
  const { removeItemFromTrial } = useTrial();

  const handleRemove = (e) => {
    e.stopPropagation();
    removeItemFromTrial(item.productId);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(item.productId);
  };

  return (
    <div className={`trial-item-card ${isSelected ? 'selected' : ''}`} onClick={handleSelect}>
      {/* Product Image */}
      <div className="trial-item-image">
        <img 
          src={item.image} 
          alt={item.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
          }}
        />
        
        {/* Remove Button */}
        <button
          className="trial-item-remove"
          onClick={handleRemove}
          aria-label={`Remove ${item.name} from trial`}
          title="Remove from Trial"
        >
          ✕
        </button>
      </div>

      {/* Product Info */}
      <div className="trial-item-info">
        <h4 className="trial-item-name">{item.name}</h4>
        <p className="trial-item-price">₹{item.price.toLocaleString('en-IN')}</p>
      </div>

      {/* Selection Radio */}
      <div className="trial-item-select">
        <input
          type="radio"
          name="purchase-item"
          checked={isSelected}
          onChange={handleSelect}
          className="trial-item-radio"
          aria-label={`Select ${item.name} to purchase`}
        />
        <span className="trial-item-label">Buy this</span>
      </div>
    </div>
  );
}

export default TrialItemCard;
