// src/components/Admin/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const Item = ({ to, children }) => (
  <NavLink to={to} className={({ isActive }) => `block px-4 py-2 rounded-md text-sm ${isActive ? 'bg-gray-800 text-white' : 'text-gray-200 hover:bg-gray-700 hover:text-white'}`}>
    {children}
  </NavLink>
);

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-900 min-h-screen p-4">
      <div className="mb-6">
        <div className="text-white text-xl font-bold">DoorDrip Admin</div>
        <div className="text-xs text-gray-400 mt-1">Manage store & orders</div>
      </div>

      <nav className="flex flex-col gap-1">
        <Item to="/admin/dashboard">Dashboard</Item>
        <Item to="/admin/products">Products</Item>
        <Item to="/admin/orders">Orders</Item>
        <Item to="/admin/customers">Customers</Item>
        <Item to="/admin/reports">Reports</Item>
      </nav>
    </aside>
  );
}