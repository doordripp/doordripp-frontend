// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { DollarSign, Package, Users, ShoppingCart, TrendingUp } from "lucide-react";
import adminAPI from "../../services/adminAPI";
import { formatCurrency, formatDate } from '../../utils/adminHelpers'

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState('all');
  const [bestSellersDays, setBestSellersDays] = useState(30);

  // QuickActions component placed here so it's immediately below the welcome header
  const QuickActions = () => {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button onClick={() => navigate('/admin/products')} className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">Add Product</p>
          </button>
          <button onClick={() => navigate('/admin/orders')} className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
            <ShoppingCart className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">View Orders</p>
          </button>
          <button onClick={() => navigate('/admin/users')} className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-900">Manage Users</p>
          </button>
          <button onClick={() => navigate('/admin/reports')} className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
            <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-900">View Reports</p>
          </button>
        </div>
      </div>
    );
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    adminAPI
      .getStats()
      .then((statsResponse) => {
        if (!isMounted) return;
        setStats({
          totalSales: statsResponse?.totalSales ?? 0,
          totalOrders: statsResponse?.totalOrders ?? 0,
          totalCustomers: statsResponse?.totalCustomers ?? 0,
          totalProducts: statsResponse?.totalProducts ?? 0,
          salesGrowth: statsResponse?.salesGrowth ?? '0%',
          ordersGrowth: statsResponse?.ordersGrowth ?? '0%',
          customersGrowth: statsResponse?.customersGrowth ?? '0%',
          productsGrowth: statsResponse?.productsGrowth ?? '0%'
        });
      })
      .catch(() => {
        if (!isMounted) return;
        setStats({
          totalSales: 0,
          totalOrders: 0,
          totalCustomers: 0,
          totalProducts: 0,
          salesGrowth: '0%',
          ordersGrowth: '0%',
          customersGrowth: '0%',
          productsGrowth: '0%'
        });
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      adminAPI.getOrders({ page: 1, limit: 5, status: orderStatus }),
      adminAPI.getBestSellers({ days: bestSellersDays })
    ])
      .then(([ordersResponse, bestSellersResponse]) => {
        if (!isMounted) return;

        const mappedOrders = (ordersResponse?.orders || []).map((order) => ({
          id: order.id || order._id,
          customer: order.customer || 'Unknown',
          amount: order.total || 0,
          status: order.status || 'pending',
          date: order.date
        }));

        setRecentOrders(mappedOrders);
        setTopProducts(bestSellersResponse || []);
      })
      .catch(() => {
        if (!isMounted) return;
        setRecentOrders([]);
        setTopProducts([]);
      });

    return () => {
      isMounted = false;
    };
  }, [orderStatus, bestSellersDays]);

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

      {/* Quick Actions (moved up) */}
      <QuickActions />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSales)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                {stats.salesGrowth} from last month
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                {stats.ordersGrowth} from last month
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                {stats.customersGrowth} from last month
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp size={16} className="mr-1" />
                {stats.productsGrowth} from last month
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
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className="border border-gray-200 rounded-md text-sm px-2 py-1"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">No recent orders found.</div>
            ) : (
              recentOrders.map((order, index) => (
                <div key={order.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-600">
                        <button onClick={() => navigate(`/admin/users?q=${encodeURIComponent(order.customer)}`)} className="text-blue-600 hover:underline">
                          {order.customer}
                        </button>
                      </p>
                      {order.date && (
                        <p className="text-xs text-gray-500">{formatDate(order.date)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(order.amount)}</p>
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/admin/orders')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all orders →
            </button>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Last</label>
              <select
                value={bestSellersDays}
                onChange={(e) => setBestSellersDays(Number(e.target.value))}
                className="border border-gray-200 rounded-md text-sm px-2 py-1"
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">No top selling products found.</div>
            ) : (
              topProducts.map((product, index) => (
                <div key={`${product.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
              ))
            )}
          </div>
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/admin/products')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View all products →
            </button>
          </div>
        </div>
      </div>

      
    </div>
  );
}