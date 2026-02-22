/**
 * Trial Room Context
 * 
 * Flow: Add items (max 3) → Select 1 to buy → Pay ₹200 trial fee
 * All items delivered → Keep what you want → Return rest free
 */

import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const TrialContext = createContext(null);

/** Always get a clean string ID from any product-like object */
const getProductId = (product) => {
  if (!product) return '';
  const raw = product._id || product.id || product.productId || '';
  return String(raw);
};

const ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  SELECT_PURCHASE: 'SELECT_PURCHASE',
  CLEAR: 'CLEAR',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TRIAL_ORDER: 'SET_TRIAL_ORDER',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
};

const initialState = {
  items: [],
  selectedPurchaseItemId: null,
  isModalOpen: false,
  loading: false,
  error: null,
  trialOrder: null,
};

const trialReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_ITEM: {
      const { product } = action.payload;
      const pid = getProductId(product);
      if (!pid) return state;
      if (state.items.some(i => i.productId === pid)) return state;
      if (state.items.length >= 3) return state;

      const newItem = {
        productId: pid,
        name: product.name || 'Product',
        image: (product.images?.length > 0) ? product.images[0] : (product.image || ''),
        price: Number(product.price) || 0,
        originalPrice: Number(product.originalPrice) || 0,
        quantity: 1,
      };

      return { ...state, items: [...state.items, newItem], error: null };
    }

    case ACTIONS.REMOVE_ITEM: {
      const pid = String(action.payload);
      const newItems = state.items.filter(i => i.productId !== pid);
      const newSelected = state.selectedPurchaseItemId === pid ? null : state.selectedPurchaseItemId;
      return { ...state, items: newItems, selectedPurchaseItemId: newSelected };
    }

    case ACTIONS.SELECT_PURCHASE:
      return { ...state, selectedPurchaseItemId: action.payload };

    case ACTIONS.CLEAR:
      return { ...initialState };

    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };

    case ACTIONS.SET_TRIAL_ORDER:
      return { ...state, trialOrder: action.payload, items: [], selectedPurchaseItemId: null };

    case ACTIONS.OPEN_MODAL:
      return { ...state, isModalOpen: true };

    case ACTIONS.CLOSE_MODAL:
      return { ...state, isModalOpen: false };

    default:
      return state;
  }
};

// ============ Provider ============
export function TrialProvider({ children }) {
  const LS_KEY = 'doordripp_trial_items';

  const initState = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return { ...initialState, items: parsed };
        }
      }
    } catch { /* ignore corrupt data */ }
    return initialState;
  };

  const [state, dispatch] = useReducer(trialReducer, initialState, initState);
  const { user } = useAuth();
  const prevItemsRef = useRef(JSON.stringify(state.items));

  // Persist items to localStorage (with deep comparison to avoid loops)
  useEffect(() => {
    const serialized = JSON.stringify(state.items);
    if (prevItemsRef.current !== serialized) {
      prevItemsRef.current = serialized;
      try { localStorage.setItem(LS_KEY, serialized); } catch { /* */ }
    }
  }, [state.items]);

  // ---- Actions ----

  const addItemToTrial = useCallback((product) => {
    if (!product) return false;
    const pid = getProductId(product);
    if (!pid) return false;
    dispatch({ type: ACTIONS.ADD_ITEM, payload: { product } });
    return true;
  }, []);

  const removeItemFromTrial = useCallback((productId) => {
    dispatch({ type: ACTIONS.REMOVE_ITEM, payload: productId });
  }, []);

  const selectPurchaseItem = useCallback((productId) => {
    dispatch({ type: ACTIONS.SELECT_PURCHASE, payload: productId });
  }, []);

  const toggleTrialModal = useCallback((isOpen) => {
    dispatch({ type: isOpen ? ACTIONS.OPEN_MODAL : ACTIONS.CLOSE_MODAL });
  }, []);

  const clearTrial = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR });
    try { localStorage.removeItem(LS_KEY); } catch { /* */ }
  }, []);

  const isItemInTrial = useCallback((productOrId) => {
    const pid = (typeof productOrId === 'object') ? getProductId(productOrId) : String(productOrId || '');
    return state.items.some(i => i.productId === pid);
  }, [state.items]);

  const createTrialOrder = useCallback(async () => {
    if (!user) throw new Error('Please login first');
    if (state.items.length < 1) throw new Error('Add at least 1 item');
    if (!state.selectedPurchaseItemId) throw new Error('Select an item to purchase');

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: ACTIONS.SET_ERROR, payload: null });

    try {
      const res = await api.post('/trial-room/create', {
        trialItems: state.items.map(i => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          image: i.image,
          quantity: i.quantity,
        })),
        purchasedItemId: state.selectedPurchaseItemId,
      });

      dispatch({ type: ACTIONS.SET_TRIAL_ORDER, payload: res.data.data });
      try { localStorage.removeItem(LS_KEY); } catch { /* */ }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create trial';
      dispatch({ type: ACTIONS.SET_ERROR, payload: msg });
      throw err;
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
    }
  }, [user, state.items, state.selectedPurchaseItemId]);

  const calculateTotals = useCallback(() => {
    const selected = state.items.find(i => i.productId === state.selectedPurchaseItemId);
    const selectedPrice = selected ? selected.price : 0;
    const trialFee = state.items.length > 0 ? 119 : 0;

    return {
      itemsCount: state.items.length,
      selectedItemPrice: selectedPrice,
      trialFee: trialFee,
      total: selectedPrice + trialFee,
    };
  }, [state.items, state.selectedPurchaseItemId]);

  const value = {
    items: state.items,
    selectedPurchaseItemId: state.selectedPurchaseItemId,
    isModalOpen: state.isModalOpen,
    loading: state.loading,
    error: state.error,
    trialOrder: state.trialOrder,
    hasUsedToday: false, // Always allow trials

    addItemToTrial,
    removeItemFromTrial,
    selectPurchaseItem,
    toggleTrialModal,
    createTrialOrder,
    calculateTotals,
    clearTrial,
    isItemInTrial,
    getProductId,
    checkDailyUsage: () => {},
  };

  return (
    <TrialContext.Provider value={value}>
      {children}
    </TrialContext.Provider>
  );
}

export function useTrial() {
  const ctx = useContext(TrialContext);
  if (!ctx) throw new Error('useTrial must be used within TrialProvider');
  return ctx;
}

export default TrialContext;
