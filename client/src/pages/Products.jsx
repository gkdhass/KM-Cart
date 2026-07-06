/**
 * @file client/src/pages/Products.jsx
 * @description Products listing page with category filters, search, sort,
 * product grid with cards, toast notifications, and pagination.
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../utils/api';
import ProductCard from '../components/Products/ProductCard';
import {
  FaSearch, FaTimes, FaChevronLeft, FaChevronRight,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

/** Category definitions matching actual grocery DB categories */
const CATEGORIES = [
  { id: 'all',                   label: 'All',              icon: HiSparkles, emoji: '' },
  { id: 'Oil',                   label: 'Oil',              icon: HiSparkles, emoji: '' },
  { id: 'Masala',                label: 'Masala',           icon: HiSparkles, emoji: '' },
  { id: 'Rice & Grains',        label: 'Rice & Grains',    icon: HiSparkles, emoji: '' },
  { id: 'Pulses & Dal',         label: 'Pulses & Dal',     icon: HiSparkles, emoji: '' },
  { id: 'Spices',                label: 'Spices',           icon: HiSparkles, emoji: '' },
  { id: 'Sugar & Sweeteners',   label: 'Sugar',            icon: HiSparkles, emoji: '' },
  { id: 'Beverages',             label: 'Beverages',        icon: HiSparkles, emoji: '' },
  { id: 'Household & Cleaning', label: 'Household',        icon: HiSparkles, emoji: '' },
  { id: 'Packaged & Ready',     label: 'Packaged',         icon: HiSparkles, emoji: '' },
  { id: 'Dairy',                 label: 'Dairy',            icon: HiSparkles, emoji: '' },
  { id: 'Snacks',                label: 'Snacks',           icon: HiSparkles, emoji: '' },
  { id: 'Biscuits & Cookies',   label: 'Biscuits',         icon: HiSparkles, emoji: '' },
  { id: 'Chocolates',            label: 'Chocolates',       icon: HiSparkles, emoji: '' },
  { id: 'Juices & Drinks',      label: 'Juices',           icon: HiSparkles, emoji: '' },
  { id: 'Dry Fruits & Nuts',    label: 'Dry Fruits',       icon: HiSparkles, emoji: '' },
  { id: 'Pickles & Sauces',     label: 'Pickles',          icon: HiSparkles, emoji: '' },
  { id: 'Personal Care',         label: 'Personal Care',    icon: HiSparkles, emoji: '' },
];

/** Sort options */
const SORT_OPTIONS = [
  { value: '',           label: 'Relevance' },
  { value: 'price_asc',  label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'reviews',    label: 'Most Reviews' },
  { value: 'newest',     label: 'Newest' },
  { value: 'discount',   label: 'Biggest Discount' },
];

/**
 * Products page component.
 * @returns {JSX.Element} Products listing page
 */
function Products() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  // ── Initialize state from URL params (runs once at mount) ───────────
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [activeCategory, setActiveCategory] = useState(
    () => searchParams.get('category') || 'all'
  );
  const [searchTerm, setSearchTerm] = useState(
    () => searchParams.get('search') || ''
  );
  const [debouncedSearch, setDebouncedSearch] = useState(
    () => searchParams.get('search') || ''
  );
  const [sortBy, setSortBy] = useState('');

  // ── Toast state ─────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  // Fetch ID counter — only the latest fetch writes to state,
  // preventing stale responses from overwriting current data.
  const fetchIdRef = useRef(0);

  // ── React to URL param changes AFTER mount ──────────────────────────
  // Handles: user searches from Navbar or Home hero while already on
  // /products (the component stays mounted but URL query string changes).
  const prevUrlRef = useRef(searchParams.toString());

  useEffect(() => {
    const current = searchParams.toString();
    if (current === prevUrlRef.current) return; // no change
    prevUrlRef.current = current;

    const newSearch   = searchParams.get('search')   || '';
    const newCategory = searchParams.get('category') || 'all';

    setSearchTerm(newSearch);
    setDebouncedSearch(newSearch);
    setActiveCategory(newCategory);
    setCurrentPage(1);
  }, [searchParams]);

  // ── Debounce keyboard input (400ms) ─────────────────────────────────
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the very first render — state already initialized from URL
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Fetch products ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const id = ++fetchIdRef.current;

    const doFetch = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 12 };
        if (activeCategory !== 'all') params.category = activeCategory;
        if (debouncedSearch.trim())    params.search   = debouncedSearch.trim();
        if (sortBy)                    params.sort     = sortBy;

        const response = await api.get('/products', { params });

        // Ignore stale responses — only the latest fetch writes state
        if (cancelled || id !== fetchIdRef.current) return;

        if (response.data.success) {
          setProducts(response.data.products || []);
          setTotalCount(response.data.totalCount || 0);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        if (cancelled || id !== fetchIdRef.current) return;
        console.error('Failed to fetch products:', error);
        setProducts([]);
      } finally {
        if (!cancelled && id === fetchIdRef.current) {
          setLoading(false);
        }
      }
    };

    doFetch();
    return () => { cancelled = true; };
  }, [activeCategory, debouncedSearch, sortBy, currentPage]);

  // ── Category change handler ─────────────────────────────────────────
  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setCurrentPage(1);
  };

  // ── Sort change handler ─────────────────────────────────────────────
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // ── Toast system ────────────────────────────────────────────────────
  /**
   * Show a toast notification.
   * @param {String} message - Toast message
   */
  const showToast = (message) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  };

  /**
   * Handle Add to Cart with toast.
   * @param {Object} product - Product to add
   */
  const handleAddToCart = (product) => {
    addToCart(product);
    showToast(`✓ ${product.name} added to cart!`);
  };

  /**
   * Handle Buy Now — add to cart and navigate to checkout.
   * @param {Object} product - Product to buy
   */
  const handleBuyNow = (product) => {
    addToCart(product);
    navigate('/checkout');
  };

  /**
   * Clear all filters.
   */
  const clearFilters = () => {
    setActiveCategory('all');
    setSearchTerm('');
    setDebouncedSearch('');
    setSortBy('');
    setCurrentPage(1);
    // Clear URL search params so the reactive effect doesn't re-apply them
    navigate('/products', { replace: true });
  };

  // ── Pagination helpers ──────────────────────────────────────────────
  const startItem = (currentPage - 1) * 12 + 1;
  const endItem = Math.min(currentPage * 12, totalCount);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#F0F1FE] via-white to-[#F5F6FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Page Header ────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">🛒 All Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse fresh groceries across all categories
          </p>
        </div>

        {/* ── Category Filter Bar ────────────────────────────────── */}
        <div className="mb-5 -mx-4 px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max pb-2">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                             whitespace-nowrap transition-all duration-200 border
                              ${isActive
                                ? 'bg-[#7C8BF2] text-white border-[#7C8BF2] shadow-md shadow-indigo-200'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                              }`}
                >
                  <span className="text-sm">{cat.emoji}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Search + Sort Bar ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search input */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white
                         text-gray-900 placeholder:text-gray-400 text-sm
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20
                         outline-none transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-sm" />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700
                       text-sm outline-none focus:border-indigo-500 focus:ring-2
                       focus:ring-indigo-500/20 transition-all duration-200 min-w-[180px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* ── Results count ──────────────────────────────────────── */}
        {!loading && totalCount > 0 && (
          <p className="text-xs text-gray-400 mb-4">
            Showing {startItem}–{endItem} of {totalCount.toLocaleString('en-IN')} products
            {debouncedSearch && (
              <span> for "<strong className="text-gray-600">{debouncedSearch}</strong>"</span>
            )}
          </p>
        )}

        {/* ── Loading Skeleton ───────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-5 bg-gray-200 rounded w-1/3" />
                  <div className="flex gap-2">
                    <div className="h-9 bg-gray-200 rounded-xl flex-1" />
                    <div className="h-9 bg-gray-200 rounded-xl flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Empty State ────────────────────────────────────────── */}
        {!loading && products.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-2xl text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-400 text-sm mb-1">
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : 'No products in this category yet'
              }
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Try a different category or search term
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold
                         rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* ── Product Grid ───────────────────────────────────────── */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ─────────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600
                         hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              <FaChevronLeft className="text-sm" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200
                             ${pageNum === currentPage
                               ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                               : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                             }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600
                         hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors"
            >
              <FaChevronRight className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {/* ── Toast Notifications ──────────────────────────────────── */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-[#7C8BF2] text-white px-4 py-3 rounded-xl shadow-lg
                       text-sm font-medium animate-fade-in max-w-xs"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Products;
