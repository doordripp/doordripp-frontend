/**
 * Trial Room Context
 * 
 * Manages trial room state and operations:
 * - Add/remove items from trial room
 * - Select purchase item
 * - Manage trial room UI (modal/panel)
 * - Handle API calls
 * - Track conversion and daily usage
 * 
 * @module context/TrialContext
 */

import { createContext, useContext, useReducer, useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

// ============ Context Creation ============
const TrialContext = createContext();

// ============ Action Types ============
const TRIAL_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  SET_SELECTED_PURCHASE: 'SET_SELECTED_PURCHASE',
  CLEAR_TRIAL: 'CLEAR_TRIAL',
  SET_ITEMS: 'SET_ITEMS',
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  SET_DAILY_USED: 'SET_DAILY_USED',
  SET_LAST_TRIAL_DATE: 'SET_LAST_TRIAL_DATE',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TRIAL_ORDER: 'SET_TRIAL_ORDER'
};

// ============ Initial State ============
const initialState = {
  items: [],
  selectedPurchaseItemId: null,
  isModalOpen: false,
  hasUsedToday: false,
  lastTrialDate: null,
  loading: false,
  error: null,
  trialOrder: null
};

// ============ Reducer ============
const trialReducer = (state, action) => {
  switch (action.type) {
    case TRIAL_ACTIONS.ADD_ITEM: {
      const { product } = action.payload;
      
      // Check if already in trial items
      const exists = state.items.some(item => item.id === product.id);
      
      // Max 3 items
      if (state.items.length >= 3 && !exists) {
        return state;
      }

      if (exists) {
        return state;
      }

      const newItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        image: product.images && product.images[0] ? product.images[0] : product.image,
        price: product.price,
        quantity: 1
      };

      return {
        ...state,
        items: [...state.items, newItem],
        isModalOpen: true // Auto-open modal when item added
      };
    }

    case TRIAL_ACTIONS.REMOVE_ITEM: {
      const { productId } = action.payload;
      const newItems = state.items.filter(item => item.productId !== productId);
      
      // If removed item was selected purchase, clear selection
      let newSelectedPurchase = state.selectedPurchaseItemId;
      if (newSelectedPurchase === productId) {
        newSelectedPurchase = null;
      }

      return {
        ...state,
        items: newItems,
        selectedPurchaseItemId: newSelectedPurchase
      };
    }

    case TRIAL_ACTIONS.SET_SELECTED_PURCHASE: {
      return {
        ...state,
        selectedPurchaseItemId: action.payload
      };
    }

    case TRIAL_ACTIONS.CLEAR_TRIAL: {
      return {
        ...state,
        items: [],
        selectedPurchaseItemId: null,
        trialOrder: null,
        error: null
      };
    }

    case TRIAL_ACTIONS.SET_ITEMS: {
      return {
        ...state,
        items: action.payload
      };
    }

    case TRIAL_ACTIONS.TOGGLE_MODAL: {
      return {
        ...state,
        isModalOpen: action.payload !== undefined ? action.payload : !state.isModalOpen
      };
    }

    case TRIAL_ACTIONS.SET_DAILY_USED: {
      return {
        ...state,
        hasUsedToday: action.payload
      };
    }

    case TRIAL_ACTIONS.SET_LAST_TRIAL_DATE: {
      return {
        ...state,
        lastTrialDate: action.payload
      };
    }

    case TRIAL_ACTIONS.SET_LOADING: {
      return {
        ...state,
        loading: action.payload
      };
    }

    case TRIAL_ACTIONS.SET_ERROR: {
      return {
        ...state,
        error: action.payload
      };
    }

    case TRIAL_ACTIONS.SET_TRIAL_ORDER: {
      return {
        ...state,
        trialOrder: action.payload,
        items: [],
        selectedPurchaseItemId: null
      };
    }

    default:
      return state;
  }
};

// ============ Context Provider Component ============
export function TrialProvider({ children }) {
  const [state, dispatch] = useReducer(trialReducer, initialState);
  const { user } = useAuth();

  // Check daily usage on mount and when user changes
  useEffect(() => {
    if (user) {
      checkDailyUsage();
    } else {
      dispatch({ type: TRIAL_ACTIONS.SET_DAILY_USED, payload: false });
    }
  }, [user]);

  /**
   * Check if user has used trial today
   */
  const checkDailyUsage = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get('/trial-room/check-today');
      
      dispatch({
        type: TRIAL_ACTIONS.SET_DAILY_USED,
        payload: response.data.hasUsedToday
      });

      if (response.data.nextAvailableDate) {
        dispatch({
          type: TRIAL_ACTIONS.SET_LAST_TRIAL_DATE,
          payload: response.data.nextAvailableDate
        });
      }
    } catch (error) {
      console.error('Failed to check daily usage:', error);
    }
  }, [user]);

  /**
   * Add item to trial room
   * @param {Object} product - Product to add
   */
  const addItemToTrial = useCallback((product) => {
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = '/login?redirect=trial-room';
      return;
    }

    if (state.hasUsedToday) {
      dispatch({
        type: TRIAL_ACTIONS.SET_ERROR,
        payload: 'Trial Room already used today. Try again tomorrow!'
      });
      return;
    }

    if (state.items.length >= 3) {
      dispatch({
        type: TRIAL_ACTIONS.SET_ERROR,
        payload: 'Maximum 3 items allowed in trial room'
      });
      return;
    }

    dispatch({
      type: TRIAL_ACTIONS.ADD_ITEM,
      payload: { product }
    });

    // Clear error when adding item
    dispatch({ type: TRIAL_ACTIONS.SET_ERROR, payload: null });
  }, [user, state.hasUsedToday, state.items.length]);

  /**
   * Remove item from trial room
   * @param {String} productId - Product ID to remove
   */
  const removeItemFromTrial = useCallback((productId) => {
    dispatch({
      type: TRIAL_ACTIONS.REMOVE_ITEM,
      payload: { productId }
    });
  }, []);

  /**
   * Select item to purchase
   * @param {String} productId - Product ID to purchase
   */
  const selectPurchaseItem = useCallback((productId) => {
    dispatch({
      type: TRIAL_ACTIONS.SET_SELECTED_PURCHASE,
      payload: productId
    });
  }, []);

  /**
   * Toggle trial modal
   * @param {Boolean} isOpen - Optional: force open/close
   */
  const toggleTrialModal = useCallback((isOpen) => {
    dispatch({
      type: TRIAL_ACTIONS.TOGGLE_MODAL,
      payload: isOpen
    });
  }, []);

  /**
   * Create trial order
   * @returns {Promise<Object>} Trial order data
   */
  const createTrialOrder = useCallback(async () => {
    if (!user) {
      throw new Error('User must be logged in');
    }

    if (state.items.length < 1) {
      throw new Error('Add at least 1 item to trial');
    }

    if (!state.selectedPurchaseItemId) {
      throw new Error('Select an item to purchase');
    }

    dispatch({ type: TRIAL_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: TRIAL_ACTIONS.SET_ERROR, payload: null });

    try {
      const response = await api.post(
        '/trial-room/create',
        {
          trialItems: state.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            image: item.image,
            quantity: item.quantity
          })),
          purchasedItemId: state.selectedPurchaseItemId
        }
      );

      dispatch({
        type: TRIAL_ACTIONS.SET_TRIAL_ORDER,
        payload: response.data.data
      });

      // Update daily usage status
      dispatch({ type: TRIAL_ACTIONS.SET_DAILY_USED, payload: true });

      return response.data;
    } catch (error) {
      console.error('Trial creation error:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Failed to create trial order';
      dispatch({ type: TRIAL_ACTIONS.SET_ERROR, payload: errorMsg });
      throw error;
    } finally {
      dispatch({ type: TRIAL_ACTIONS.SET_LOADING, payload: false });
    }
  }, [user, state.items, state.selectedPurchaseItemId]);

  /**
   * Calculate trial totals
   * @returns {Object} Price breakdown
   */
  const calculateTotals = useCallback(() => {
    const itemsTotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const trialFee = 200;
    const finalTotal = itemsTotal + trialFee;

    return {
      itemsCount: state.items.length,
      itemsTotal: Math.round(itemsTotal * 100) / 100,
      trialFee,
      finalTotal: Math.round(finalTotal * 100) / 100
    };
  }, [state.items]);

  /**
   * Clear trial room
   */
  const clearTrial = useCallback(() => {
    dispatch({ type: TRIAL_ACTIONS.CLEAR_TRIAL });
  }, []);

  /**
   * Check if item is in trial room
   * @param {String} productId - Product ID to check
   * @returns {Boolean}
   */
  const isItemInTrial = useCallback((productId) => {
    return state.items.some(item => item.productId === productId);
  }, [state.items]);

  // ============ Context Value ============
  const value = {
    // State
    items: state.items,
    selectedPurchaseItemId: state.selectedPurchaseItemId,
    isModalOpen: state.isModalOpen,
    hasUsedToday: state.hasUsedToday,
    lastTrialDate: state.lastTrialDate,
    loading: state.loading,
    error: state.error,
    trialOrder: state.trialOrder,

    // Methods
    addItemToTrial,
    removeItemFromTrial,
    selectPurchaseItem,
    toggleTrialModal,
    createTrialOrder,
    calculateTotals,
    clearTrial,
    isItemInTrial,
    checkDailyUsage
  };

  return (
    <TrialContext.Provider value={value}>
      {children}
    </TrialContext.Provider>
  );
}

// ============ Custom Hook ============
/**
 * Use Trial Context
 * @returns {Object} Trial context value
 */
export function useTrial() {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('useTrial must be used within TrialProvider');
  }
  return context;
}

export default TrialContext;
