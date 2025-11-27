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

      <h3 className="text-xl font-semibold mb-3">Order #{order._id}</h3>
      <p>Customer: {order.user?.name ?? '—'}</p>
      <p>Status: <b>{order.orderStatus}</b></p>

      <div className="mt-4 space-x-2">
        {["Confirmed","Packed","Shipped","Delivered"].map(s => (
          <button
            key={s}
            onClick={() => update(s)}
            disabled={updating}
            aria-label={`Set status ${s}`}
            className="px-3 py-1 rounded text-white"
            style={{backgroundColor: /* choose color per status */ '#333'}}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <h4 className="font-semibold">Items</h4>
        <ul className="mt-2">
          {(order.items || []).map((it, i) => (
            <li key={it._id || it.productId || i}>
              {it.name ?? it.title ?? 'Item'} x {it.qty} — {fmt(it.price)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}