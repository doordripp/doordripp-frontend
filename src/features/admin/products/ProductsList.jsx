// src/features/admin/products/ProductsList.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import adminAPI from "../../../services/adminAPI";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    adminAPI.getProducts().then(setProducts).catch(()=>setProducts([]));
  }, []);

  const remove = async (id) => {
    if (!confirm("Delete product?")) return;
    await adminAPI.deleteProduct(id);
    setProducts(prev => prev.filter(p => p._id !== id));
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-semibold">Products</h3>
        <button onClick={() => nav("/admin/products/add")} className="bg-blue-600 text-white px-3 py-1 rounded">Add Product</button>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50"><tr><th className="p-3 text-left">Name</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Action</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3">₹{p.price}</td>
                <td className="p-3">{p.stock ?? 0}</td>
                <td className="p-3">
                  <Link to={`/admin/products/${p._id}`} className="mr-2 text-blue-600">Edit</Link>
                  <button onClick={() => remove(p._1d)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}