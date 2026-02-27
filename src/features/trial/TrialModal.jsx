/**
 * Trial Modal — Slide-in quick view, minimal Doordripp theme
 */
import { useNavigate } from 'react-router-dom';
import { useTrial } from '../../context/TrialContext';

export function TrialModal() {
  const { items, isModalOpen, toggleTrialModal, removeItemFromTrial } = useTrial();
  const navigate = useNavigate();

  if (!isModalOpen) return null;

  const handleClose = () => toggleTrialModal(false);
  const goCheckout = () => { 
    toggleTrialModal(false); 
    navigate('/trial-room'); 
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] animate-fadeIn" onClick={handleClose} />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] w-[92%] max-w-md animate-slideUp">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">📦 Trial Room ({items.length}/3)</h2>
            <button type="button" onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">✕</button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">🛍️</p>
                <h3 className="text-lg font-semibold text-gray-900">Trial Room is Empty</h3>
                <p className="text-sm text-gray-500 mt-1">Add items to try at home</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover bg-gray-200" onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">₹{item.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <button type="button" onClick={() => removeItemFromTrial(item.productId)} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-xs transition">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 space-y-3">
            {items.length > 0 ? (
              <>
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-500">Pick 1 to buy, pay for that + ₹119 service fee</p>
                  <p className="text-[10px] text-gray-400 italic">Remaining 2 returns are free</p>
                </div>
                <div className="flex gap-2">
                  {items.length < 3 && (
                    <button type="button" onClick={handleClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition">
                      + Add More
                    </button>
                  )}
                  <button type="button" onClick={goCheckout} className="flex-1 py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 transition">
                    Continue →
                  </button>
                </div>
              </>
            ) : (
              <button type="button" onClick={handleClose} className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-semibold hover:bg-gray-900 transition">
                Continue Shopping
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TrialModal;
