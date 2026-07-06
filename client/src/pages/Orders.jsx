/**
 * @file client/src/pages/Orders.jsx
 * @description My Orders page — displays all user orders with status badges,
 * product thumbnails, order timeline progress bar, and load-more pagination.
 * Protected route — requires login.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import {
  FaBox, FaShoppingBag, FaCheckCircle, FaTruck, FaHome,
  FaTimesCircle, FaClock, FaRedo, FaSpinner
} from 'react-icons/fa';

/** Status badge styling configuration */
const STATUS_STYLES = {
  Pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200' },
  Confirmed:  { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200' },
  Shipped:    { bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200' },
  Delivered:  { bg: 'bg-emerald-50', text: 'text-emerald-700',border: 'border-emerald-200' },
  Cancelled:  { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200' },
};

/** Order timeline steps */
const TIMELINE_STEPS = ['Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

/**
 * Get the current timeline step index based on order status.
 * @param {String} status - Order status
 * @returns {Number} Step index (0-3), -1 if Pending/Cancelled
 */
function getTimelineStep(status) {
  switch (status) {
    case 'Confirmed': return 0;
    case 'Shipped': return 1;
    case 'Delivered': return 3;
    case 'Cancelled': return -1;
    default: return -1;
  }
}

/**
 * Orders page component — displays user's order history.
 * Fetches from GET /api/orders/my-orders with pagination.
 *
 * @returns {JSX.Element} My Orders page
 */
function Orders() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  /**
   * Fetch orders from API with pagination.
   * @param {Number} pageNum - Page number to fetch
   * @param {Boolean} append - Whether to append or replace
   */
  const fetchOrders = useCallback(async (pageNum = 1, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const response = await api.get(`/orders/my-orders?page=${pageNum}&limit=5`);

      if (response.data.success) {
        if (append) {
          setOrders((prev) => [...prev, ...response.data.data]);
        } else {
          setOrders(response.data.data);
        }
        setTotalPages(response.data.totalPages);
        setTotalOrders(response.data.totalOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  /**
   * Initial fetch on mount.
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders(1);
    }
  }, [isAuthenticated, fetchOrders]);

  /**
   * Handle load more button click.
   */
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchOrders(nextPage, true);
  };

  /**
   * Handle "Buy Again" — adds all products back to cart.
   * @param {Array} products - Order products array
   */
  const handleBuyAgain = (products) => {
    products.forEach((product) => {
      addToCart({
        _id: product.productId,
        name: product.name,
        image: product.image,
        price: product.price,
        brand: product.brand,
        stock: 99,
      });
    });
  };

  /**
   * Format date string.
   * @param {String} dateStr - ISO date string
   * @returns {String} Formatted date
   */
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * Format price in Indian Rupee format.
   * @param {Number} price - Price value
   * @returns {String} Formatted price string
   */
  const formatPrice = (price) => '₹' + price.toLocaleString('en-IN');

  // ── Not logged in gate ──────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4
                      bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please login</h2>
          <p className="text-gray-500 mb-6">Login to view your orders</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
            {!loading && totalOrders > 0 && (
              <p className="text-gray-500 text-sm mt-1">{totalOrders} order{totalOrders !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-5 bg-gray-200 rounded w-20" />
                </div>
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <FaBox className="text-3xl text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
            <p className="text-gray-400 mb-6">Start shopping and your orders will appear here</p>
            <button
              onClick={() => navigate('/products')}
              className="btn-primary inline-flex items-center gap-2"
            >
              <FaShoppingBag /> Start Shopping
            </button>
          </div>
        )}

        {/* Order Cards */}
        {!loading && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <OrderCard
                key={order._id}
                order={order}
                formatDate={formatDate}
                formatPrice={formatPrice}
                onBuyAgain={handleBuyAgain}
                index={index}
              />
            ))}

            {/* Load More */}
            {page < totalPages && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 border-2 border-indigo-200 text-indigo-600 font-semibold
                             rounded-xl hover:bg-indigo-50 transition-all duration-200
                             disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  {loadingMore ? (
                    <>
                      <FaSpinner className="animate-spin" /> Loading...
                    </>
                  ) : (
                    'Load More Orders'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * OrderCard component — renders a single order card with details and timeline.
 *
 * @param {Object} props
 * @param {Object} props.order - Order data
 * @param {Function} props.formatDate - Date formatting function
 * @param {Function} props.formatPrice - Price formatting function
 * @param {Function} props.onBuyAgain - Buy again callback
 * @returns {JSX.Element} Order card
 */
function OrderCard({ order, formatDate, formatPrice, onBuyAgain, index }) {
  const statusStyle = STATUS_STYLES[order.status] || STATUS_STYLES.Pending;
  const timelineStep = getTimelineStep(order.status);
  const maxItemsToShow = 3;
  const remainingItems = order.products.length - maxItemsToShow;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden
                    hover:shadow-md transition-shadow duration-200 animate-card-entrance"
         style={{ animationDelay: `${index * 100}ms` }}>
      {/* Top Row: Order ID, Date, Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-bold text-indigo-600">{order.orderId}</span>
          <span className="text-xs text-gray-400">Placed on {formatDate(order.createdAt)}</span>
        </div>
        <span className={`px-3 py-1 text-xs font-semibold rounded-full border
                         ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}
                         ${order.status === 'Pending' ? 'animate-status-pulse' : ''}`}>
          {order.status}
        </span>
      </div>

      {/* Product List */}
      <div className="px-6 py-4">
        <div className="space-y-3">
          {order.products.slice(0, maxItemsToShow).map((product, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50">
                <img
                  src={product.image || 'https://via.placeholder.com/40x40?text=Img'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/40x40?text=Img'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-1">{product.name}</p>
                <p className="text-xs text-gray-400">× {product.qty}</p>
              </div>
              <p className="text-sm font-medium text-gray-700 flex-shrink-0">
                {formatPrice(product.price * product.qty)}
              </p>
            </div>
          ))}
          {remainingItems > 0 && (
            <p className="text-xs text-indigo-500 font-medium">+{remainingItems} more item{remainingItems > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {/* Order Timeline */}
      {order.status !== 'Cancelled' && (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50">
          <div className="flex items-center justify-between">
            {TIMELINE_STEPS.map((step, index) => {
              const isCompleted = index <= timelineStep;
              const isCurrent = index === timelineStep;
              return (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {/* Connector line */}
                  {index > 0 && (
                    <div className={`absolute top-3 -left-1/2 w-full h-0.5 -z-10
                                    ${index <= timelineStep ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                  )}
                  {/* Step circle */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs z-10
                                  ${isCompleted
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-gray-200 text-gray-400'
                                  }
                                  ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  {/* Step label */}
                  <p className={`text-[10px] mt-1.5 text-center leading-tight
                                ${isCompleted ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                    {step}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled notice */}
      {order.status === 'Cancelled' && (
        <div className="px-6 py-3 bg-red-50/50 border-t border-red-100">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <FaTimesCircle /> This order has been cancelled
          </p>
        </div>
      )}

      {/* Bottom Row: Total + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-50">
        <p className="text-base font-bold text-gray-900">
          Total: {formatPrice(order.totalAmount)}
        </p>
        <div className="flex gap-2">
          {order.status === 'Delivered' && (
            <button
              onClick={() => onBuyAgain(order.products)}
              className="px-4 py-2 text-xs font-semibold text-indigo-600 border border-indigo-200
                         rounded-xl hover:bg-indigo-50 transition-all duration-200
                         flex items-center gap-1.5"
            >
              <FaRedo className="text-[10px]" /> Buy Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Orders;
