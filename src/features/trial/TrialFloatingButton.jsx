/**
 * Floating Trial Bag Button
 * Shows a sticky floating button when items are in the trial room.
 * Clicking opens the TrialModal to view items and proceed to checkout.
 */
import { useTrial } from '../../context/TrialContext';

export function TrialFloatingButton() {
  const { items, toggleTrialModal } = useTrial();

  if (items.length === 0) return null;

  return (
    <button
      onClick={() => toggleTrialModal(true)}
      className="fixed bottom-6 right-6 z-[900] flex items-center gap-2 bg-black text-white pl-4 pr-5 py-3 rounded-full shadow-2xl hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10"
      aria-label="View trial items"
    >
      <span className="text-lg">📦</span>
      <span className="text-sm font-bold">Trial Room</span>
      <span className="bg-white text-black text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center">
        {items.length}
      </span>
    </button>
  );
}

export default TrialFloatingButton;
