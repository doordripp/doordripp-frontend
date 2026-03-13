// src/features/admin/orders/OrdersList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminAPI from "../../../services/adminAPI";

export default function OrdersList(){
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getOrders();
      // Backend returns { orders: [...], total, page, totalPages }
      const ordersList = response?.orders || response || [];
      console.log('📦 Orders synced from database:', ordersList.length);
      setOrders(ordersList);
      setLastSync(new Date());
    } catch (err) {
      console.error('❌ Failed to sync orders from database:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-refresh every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Orders ({orders.length})</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (30s)
            </label>
          </div>
          {lastSync && (
            <span className="text-xs text-gray-500">
              Last synced: {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Syncing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync Now
              </>
            )}
          </button>
        </div>
      </div>
      
      {loading && orders.length === 0 && (
        <div className="text-center p-8 bg-white rounded shadow">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Syncing orders from database...</p>
        </div>
      )}
      
      {!loading && (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50"><tr><th className="p-3 text-left">Order ID</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Total</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Action</th></tr></thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900">No orders found</p>
                  <p className="text-sm text-gray-500 mt-1">Orders will appear here once customers place them</p>
                </td></tr>
              ) : (
                orders.map(o => (
                  <tr key={o._id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3 text-sm font-mono">{String(o._id).slice(-8)}</td>
                    <td className="p-3">{o.customer || o.user?.name || 'Unknown'}</td>
                    <td className="p-3 font-semibold">₹{o.total?.toFixed(2) || '0.00'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        o.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                        o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        o.status === 'packed' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                        o.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        o.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {o.status || o.orderStatus}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{new Date(o.date || o.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Link to={`/admin/orders/${o._id}`} className="text-blue-600 hover:underline font-medium">
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}