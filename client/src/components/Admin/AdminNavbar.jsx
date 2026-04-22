/**
 * @file client/src/components/Admin/AdminNavbar.jsx
 * @description Top navigation bar for the admin dashboard.
 * Features mobile hamburger toggle, search, notifications dropdown, and admin profile.
 * Theme: Cream/Peach (#FBE8CE) + Orange (#F96D00)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingCart,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineXMark,
} from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function AdminNavbar({ onToggleSidebar, title = 'Dashboard' }) {
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  /** Fetch notifications from real data (recent orders + low stock) */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notifs = [];

      // Fetch recent orders
      try {
        const ordersRes = await api.get('/admin/orders', { params: { page: 1, limit: 5 } });
        if (ordersRes.data.success) {
          ordersRes.data.orders.forEach((order) => {
            const isNew = (Date.now() - new Date(order.createdAt).getTime()) < 24 * 60 * 60 * 1000; // last 24h
            notifs.push({
              id: `order-${order._id}`,
              type: 'order',
              icon: <HiOutlineShoppingCart className="w-4 h-4" />,
              iconBg: 'bg-blue-100 text-blue-600',
              title: `New Order ${order.orderId || ''}`,
              message: `${order.userId?.name || 'Customer'} — ₹${order.totalAmount?.toLocaleString('en-IN') || '0'}`,
              time: formatTimeAgo(order.createdAt),
              isNew,
            });
          });
        }
      } catch (e) {
        // silently skip
      }

      // Fetch low stock products
      try {
        const productsRes = await api.get('/admin/products', { params: { page: 1, limit: 100 } });
        if (productsRes.data.success) {
          const lowStock = productsRes.data.products.filter((p) => p.stock <= 5 && p.stock > 0);
          const outOfStock = productsRes.data.products.filter((p) => p.stock === 0);

          outOfStock.slice(0, 3).forEach((p) => {
            notifs.push({
              id: `oos-${p._id}`,
              type: 'alert',
              icon: <HiOutlineExclamationTriangle className="w-4 h-4" />,
              iconBg: 'bg-red-100 text-red-600',
              title: 'Out of Stock',
              message: p.name,
              time: 'Action needed',
              isNew: true,
            });
          });

          lowStock.slice(0, 3).forEach((p) => {
            notifs.push({
              id: `low-${p._id}`,
              type: 'warning',
              icon: <HiOutlineExclamationTriangle className="w-4 h-4" />,
              iconBg: 'bg-yellow-100 text-yellow-700',
              title: `Low Stock (${p.stock} left)`,
              message: p.name,
              time: 'Restock soon',
              isNew: true,
            });
          });
        }
      } catch (e) {
        // silently skip
      }

      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => n.isNew).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /** Format time ago */
  function formatTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  /** Fetch on first open */
  useEffect(() => {
    if (notifOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [notifOpen, notifications.length, fetchNotifications]);

  /** Close dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Mark all as read */
  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isNew: false })));
    setUnreadCount(0);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#E4DFB5] border-b border-[#E8C99A]">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-[#E8C99A] rounded-lg transition-colors"
          >
            <HiOutlineBars3 className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-gray-900 font-semibold text-lg">{title}</h2>
            <p className="text-gray-600 text-xs hidden sm:block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Right: Search + Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center bg-white/60 rounded-xl px-3 py-2 border border-[#E8C99A] focus-within:border-[#F96D00] transition-colors">
            <HiOutlineMagnifyingGlass className="w-4 h-4 text-gray-600 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none w-40 lg:w-56"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotifOpen((prev) => !prev)}
              className="relative p-2 text-gray-700 hover:text-gray-900 hover:bg-[#E8C99A] rounded-xl transition-colors"
            >
              <HiOutlineBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-[#E4DFB5] text-[8px] text-white flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E8C99A] overflow-hidden z-50 animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E8C99A] bg-[#FBE8CE]/50">
                  <h3 className="text-gray-900 font-semibold text-sm">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-[#F96D00] hover:text-[#E86500] font-medium transition-colors"
                      >
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    >
                      <HiOutlineXMark className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="max-h-80 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3 animate-pulse">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-3/4" />
                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <HiOutlineCheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm font-medium">All caught up!</p>
                      <p className="text-gray-400 text-xs mt-1">No new notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-[#FBE8CE]/30 transition-colors ${
                          notif.isNew ? 'bg-orange-50/40' : ''
                        }`}
                      >
                        {/* Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.iconBg}`}>
                          {notif.icon}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 text-sm font-medium">{notif.title}</p>
                          <p className="text-gray-500 text-xs truncate">{notif.message}</p>
                        </div>
                        {/* Time */}
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-gray-400 text-[10px]">{notif.time}</span>
                          {notif.isNew && (
                            <span className="w-2 h-2 bg-[#F96D00] rounded-full mt-1" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-4 py-2.5 border-t border-[#E8C99A] bg-[#FBE8CE]/30 text-center">
                    <button
                      onClick={fetchNotifications}
                      className="text-xs text-[#F96D00] hover:text-[#E86500] font-medium transition-colors"
                    >
                      Refresh notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-[#E8C99A]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F96D00] to-[#E86500] flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block">
              <p className="text-gray-900 text-sm font-medium leading-tight">{user?.name || 'Admin'}</p>
              <p className="text-gray-600 text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;
