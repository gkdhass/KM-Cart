/**
 * @file client/src/pages/Admin/Dashboard.jsx
 * @description Main admin dashboard page with stats cards, pie charts,
 * revenue bar chart, recent orders, and low stock alerts.
 * Theme: Cream/Peach (#FBE8CE) + Orange (#F96D00)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineUsers,
  HiOutlineCurrencyRupee,
  HiOutlinePlusCircle,
  HiOutlineExclamationTriangle,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../utils/api';
import StatsCard from '../../components/Admin/StatsCard';
import PieCharts from '../../components/Admin/PieCharts';

/* ── Revenue Chart Tooltip ──────────────────────────────────────────── */

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8C99A] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-gray-600 text-xs mb-1">{label}</p>
      <p className="text-black font-semibold text-sm">
        ₹{payload[0].value?.toLocaleString('en-IN')}
      </p>
    </div>
  );
}

/* ── Status Badge ───────────────────────────────────────────────────── */

const statusColors = {
  Pending: 'bg-yellow-50 text-yellow-600 border border-yellow-200',
  Processing: 'bg-blue-50 text-blue-600 border border-blue-200',
  Confirmed: 'bg-cyan-50 text-cyan-600 border border-cyan-200',
  Shipped: 'bg-purple-50 text-purple-600 border border-purple-200',
  Delivered: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pieData, setPieData] = useState({ productData: [], orderData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, pieRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/charts/piedata'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (pieRes.data.success) {
        setPieData({
          productData: pieRes.data.productData || [],
          orderData: pieRes.data.orderData || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock revenue data for bar chart (from recent orders)
  const revenueChartData = stats?.recentOrders?.map((order, i) => ({
    name: order.orderId?.slice(-4) || `#${i + 1}`,
    revenue: order.totalAmount || 0,
  }))?.reverse() || [];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-[#E8C99A] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-96 bg-white rounded-2xl border border-[#E8C99A] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={HiOutlineCube}
          color="blue"
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={HiOutlineShoppingCart}
          color="purple"
        />
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={HiOutlineUsers}
          color="green"
        />
        <StatsCard
          title="Total Revenue"
          value={stats?.totalRevenue || 0}
          icon={HiOutlineCurrencyRupee}
          color="orange"
          prefix="₹"
          format
        />
      </div>

      {/* Pie Charts */}
      <PieCharts
        productData={pieData.productData}
        orderData={pieData.orderData}
      />

      {/* Revenue Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8C99A] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-black font-semibold text-lg">Revenue Overview</h3>
              <p className="text-gray-600 text-sm">Recent order revenue</p>
            </div>
            <HiOutlineArrowTrendingUp className="w-6 h-6 text-emerald-500" />
          </div>

          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueChartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(249,109,0,0.05)' }} />
                <Bar dataKey="revenue" fill="#F96D00" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">
              No revenue data yet
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
          <h3 className="text-black font-semibold text-lg mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/admin/products/add"
              className="flex items-center gap-3 p-4 rounded-xl bg-[#FBE8CE] hover:bg-[#E8C99A] text-[#F96D00] transition-all group"
            >
              <HiOutlinePlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Add New Product</span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-all group"
            >
              <HiOutlineShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">View All Orders</span>
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-all group"
            >
              <HiOutlineUsers className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Manage Users</span>
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 transition-all group"
            >
              <HiOutlineArrowTrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">View Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-black font-semibold text-lg">Recent Orders</h3>
            <Link to="/admin/orders" className="text-[#F96D00] text-sm hover:underline">
              View All →
            </Link>
          </div>

          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[#FBE8CE]/30 border border-[#E8C99A]/50 hover:bg-[#FBE8CE] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-black text-sm font-medium">{order.orderId}</p>
                    <p className="text-gray-600 text-xs mt-0.5 truncate">
                      {order.userId?.name || 'Unknown User'}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-black text-sm font-semibold">
                      ₹{order.totalAmount?.toLocaleString('en-IN')}
                    </p>
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-50 text-gray-500'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No orders yet</p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineExclamationTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-black font-semibold text-lg">Low Stock Alerts</h3>
          </div>

          {stats?.lowStockProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockProducts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[#FBE8CE]/30 border border-[#E8C99A]/50"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-black text-sm font-medium truncate">{product.name}</p>
                    <p className="text-gray-600 text-xs">{product.category}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                    product.stock === 0
                      ? 'bg-red-50 text-red-500 border border-red-200'
                      : product.stock <= 5
                        ? 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">All products well stocked!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
