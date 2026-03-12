// src/layout/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/Admin/AdminSidebar";
import PanelHeader from "../components/Panel/PanelHeader";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <PanelHeader title="Admin Panel" subtitle="Full system management" />
        <main className="p-6 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}