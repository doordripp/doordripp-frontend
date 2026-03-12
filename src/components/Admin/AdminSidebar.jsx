// src/components/Admin/AdminSidebar.jsx
import React from "react";
import { Link } from "react-router-dom";
import PanelSidebarItem from '../Panel/PanelSidebarItem';
import PanelSidebarSection from '../Panel/PanelSidebarSection';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  MapPin,
  BarChart3,
  Tag,
  Layers,
  Image,
  Smartphone,
  Shield
} from 'lucide-react';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-white min-h-screen border-r border-gray-200 p-4 flex flex-col">
      <div className="mb-6 px-2">
        <div className="text-xl font-bold text-gray-900">Doordripp</div>
        <div className="text-xs text-gray-500 mt-0.5 font-medium">Admin Panel</div>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        <PanelSidebarItem to="/admin" icon={LayoutDashboard}>Dashboard</PanelSidebarItem>

        <PanelSidebarSection title="Store">
          <PanelSidebarItem to="/admin/products" icon={Package}>Products</PanelSidebarItem>
          <PanelSidebarItem to="/admin/orders" icon={ShoppingCart}>Orders</PanelSidebarItem>
          <PanelSidebarItem to="/admin/vouchers" icon={Tag}>Coupons</PanelSidebarItem>
          <PanelSidebarItem to="/admin/categories" icon={Layers}>Categories</PanelSidebarItem>
        </PanelSidebarSection>

        <PanelSidebarSection title="People">
          <PanelSidebarItem to="/admin/customers" icon={Users}>Customers</PanelSidebarItem>
          <PanelSidebarItem to="/admin/users" icon={Shield}>Users & Roles</PanelSidebarItem>
        </PanelSidebarSection>

        <PanelSidebarSection title="Logistics">
          <PanelSidebarItem to="/admin/delivery-partners" icon={Truck}>Delivery Partners</PanelSidebarItem>
          <PanelSidebarItem to="/admin/delivery-zones" icon={MapPin}>Delivery Areas</PanelSidebarItem>
        </PanelSidebarSection>

        <PanelSidebarSection title="Reports">
          <PanelSidebarItem to="/admin/reports" icon={BarChart3}>Reports</PanelSidebarItem>
        </PanelSidebarSection>

        <PanelSidebarSection title="Content">
          <PanelSidebarItem to="/admin/banners-web" icon={Image}>Web Banners</PanelSidebarItem>
          <PanelSidebarItem to="/admin/banners-app" icon={Smartphone}>App Banners</PanelSidebarItem>
        </PanelSidebarSection>
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-200">
        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition">
          ← Back to Profile
        </Link>
      </div>
    </aside>
  );
}
