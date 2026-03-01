// src/components/Admin/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Item = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `block px-4 py-2 rounded-md text-sm ${isActive ? 'bg-orange-100 text-orange-800 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}>
    {children}
  </NavLink>
);

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white min-h-screen p-4 border-r">
      <div className="mb-6">
        <div className="text-gray-900 text-xl font-bold">DoorDrip Admin</div>
        <div className="text-xs text-gray-500 mt-1">Manage store & orders</div>
      </div>

      <nav className="flex flex-col gap-1">
        <Item to="/admin/dashboard">Dashboard</Item>
        <Item to="/admin/products">Products</Item>
        <Item to="/admin/orders">Orders</Item>
          <Item to="/admin/customers">Customers</Item>
        <Item to="/admin/reports">Reports</Item>
        <Item to="/admin/delivery-zones">Delivery Areas</Item>
        <Item to="/admin/banners">Promo Banners</Item>
        <Item to="/admin/categories">Categories</Item>
      </nav>
    </aside>
  );
}