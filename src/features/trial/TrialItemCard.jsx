/**
 * Trial Item Card — Horizontal list card for trial room selection
 */

export function TrialItemCard({ item, isSelected, onSelect, onRemove }) {
  return (
    <div
      onClick={() => onSelect(item.productId)}
      className={`relative flex items-center gap-4 cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
        isSelected
          ? 'border-black bg-gray-50 shadow-md ring-1 ring-black/10'
          : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
      }`}
    >
      {/* Radio */}
      <input
        type="radio"
        name="purchase-item"
        checked={isSelected}
        onChange={() => onSelect(item.productId)}
        onClick={(e) => e.stopPropagation()}
        className="w-5 h-5 accent-black flex-shrink-0"
      />

      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/96?text=No+Image'; }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{item.name}</h4>
        <p className="text-base sm:text-lg font-bold text-black mt-1">
          ₹{item.price?.toLocaleString('en-IN')}
        </p>
        {isSelected && (
          <span className="inline-block mt-1.5 text-xs font-semibold text-black bg-black/5 px-2 py-0.5 rounded-full">
            ✓ You'll buy this
          </span>
        )}
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(item.productId); }}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
        title="Remove"
      >
        ✕
      </button>
    </div>
  );
}

export default TrialItemCard;
