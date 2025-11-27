// src/components/Admin/AdminHeader.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function AdminHeader() {
  const { auth, logout } = useAuth();
  return (
    <header className="h-14 bg-white shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-md hover:bg-gray-100" aria-label="menu">
          <svg className="w-5 h-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor"><path d="M3 6h14M3 10h14M3 14h14" /></svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">Admin</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">{auth.user?.name || "Admin"}</div>
        <button onClick={logout} className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700">Logout</button>
      </div>
    </header>
  );
}