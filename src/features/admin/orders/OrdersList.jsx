// src/features/admin/orders/OrdersList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adminAPI from "../../../services/adminAPI";

export default function OrdersList(){
  const [orders, setOrders] = useState([]);

  useEffect(()=> {
    adminAPI.getOrders().then(setOrders).catch(()=>setOrders([]));
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Orders ({orders.length})</h3>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th className="p-3">Order ID</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Status</th><th className="p-3">Date</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan="6" className="p-3 text-center text-gray-500">No orders found</td></tr>
            ) : (
              orders.map(o => (
                <tr key={o._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-sm font-mono">{String(o._id).slice(-8)}</td>
                  <td className="p-3">{o.customer || o.user?.name || 'Unknown'}</td>
                  <td className="p-3">₹{o.total?.toFixed(2) || '0.00'}</td>
                  <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-semibold ${o.status === 'confirmed' ? 'bg-green-100 text-green-800' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{o.status || o.orderStatus}</span></td>
                  <td className="p-3 text-sm">{new Date(o.date || o.createdAt).toLocaleDateString()}</td>
                  <td className="p-3"><Link to={`/admin/orders/${o._id}`} className="text-blue-600 hover:underline">View</Link></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}