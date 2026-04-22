/**
 * @file client/src/pages/Admin/Analytics.jsx
 * @description Analytics page with revenue line chart, orders/day bar chart,
 * top products table, sales by category, and new users chart.
 */

import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { HiOutlineTrophy, HiOutlineCalendarDays } from 'react-icons/hi2';
import api from '../../utils/api';

/* ── Custom Tooltips ────────────────────────────────────────────────── */

function ChartTooltip({ active, payload, label, prefix = '', suffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E8C99A] rounded-xl px-4 py-3 shadow-lg">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="text-sm font-semibold" style={{ color: item.color }}>
          {prefix}{item.value?.toLocaleString('en-IN')}{suffix}
        </p>
      ))}
    </div>
  );
}

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/analytics', { params: { days: period } });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 bg-white rounded-2xl border border-[#E8C99A] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-gray-900 text-2xl font-bold">Analytics</h2>
          <p className="text-gray-500 text-sm">Overview of store performance</p>
        </div>
        <div className="flex items-center gap-2">
          <HiOutlineCalendarDays className="w-4 h-4 text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="bg-white border border-[#E8C99A] text-gray-700 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#F96D00]/30 focus:border-[#F96D00]"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last Year</option>
          </select>
        </div>
      </div>

      {/* Revenue Line Chart + Orders Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
          <h3 className="text-gray-900 font-semibold text-lg mb-1">Revenue Trend</h3>
          <p className="text-gray-500 text-sm mb-6">Daily revenue over time</p>
          {data?.revenueData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F96D00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F96D00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v?.split('-').slice(1).join('/')} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip content={<ChartTooltip prefix="₹" />} />
                <Area type="monotone" dataKey="revenue" stroke="#F96D00" fill="url(#revenueGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No revenue data</div>
          )}
        </div>

        {/* Orders per day */}
        <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
          <h3 className="text-gray-900 font-semibold text-lg mb-1">Orders per Day</h3>
          <p className="text-gray-500 text-sm mb-6">Daily order volume</p>
          {data?.revenueData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.revenueData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v?.split('-').slice(1).join('/')} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip suffix=" orders" />} />
                <Bar dataKey="orders" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No order data</div>
          )}
        </div>
      </div>

      {/* Top Products + Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
          <div className="flex items-center gap-2 mb-6">
            <HiOutlineTrophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-gray-900 font-semibold text-lg">Top Products</h3>
          </div>
          {data?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.slice(0, 8).map((product, idx) => (
                <div key={product._id || idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#FBE8CE]/50 transition-colors">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                    idx === 1 ? 'bg-gray-100 text-gray-500' :
                    idx === 2 ? 'bg-amber-100 text-amber-600' :
                    'bg-gray-50 text-gray-400'
                  }`}>
                    {idx + 1}
                  </span>
                  {product.image && (
                    <img src={product.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{product.name}</p>
                    <p className="text-gray-500 text-xs">{product.totalSold} sold</p>
                  </div>
                  <span className="text-emerald-600 text-sm font-semibold">
                    ₹{product.revenue?.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
          )}
        </div>

        {/* New Users */}
        <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
          <h3 className="text-gray-900 font-semibold text-lg mb-1">New Users</h3>
          <p className="text-gray-500 text-sm mb-6">Daily user registrations</p>
          {data?.userData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.userData}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => v?.split('-').slice(1).join('/')} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip suffix=" users" />} />
                <Area type="monotone" dataKey="users" stroke="#22C55E" fill="url(#userGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No user data</div>
          )}
        </div>
      </div>

      {/* Sales by Category Bar Chart */}
      {data?.categoryData?.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E8C99A] p-6">
          <h3 className="text-gray-900 font-semibold text-lg mb-1">Sales by Category</h3>
          <p className="text-gray-500 text-sm mb-6">Revenue breakdown by product category</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.categoryData} barSize={40} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`} />
              <YAxis type="category" dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} width={100} />
              <Tooltip content={<ChartTooltip prefix="₹" />} />
              <Bar dataKey="revenue" fill="#A855F7" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default Analytics;
