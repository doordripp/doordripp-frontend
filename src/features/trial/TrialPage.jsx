/**
 * Trial Page — Doordripp Trial Room
 *
 * Users select up to 3 items, pick 1 to buy, pay for THAT item via checkout.
 * All items delivered → keep selected → return rest free.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTrial } from '../../context/TrialContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { TrialItemCard } from './TrialItemCard';
import api from '../../services/api';

export default function TrialPage() {
  const {
    items,
    selectedPurchaseItemId,
    selectPurchaseItem,
    removeItemFromTrial,
    calculateTotals,
    loading,
    error,
    clearTrial,
    createTrialOrder,
  } = useTrial();

  const { user } = useAuth();
  const { clearCart, addToCart, setTrialMode } = useCart();
  const navigate = useNavigate();

  const [tab, setTab] = useState('room');          // 'room' | 'history'
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [placing, setPlacing] = useState(false);

  const totals = calculateTotals();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Load history when that tab is active
  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      setHistLoading(true);
      const res = await api.get('/trial-room/history');
      setHistory(res.data?.data || res.data || []);
    } catch {
      /* silent */
    } finally {
      setHistLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab, loadHistory]);

  // ---------- Pay & Checkout ----------
  const handlePay = async () => {
    setLocalError('');

    if (!user) {
      navigate('/login', { state: { from: '/trial-room' } });
      return;
    }
    if (items.length === 0) {
      setLocalError('Add at least 1 item to your trial room');
      return;
    }
    if (!selectedPurchaseItemId) {
      setLocalError('Please select which item you want to buy');
      return;
    }

    // ⚡ Capture selected item BEFORE createTrialOrder (which clears state)
    const selectedItem = items.find(i => i.productId === selectedPurchaseItemId);
    if (!selectedItem) {
      setLocalError('Selected item not found — please re-select');
      return;
    }

    const trialItemsMetadata = [...items]; // ⚡ Capture full trial items list before clearing

    try {
      setPlacing(true);

      // 1) Create trial order on backend (saves the full trial with all items)
      await createTrialOrder();

      // 2) Put ONLY the purchased item into cart
      clearCart();
      
      // 3) Set Trial Metadata in CartContext (Persistent during this session)
      setTrialMode({
        isTrial: true,
        trialFee: 119,
        trialItems: trialItemsMetadata,
        purchasedItemId: selectedPurchaseItemId
      });

      addToCart(
        {
          id: selectedItem.productId,
          _id: selectedItem.productId,
          name: selectedItem.name,
          image: selectedItem.image,
          price: selectedItem.price,
          originalPrice: selectedItem.originalPrice || selectedItem.price,
        },
        { size: 'M', color: 'default', quantity: 1 }
      );

      // 4) Go to checkout with trial metadata
      navigate('/checkout', { 
        state: { 
          isTrialCheckout: true,
          trialItems: items,
          purchasedItemId: selectedPurchaseItemId,
          trialFee: 119
        } 
      });
    } catch (err) {
      setLocalError(err?.response?.data?.message || err?.message || 'Failed to place trial order');
    } finally {
      setPlacing(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-gray-700">Home</Link></li>
              <li className="before:content-['/'] before:mx-2">Trial Room</li>
            </ol>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Trial Room</h1>
          <p className="text-sm text-gray-500 mt-1">Try before you buy — pick up to 3 items, keep what you love.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-6xl px-4 mt-6">
        <div className="flex gap-1 bg-gray-200/60 p-1 rounded-xl w-fit">
          {[
            { key: 'room', label: 'My Trial Room', icon: '📦' },
            { key: 'history', label: 'History', icon: '📋' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {tab === 'room' ? (
          /* ==================== ROOM TAB ==================== */
          items.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🛍️</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your trial room is empty</h2>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Browse our collection and add up to 3 items to try at home.
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition"
              >
                Browse Products →
              </Link>
            </div>
          ) : (
            /* Items + summary */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">
                    Your Items ({items.length}/3)
                  </h2>
                  {items.length < 3 && (
                    <Link
                      to="/products"
                      className="text-sm font-semibold text-gray-600 hover:text-black transition"
                    >
                      + Add More
                    </Link>
                  )}
                </div>

                <p className="text-sm text-gray-500">
                  Select the item you want to <strong>purchase</strong>. The rest will be returned for free.
                </p>

                <div className="space-y-3">
                  {items.map((item) => (
                    <TrialItemCard
                      key={item.productId}
                      item={item}
                      isSelected={item.productId === selectedPurchaseItemId}
                      onSelect={() => selectPurchaseItem(item.productId)}
                      onRemove={() => removeItemFromTrial(item.productId)}
                    />
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                  {/* Selected item highlight */}
                  {selectedPurchaseItemId && (() => {
                    const sel = items.find(i => i.productId === selectedPurchaseItemId);
                    return sel ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 mb-4">
                        <img src={sel.image} alt={sel.name} className="w-14 h-14 rounded-lg object-cover bg-gray-200" onError={(e) => { e.target.src = 'https://via.placeholder.com/56'; }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{sel.name}</p>
                          <p className="text-xs text-gray-500">You'll buy this item</p>
                        </div>
                        <p className="text-sm font-bold text-black">₹{sel.price?.toLocaleString('en-IN')}</p>
                      </div>
                    ) : null;
                  })()}

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Items in Trial</span>
                      <span className="font-semibold text-gray-900">{items.length}</span>
                    </div>

                    {totals.selectedItemPrice > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Selected Item Price</span>
                        <span className="font-semibold text-gray-900">₹{totals.selectedItemPrice.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <div className="flex flex-col">
                        <span>Trial Service Fee</span>
                        <span className="text-[10px] text-gray-400">Covers 3 items delivery & return</span>
                      </div>
                      <span className="font-semibold text-gray-900">₹{totals.trialFee.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex justify-between">
                      <span className="font-semibold text-gray-900">You Pay</span>
                      <span className="text-xl font-bold text-black">
                        {totals.total > 0
                          ? `₹${totals.total.toLocaleString('en-IN')}`
                          : '—'}
                      </span>
                    </div>
                  </div>

                  {/* How it works */}
                  <div className="mt-5 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-semibold text-gray-700 mb-2">How Trial & Buy works</p>
                    <ul className="space-y-1.5 text-xs text-gray-500">
                      <li className="flex gap-2"><span>1.</span> Add up to 3 items to trial</li>
                      <li className="flex gap-2"><span>2.</span> Select 1 item you want to buy</li>
                      <li className="flex gap-2"><span>3.</span> Pay only for the selected item</li>
                      <li className="flex gap-2"><span>4.</span> All items delivered — try them at home</li>
                      <li className="flex gap-2"><span>5.</span> Keep your item, return the rest for free</li>
                    </ul>
                  </div>

                  {/* Errors */}
                  {(localError || error) && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {localError || error}
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    onClick={handlePay}
                    disabled={!selectedPurchaseItemId || items.length === 0 || placing || loading}
                    className="mt-5 w-full py-3 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    {placing || loading
                      ? 'Processing…'
                      : totals.total > 0
                        ? `Pay ₹${totals.total.toLocaleString('en-IN')} & Checkout →`
                        : 'Select an item to continue'}
                  </button>

                  <button
                    onClick={clearTrial}
                    className="mt-2 w-full py-2 text-sm text-gray-400 hover:text-red-500 transition"
                  >
                    Clear Trial Room
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          /* ==================== HISTORY TAB ==================== */
          <div>
            {histLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">📋</p>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No trial history yet</h2>
                <p className="text-gray-500">Your past trial orders will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((order) => {
                  const statusColors = {
                    pending:   'bg-yellow-100 text-yellow-800',
                    confirmed: 'bg-blue-100 text-blue-800',
                    shipped:   'bg-indigo-100 text-indigo-800',
                    delivered: 'bg-green-100 text-green-800',
                    cancelled: 'bg-red-100 text-red-800',
                    returned:  'bg-gray-200 text-gray-700',
                  };
                  const statusClass = statusColors[order.status] || 'bg-gray-100 text-gray-600';

                  return (
                    <div
                      key={order._id}
                      className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-sm transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            Trial #{order._id?.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusClass}`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </span>
                      </div>

                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {(order.trialItems || []).map((item, idx) => (
                          <div
                            key={idx}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                              item.productId === order.purchasedItemId
                                ? 'border-black'
                                : 'border-gray-100'
                            }`}
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/64'; }}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-gray-500">{order.trialItems?.length} items tried</span>
                        {(() => {
                          const purchased = (order.trialItems || []).find(i => i.productId === order.purchasedItemId);
                          return purchased ? (
                            <span className="font-bold text-gray-900">Bought: ₹{purchased.price?.toLocaleString('en-IN')}</span>
                          ) : (
                            <span className="font-bold text-gray-900">₹{order.trialFee || '—'}</span>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
