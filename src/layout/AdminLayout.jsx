// src/layout/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Admin/AdminSidebar";
import AdminHeader from "../components/Admin/AdminHeader";
import { useAdmin } from "../context/AdminContext";

export default function AdminLayout() {
  const { sidebarOpen } = useAdmin();
  return (
    <div className="flex min-h-screen bg-gray-100">
      {sidebarOpen && <AdminSidebar />}
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}