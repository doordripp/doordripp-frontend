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
      <h3 className="text-xl font-semibold mb-4">Orders</h3>
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th className="p-3">Order ID</th><th className="p-3">Customer</th><th className="p-3">Status</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{o._id}</td>
                <td className="p-3">{o.user?.name}</td>
                <td className="p-3">{o.orderStatus}</td>
                <td className="p-3"><Link to={`/admin/orders/${o._id}`} className="text-blue-600">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}