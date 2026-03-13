/**
 * Trial Button — Minimal black/white Doordripp theme
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrial } from '../../context/TrialContext';
import { useAuth } from '../../context/AuthContext';

export function TrialButton({ product, className = '' }) {
  const { addItemToTrial, isItemInTrial, items, toggleTrialModal } = useTrial();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);

  const productId = product._id || product.id || '';
  const isInTrial = isItemInTrial(productId);
  const isFull = items.length >= 3;

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login?redirect=/products'); return; }
    if (isInTrial) { toggleTrialModal(true); return; }
    if (isFull) { toggleTrialModal(true); return; }
    const added = addItemToTrial(product);
    if (added) {
      setJustAdded(true);
      toggleTrialModal(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  let text = 'Add to Trial';
  let btnStyle = 'bg-black text-white hover:bg-gray-900 border-black';
  if (justAdded) {
    text = '✓ Added';
    btnStyle = 'bg-green-700 text-white border-green-700';
  } else if (isInTrial) {
    text = '✓ In Trial';
    btnStyle = 'bg-green-700 text-white border-green-700';
  } else if (isFull) {
    text = 'Trial Full';
    btnStyle = 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed';
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-semibold transition-all duration-200 ${btnStyle} ${className}`}
    >
      <span>📦</span>
      <span>{text}</span>
      <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-extrabold">{items.length}/3</span>
    </button>
  );
}

export default TrialButton;
