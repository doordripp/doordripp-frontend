import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminAPI from "../../../services/adminAPI";

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    adminAPI.getOrder(id)
      .then((res) => {
        if (!mounted) return;
        // If adminAPI wraps response, extract res.data here
        setOrder(res && res.data ? res.data : res);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err?.message || "Failed to load order");
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [id]);

  const update = async (status) => {
    if (updating) return;
    setUpdating(true);
    setError(null);
    try {
      await adminAPI.updateOrderStatus(id, status);
      const refreshed = await adminAPI.getOrder(id);
      setOrder(refreshed && refreshed.data ? refreshed.data : refreshed);
    } catch (err) {
      setError(err?.message || "Failed to update order");
    } finally {
      setUpdating(false);
    }
  };

  const fmt = (value) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);

  if (loading) return <div>Loading order...</div>;
  if (error) return (
    <div>
      <p className="text-red-600">Error: {error}</p>
      <button onClick={() => window.location.reload()} className="mt-2">Retry</button>
    </div>
  );

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 text-sm text-blue-600">← Back</button>

      <h3 className="text-xl font-semibold mb-3">Order #{String(order._id).slice(-8)}</h3>
      <div className="bg-white p-4 rounded shadow mb-4">
        <p className="mb-2"><strong>Customer:</strong> {order.customer || order.user?.name || 'Unknown'}</p>
        <p className="mb-2"><strong>Email:</strong> {order.customerEmail || order.user?.email || '—'}</p>
        <p className="mb-2"><strong>Total:</strong> {fmt(order.total || 0)}</p>
        <p className="mb-2"><strong>Status:</strong> <span className={`px-2 py-1 rounded text-sm font-semibold ${order.status === 'confirmed' ? 'bg-green-100 text-green-800' : order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{order.status || order.orderStatus}</span></p>
        <p className="mb-2"><strong>Date:</strong> {new Date(order.date || order.createdAt).toLocaleString()}</p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h4 className="font-semibold mb-2">Items</h4>
        {order.items && order.items.length > 0 ? (
          <ul className="space-y-2">
            {order.items.map((item, idx) => (
              <li key={idx} className="text-sm border-b pb-2">
                {item.name} × {item.quantity} = {fmt(item.price * item.quantity)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No items</p>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h4 className="font-semibold mb-2">Shipping Address</h4>
        {order.shippingAddress ? (
          <div className="text-sm space-y-1">
            <p>{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            <p>📞 {order.shippingAddress.phone}</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No address</p>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h4 className="font-semibold mb-3">Update Status</h4>
        <div className="flex flex-wrap gap-2">
          {["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"].map(s => {
            const colors = {
              pending: 'bg-yellow-500 hover:bg-yellow-600',
              confirmed: 'bg-green-500 hover:bg-green-600',
              packed: 'bg-blue-500 hover:bg-blue-600',
              shipped: 'bg-indigo-500 hover:bg-indigo-600',
              delivered: 'bg-emerald-500 hover:bg-emerald-600',
              cancelled: 'bg-red-500 hover:bg-red-600'
            };
            return (
              <button
                key={s}
                onClick={() => update(s)}
                disabled={updating || order.status === s}
                className={`px-4 py-2 rounded text-white font-medium capitalize ${colors[s]} disabled:opacity-50 disabled:cursor-not-allowed transition`}
              >
                {updating ? '...' : s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}