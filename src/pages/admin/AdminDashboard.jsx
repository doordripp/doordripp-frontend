// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { DollarSign, Package, Users, ShoppingCart, TrendingUp, TrendingDown } from "lucide-react";
import adminAPI from "../../services/adminAPI";
import { StatsCard } from "../../components/Admin";
import { formatCurrency, formatDate } from '../../utils/adminHelpers'

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Mock data for comprehensive dashboard
  const mockStats = {
    totalSales: "\u20b945,231.89",
    totalOrders: "1,429",
    totalCustomers: "2,350",
    totalProducts: "847",
    salesGrowth: "+20.1%",
    ordersGrowth: "+12.5%",
    customersGrowth: "+8.7%",
    productsGrowth: "+5.2%",
    monthlySales: [
      { month: "Jan", sales: 12000 },
      { month: "Feb", sales: 15000 },
      { month: "Mar", sales: 18000 },
      { month: "Apr", sales: 22000 },
      { month: "May", sales: 25000 },
      { month: "Jun", sales: 28000 }
    ]
  };

  const mockRecentOrders = [
    { id: "#ORD-001", customer: "John Doe", amount: 129.99, status: "pending", date: "2024-01-15" },
    { id: "#ORD-002", customer: "Jane Smith", amount: 89.99, status: "shipped", date: "2024-01-14" },
    { id: "#ORD-003", customer: "Mike Johnson", amount: 199.99, status: "delivered", date: "2024-01-13" },
    { id: "#ORD-004", customer: "Sarah Wilson", amount: 79.99, status: "processing", date: "2024-01-12" },
    { id: "#ORD-005", customer: "David Brown", amount: 159.99, status: "pending", date: "2024-01-11" }
  ];

  const mockTopProducts = [
    { name: "Premium Cotton T-Shirt", sales: 145, revenue: 4350 },
    { name: "Wireless Headphones", sales: 89, revenue: 8010 },
    { name: "Leather Wallet", sales: 67, revenue: 3349 },
    { name: "Smart Watch", sales: 45, revenue: 8995 },
    { name: "Phone Case", sales: 123, revenue: 4920 }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      adminAPI.getStats().then(d => {
        setStats(d);
      }).catch(() => {
        setStats(mockStats);
      });
      setRecentOrders(mockRecentOrders);
      setTopProducts(mockTopProducts);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-green-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome to Dashboard</h1>
        <p className="text-blue-100">Here's what's happening with your store today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales || mockStats.totalSales)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                {stats.salesGrowth || mockStats.salesGrowth} from last month
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || mockStats.totalOrders}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                {stats.ordersGrowth || mockStats.ordersGrowth} from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers || mockStats.totalCustomers}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                {stats.customersGrowth || mockStats.customersGrowth} from last month
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || mockStats.totalProducts}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                {stats.productsGrowth || mockStats.productsGrowth} from last month
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
          <div className="space-y-3">
            {recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(order.amount)}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all orders →
            </button>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all products →
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">Add Product</p>
          </button>
          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
            <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">View Orders</p>
          </button>
          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-900">Manage Users</p>
          </button>
          <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
            <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-900">View Reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}